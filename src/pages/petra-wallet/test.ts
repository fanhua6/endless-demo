import { Network, EntryFunctionABI, TypeTagU64, InputGenerateTransactionPayloadData  } from 'endless-ts-sdk'
import { EndlessJsSdk } from 'endless-web3-sdk'

interface EndlessSignAndSubmitTransactionInput {
  gasUnitPrice?: number;  // defaults to estimated gas unit price
  maxGasAmount?: number;  // defaults to estimated max gas amount
  payload: InputGenerateTransactionPayloadData; // the transaction payload
}

const main = async () => {
  const jssdk = new EndlessJsSdk({
    network: Network.TESTNET
  })

  const transferEDSAbi: EntryFunctionABI = {
    typeParameters: [],
    parameters: [ new TypeTagU64() ]
  }

  const data: EndlessSignAndSubmitTransactionInput  = {
    payload: {
      function: '0x4::permutation::shuffle',
      functionArguments: [ 100 ],   // 随机个数 如100个
      abi: transferEDSAbi
    }
  }

  // 调用钱包SDK发送交易
  const result = await jssdk.signAndSubmitTransaction(data)

  console.log(result)
}

main()