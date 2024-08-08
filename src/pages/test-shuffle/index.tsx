import { useState, useEffect } from 'react'
import { 
  Network,
  EntryFunctionABI,
  TypeTagU64,
  Endless,
  EndlessConfig,
  UserTransactionResponse,
  Ed25519PrivateKey,
  Account
} from 'endless-ts-sdk'
import { EndlessJsSdk, EndlessSignAndSubmitTransactionInput, UserResponseStatus } from 'endless-web3-sdk'
import {
  Box,
  VStack,
  Select,
  Input,
  Button,
  HStack
} from '@chakra-ui/react'


const TestShuffle = () => {
  const [ accountAddress, setAccountAddress ] = useState('')
  const [ currentNetwork, setCurrentNetwork ] = useState<Network>(Network.LOCAL)
  const [ randonNumber, setRandomNumber ] = useState(50)
  const [ hash, setHash ] = useState('')
  const [ randomList, setRandomList ] = useState([])
  const [ jssdk, setJssdk ] = useState(new EndlessJsSdk({
    network: currentNetwork,
  }))

  // const jssdk = useMemo(() => {
  //   return new EndlessJsSdk({
  //     network: currentNetwork,
  //   })
  // }, [ currentNetwork ])

  const connectWalletHandler = async () => {
    console.log(jssdk, currentNetwork)
    const connectRes = await jssdk.connect()
    if(connectRes.status === UserResponseStatus.APPROVED) {
      setAccountAddress(connectRes.args.account.toBs58String())
    }else{
      alert('connect failed')
    }
  }

  const submitHandler = async () => { 
    if(!accountAddress) {
      alert('Please connect wallet first')
      return
    }
    const transferEDSAbi: EntryFunctionABI = {
      typeParameters: [],
      parameters: [ new TypeTagU64() ]
    }

    const transferData: EndlessSignAndSubmitTransactionInput = {
      payload: {
        function: '0xe9935feeb09708f0c1cf151be62b88c608e593f5888dbf874b607c92773e8946::game::shuffle',
        functionArguments: [ randonNumber ],   // 随机个数 如100个
        abi: transferEDSAbi
      }
    }

    const res = await jssdk.signAndSubmitTransaction(transferData)
    if(res.status === UserResponseStatus.APPROVED) {
      setHash(res.args.hash)

      const config = new EndlessConfig({
        network: Network.TESTNET,
      })

      const endless = new Endless(config)

      const transaction = await endless.getTransactionByHash({ transactionHash: res.args.hash }) as UserTransactionResponse

      if(transaction) {
        const randomList = transaction.events.filter((e) => e.type === '0xe9935feeb09708f0c1cf151be62b88c608e593f5888dbf874b607c92773e8946::game::Shuffled')[0].data.data
        console.log('randomList', randomList)
        setRandomList(randomList)
      }
    }
    console.log('res', res)
  }

  const noWalletShuffleHandler = async () => {
    const privateKey = new Ed25519PrivateKey('0x905d4ee6f651447962fcc72a19274a5e9030e4df9430ccb84c09d3f773da6c6d')
    const account = Account.fromPrivateKey({ privateKey })

    const config = new EndlessConfig({
      network: Network.TESTNET,
    })

    const endless = new Endless(config)

    const transferEDSAbi: EntryFunctionABI = {
      typeParameters: [],
      parameters: [ new TypeTagU64() ]
    }

    const transaction = await endless.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: '0xe9935feeb09708f0c1cf151be62b88c608e593f5888dbf874b607c92773e8946::game::shuffle',
        functionArguments: [ randonNumber ],   // 随机个数 如100个
        abi: transferEDSAbi
      }
    })

    const transferEDSTransaction = await endless.signAndSubmitTransaction({
      signer: account,
      transaction: transaction,
    })

    console.log('transferEDSTransaction', transferEDSTransaction)
    if(transferEDSTransaction.hash) {
      setHash(transferEDSTransaction.hash)

      const txn = await endless.getTransactionByHash({ transactionHash: transferEDSTransaction.hash }) as UserTransactionResponse
      
      if(txn) {
        const randomList = txn.events.filter((e) => e.type === '0xe9935feeb09708f0c1cf151be62b88c608e593f5888dbf874b607c92773e8946::game::Shuffled')[0].data.data
        console.log('randomList', randomList)
        setRandomList(randomList)
      }
    }
  }

  useEffect(() => {
    setJssdk(new EndlessJsSdk({
      network: currentNetwork,
    }))
  }, [ currentNetwork ])

  return (
    <VStack spacing='20px'>
      <h1>Test Shuffle</h1>
      <Box
        sx={{
          margin: '20px 12px'
        }}
      >
        accountAddress: { accountAddress }
      </Box>
      <HStack spacing='10px'>
        <Button onClick={ connectWalletHandler }>
          connect
        </Button>
        <Button onClick={ () => jssdk.open() }>
          open
        </Button>
      </HStack>
      <Box>
        network: 
        <Select value={currentNetwork} onChange={(e) => setCurrentNetwork(e.target.value as Network)}>
          <option value={ Network.TESTNET }>{ Network.TESTNET }</option>
          <option value={ Network.LOCAL }>{ Network.LOCAL }</option>
        </Select>
      </Box>

      <HStack spacing='10px'>
        <Input type="text" 
          placeholder='Please enter a random number' 
          width={ 300 } 
          value={ randonNumber }
          onChange={(e) => setRandomNumber(Number(e.target.value)) }
        />
        <Button
          onClick={ submitHandler }
        >Shuffle</Button>
        <Button
          onClick={ noWalletShuffleHandler }
        >
          no wallet shuffle
        </Button>
      </HStack>

      <Box>
        hash: { hash }
      </Box>

      <Box>
        randomList: { '[ ' + randomList.toString() + ' ]' }
      </Box>
    </VStack>
  )
}

export default TestShuffle; // eslint-disable-line