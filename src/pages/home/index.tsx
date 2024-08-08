import { useState } from 'react'
import {
  Box,
  Button,
  HStack,
  Input
} from '@chakra-ui/react'

import { Network, AccountAddress, Signature, AnyRawTransaction, InputGenerateTransactionPayloadData, EntryFunctionABI, TypeTagAddress, TypeTagU64 } from 'endless-ts-sdk'

enum UserResponseStatus {
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export interface UserApproval<TResponseArgs> {
 status: UserResponseStatus.APPROVED
 args: TResponseArgs
}

export interface UserRejection {
 status: UserResponseStatus.REJECTED
}

export type UserResponse<TResponseArgs> = UserApproval<TResponseArgs> | UserRejection;

export interface AccountInfo { account: AccountAddress, ansName?: string }

export interface NetworkInfo {
  name: Network
  chainId: number
  url?: string
}

export type EndlessSignMessageInput = {
  address?: boolean
  application?: boolean
  chainId?: boolean
  message: string
  nonce?: string
}

export type EndlessSignMessageOutput = {
  address?: string
  application?: string
  chainId?: number
  fullMessage: string
  publicKey: string
  message: string
  nonce: string
  prefix: 'Endless'
  signature: Signature
}

interface EndlessSignAndSubmitTransactionInput {
  gasUnitPrice?: number;  // defaults to estimated gas unit price
  maxGasAmount?: number;  // defaults to estimated max gas amount
  payload: InputGenerateTransactionPayloadData; // the transaction payload
}

interface IWallet {
  connect: (silent?: boolean, network?: Network) => Promise<UserResponse<AccountInfo>>;
  disconnect: () => Promise<void>;
  getAccount: () => Promise<UserResponse<AccountInfo>>;
  getNetwork: () => Promise<UserResponse<NetworkInfo>>;
  signTransaction: (transaction: AnyRawTransaction) => Promise<UserResponse<EndlessSignMessageOutput>>;
  signMessage: (message: EndlessSignMessageInput) => Promise<UserResponse<EndlessSignMessageOutput>>;
  onAccountChange: (newAccount: AccountInfo) => Promise<void>;
  onNetworkChange: (newNetwork: NetworkInfo) => Promise<void>;
  signAndSubmitTransaction: (endlessSignAndSubmitTransactionInput:EndlessSignAndSubmitTransactionInput) => Promise<UserResponse<{hash:string}>>;
  changeNetwork: (network:NetworkInfo) => Promise<UserResponse<{success: boolean, reason?: string}>>;
  openInMobileApp: () => void
}

declare global {
  interface Window {
    endlessWallet: IWallet,
    okxwallet: {
      aptos: IWallet
    }
  }
}

const HomePage = () => {
  const [ accountAddress, setAccountAddress ] = useState('')
  const [ signMessage, setSignMessage ] = useState('')
  const [ signature, setSignature ] = useState('')
  const [ toAccountAddress, setToAccountAddress ] = useState('')
  const [ transferAmount, setTransferAmount ] = useState('')
  const [ transferTxHash, setTransferTxHash ] = useState('')

  const wallet = 'endlessWallet' in window ? window.okxwallet.aptos : null

  const connectWallet = async () => {
    if(wallet){
      // const connectRes = await wallet.connect(false, Network.TESTNET) // connect to testnet Petra Aptos wallet
      const connectRes = await wallet.connect() // connect to mainnet
      console.log(connectRes)
      if(connectRes.status === UserResponseStatus.APPROVED) {
        setAccountAddress(connectRes.args.account.toBs58String())
      }
    }
  }

  const disconnectWalletHandler = () => {
    if(wallet) {
      wallet.disconnect().then(() => {
        console.log('disconnect success')
        setAccountAddress('')
      })
    }
  }

  const getAccount = async () => {
    if(wallet){
      const getAccountRes = await wallet.getAccount()
      if(getAccountRes.status === UserResponseStatus.APPROVED) {
        console.log('getAccountRes =====>',getAccountRes.args.account.toBs58String())
      }
    }
  }

  const signMessageHandler = async () => {
    if(!wallet) {
      return
    }
    if(!signMessage){
      alert('please input message')
      return
    }
    if(!accountAddress) {
      alert('please connect wallet')
      return
    }
    setSignature('')
    const signMessageRes = await wallet.signMessage({ message: signMessage })

    if(signMessageRes.status === UserResponseStatus.APPROVED) { 
      setSignature(signMessageRes.args.signature.toString())
    }else {
      alert('signMessage failed')
    }
    setSignMessage('')
  }

  const signAndSubmitTrancactionHandler = async () => {
    if(!wallet) {
      return
    }

    if(!accountAddress) {
      alert('please connect wallet')
      return
    }

    if(!toAccountAddress || !transferAmount) {
      alert('please input toAccountAddress and transferAmount')
      return
    }

    const transferEDSAbi: EntryFunctionABI = {
      typeParameters: [],
      parameters: [ new TypeTagAddress(), new TypeTagU64() ]
    }

    const transferData: EndlessSignAndSubmitTransactionInput = {
      payload: {
        function: '0x1::endless_account::transfer',
        functionArguments: [
          AccountAddress.fromBs58String(toAccountAddress),
          BigInt(parseInt(transferAmount)*100000000),
        ],
        abi: transferEDSAbi,
      }
    }
    
    const transactionRes = await wallet.signAndSubmitTransaction(transferData)
    console.log('transactionRes =====>',transactionRes)
    if(transactionRes.status === UserResponseStatus.APPROVED) {
      setTransferTxHash(transactionRes.args.hash)
    }
  }

  return (
    <Box>
      <h1>Test Endless Wallet</h1>
      <Box>
        Is the wallet ready: { wallet ? 'true' : 'false' } (window.endlessWallet)
      </Box>
      <Box
        sx={{
          margin: '20px 12px'
        }}
      >
        accountAddress: { accountAddress }
      </Box>
      <HStack spacing='12px'>
        <Button colorScheme='blue'
          onClick={ connectWallet }
        >
          Connect Wallet
        </Button>
        <Button colorScheme='blue' onClick={ disconnectWalletHandler }>
          disconnect wallet
        </Button>
        <Button colorScheme='blue'
          onClick={ getAccount }
        >
          getAccount
        </Button>
      </HStack>
      
      <Box sx={{ width: '370px' }}>
        <p>signMessage: { signature }</p>
        <Box sx={{ margin: '20px' }}>
          <Input placeholder='message' 
            onChange={ (e) => setSignMessage(e.target.value) }
            value={ signMessage }
          />
        </Box>
        <Button colorScheme='blue' 
          onClick={ signMessageHandler }
        >
          signMessage
        </Button>
      </Box>

      <Box sx={{ width: '370px' }}>
        <p>signAndSubmitTransaction: { transferTxHash }</p>
        <Box sx={{ margin: '20px' }}>
          <Input placeholder='toAddress' 
            onChange={ (e) => setToAccountAddress(e.target.value) }
            value={ toAccountAddress }
          />
        </Box>
        <Box sx={{ margin: '20px' }}>
          <Input placeholder='amount' 
            onChange={ (e) => setTransferAmount(e.target.value) }
            value={ transferAmount }
          />
        </Box>
        <Button colorScheme='blue'
          onClick={ signAndSubmitTrancactionHandler }
        >
          submit transaction
        </Button>
      </Box>
    </Box>
  )
}

export default HomePage