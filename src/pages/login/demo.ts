
import { Network, Signature, AnyRawTransaction, InputGenerateTransactionPayloadData, EndlessConfig, Endless, AccountAddress } from 'endless-ts-sdk'

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
  nonce: string
}

export type EndlessSignMessageOutput = {
  address?: string
  application?: string
  chainId?: number
  fullMessage: string
  message: string
  nonce: string
  prefix: 'APTOS'
  signature: Signature
}

interface EndlessSignAndSubmitTransactionInput {
  gasUnitPrice?: number;  // defaults to estimated gas unit price
  maxGasAmount?: number;  // defaults to estimated max gas amount
  payload: InputGenerateTransactionPayloadData; // the transaction payload
}

interface IWallet {
  connect: (silent?: boolean, network?: Network) => Promise<UserResponse<AccountInfo>>;
  disconnect(): Promise<void>;
  getAccount(): Promise<UserResponse<AccountInfo>>;
  getNetwork(): Promise<UserResponse<NetworkInfo>>;
  signTransaction(transaction: AnyRawTransaction): (transaction: AnyRawTransaction) => Promise<UserResponse<EndlessSignMessageOutput>>;
  signMessage(message: EndlessSignMessageInput): (message: EndlessSignMessageInput) => Promise<UserResponse<EndlessSignMessageOutput>>;
  onAccountChange(newAccount: AccountInfo): (newAccount: AccountInfo) => Promise<void>;
  onNetworkChange(newNetwork: NetworkInfo): (newNetwork: NetworkInfo) => Promise<void>;
  signAndSubmitTransaction(endlessSignAndSubmitTransactionInput: EndlessSignAndSubmitTransactionInput): (endlessSignAndSubmitTransactionInput: EndlessSignAndSubmitTransactionInput) => Promise<UserResponse<{ hash: string }>>;
  changeNetwork(network: NetworkInfo): (network: NetworkInfo) => Promise<UserResponse<{ success: boolean, reason?: string }>>;
  openInMobileApp(): () => void
}

declare global {
  interface Window {
    wallet1: IWallet
  }
}

const main = async () => {
  if ('wallet1' in window) {
    const wallet1 = window.wallet1

    const accountInfo = await wallet1.connect(true, Network.TESTNET) // connect to testnet
    console.log('accountInfo =====> ', accountInfo)

    const getAccount = await wallet1.getAccount()
    console.log('getAccount =====> ', getAccount)

    const getNetwork = await wallet1.getNetwork()
    console.log('getNetwork =====> ', getNetwork)

    const config = new EndlessConfig({
      network: Network.TESTNET,
    })

    const endless = new Endless(config)

    const account = getAccount.status === UserResponseStatus.APPROVED ? getAccount.args.account : ''

    const amount = 1

    const toAddress = 'EFhW3BjZsfmCMcPUAvjx1qSAkedLe9HJwXEKhLHk9aS9'

    const transaction = await endless.transaction.build.simple({
      sender: account,
      data: {
        function: '0x1::endless_account::transfer',
        functionArguments: [
          AccountAddress.fromBs58String(toAddress),
          BigInt(amount * 100000000),
        ],
      }
    })

    const signTransaction = await wallet1.signTransaction(transaction) // sign a transaction
    console.log('signTransaction =====> ', signTransaction)

    const signAndSubmitTransaction = await wallet1.signAndSubmitTransaction({
      payload: {
        function: '0x1::endless_account::transfer',
        functionArguments: [
          AccountAddress.fromBs58String(toAddress),
          BigInt(amount * 100000000),
        ],
      }
    }) // sign and submit a transaction
    console.log('signAndSubmitTransaction =====> ', signAndSubmitTransaction)

    const changeNetwork = await wallet1.changeNetwork({
      name: Network.DEVNET,
      chainId: 4
    }) // change network

    console.log('changeNetwork =====> ', changeNetwork)
  }
}

main();