import { useState, useEffect } from 'react'
import {
  Box,
  HStack,
  Button,
  Input
} from '@chakra-ui/react'
import { 
  Network, 
  EntryFunctionABI,
  TypeTagAddress,
  TypeTagU64,
  AccountAddress,
} from 'endless-ts-sdk'

import { 
  EndlessJsSdk, 
  UserResponseStatus, 
  EndlessSignAndSubmitTransactionInput, 
  MethodName
} from 'endless-web3-sdk'

const jssdk = new EndlessJsSdk({ 
  network: Network.TESTNET
})


const WalletH5Demo = () => {
  const [ accountAddress, setAccountAddress ] = useState('')
  const [ signMessage, setSignMessage ] = useState('')
  const [ signature, setSignature ] = useState('')
  const [ toAccountAddress, setToAccountAddress ] = useState('')
  const [ transferAmount, setTransferAmount ] = useState('')
  const [ transferTxHash, setTransferTxHash ] = useState('')

  const connectWalletHandler = async () => {
    const connectRes = await jssdk.connect()
    console.log('connectRes', connectRes)
    if(connectRes.status === UserResponseStatus.APPROVED) {
      setAccountAddress(connectRes.args.account.toBs58String())
    }else{
      alert('connect failed')
    }
  }

  const disconnectWalletHandler = () => {
    jssdk.disconnect().then(() => {
      console.log('disconnect success')
      setAccountAddress('')
    })
  }

  const getAccountHandler = async () => {
    const getAccountRes = await jssdk.getAccount()
    console.log('getAccountRes', getAccountRes)
    if(getAccountRes.status === UserResponseStatus.APPROVED) {
      console.log('getAccountRes =====>',getAccountRes.args.account.toBs58String())
      setAccountAddress(getAccountRes.args.account.toBs58String())
    }
  }

  const signMessageHandler = async () => {
    if(!signMessage){
      alert('please input message')
      return
    }
    if(!accountAddress) {
      alert('please connect wallet')
      return
    }
    setSignature('')
    const signMessageRes = await jssdk.signMessage({ message: signMessage })

    if(signMessageRes.status === UserResponseStatus.APPROVED) { 
      setSignature(signMessageRes.args.signature.toString())
    }else {
      alert('signMessage failed')
    }
    setSignMessage('')
  }

  const signAndSubmitTrancactionHandler = async () => {
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
    console.log('transferData =====>',transferData)
    const transactionRes = await jssdk.signAndSubmitTransaction(transferData)
    console.log('transactionRes =====>',transactionRes)
    if(transactionRes.status === UserResponseStatus.APPROVED) {
      setTransferTxHash(transactionRes.args.hash)
    }else{
      alert('signAndSubmitTransaction failed')
    }
  }

  useEffect(() => {
    jssdk.onAccountChange((accountAddress) => {
      console.log('onAccountChange', accountAddress)
      if(accountAddress.account) {
        setAccountAddress(accountAddress.account.toBs58String())
      }
    })

    jssdk.on(MethodName.CONNECT, res => console.log('connect', res))
    jssdk.on(MethodName.GETACCOUNT, res => console.log('getAccount', res))
  }, [])

  return (
    <Box>
      Wallet H5 Demo
      <Box
        sx={{
          margin: '20px 12px'
        }}
      >
        accountAddress: { accountAddress }
      </Box>

      <HStack spacing='12px' sx={{
          margin: '20px 12px'
        }}>
        <Button onClick={ connectWalletHandler }>
          connect
        </Button>
        <Button onClick={ disconnectWalletHandler }>
          disconnect
        </Button>
        <Button onClick={ getAccountHandler }>
          getAccount
        </Button>
        <Button onClick={ () => jssdk.open() }>
          open
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
        <Button onClick={ signMessageHandler }>
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
        <Button onClick={ signAndSubmitTrancactionHandler }>
          submit transaction
        </Button>
      </Box>
    </Box>
  )
}

export default WalletH5Demo