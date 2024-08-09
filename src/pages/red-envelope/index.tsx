import { useEffect, useState } from 'react'

import {
  Box,
  VStack,
  Checkbox,
  Input,
  Button,
  HStack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb
} from '@chakra-ui/react'

import {
  Network,
  EntryFunctionABI,
  TypeTagBool,
  TypeTagU64,
  TypeTagVector,
  AccountAddress,
  Endless,
  EndlessConfig,
  UserTransactionResponse,
  TypeTagAddress
} from 'endless-ts-sdk'

import {
  EndlessJsSdk,
  UserResponseStatus,
  EndlessSignAndSubmitTransactionInput,
} from 'endless-web3-sdk'

import DatePicker from 'react-datepicker'
import AccountCheckbox from '../../components/accountCheckbox'
import { RED_ENVELOPE_ADDRESS } from '../../constants'
import { addressToU64 } from '../../utils'
import { users as data } from '../../assets/data/users'
import dayjs from 'dayjs'

const jssdk = new EndlessJsSdk({
  network: Network.TESTNET
})

const config = new EndlessConfig({
  network: Network.TESTNET,
})

const endless = new Endless(config)

const defaultValue = data.map(user => user.address)

const RedEnvelope = () => {

  const [amount, setAmount] = useState('')
  const [isAverage, setIsAverage] = useState(false)
  const [accountAddress, setAccountAddress] = useState('')
  const [endTime, setEndTime] = useState(dayjs().add(1, 'day').toDate())
  const [sendRedEnvelopeTxnHash, setSendRedEnvelopeTxnHash] = useState('')
  const [redEnvelopeAddress, setRedEnvelopeAddress] = useState('')
  const [users, setUsers] = useState<string[]>(defaultValue)
  const [count, setCount] = useState(users.length)
  const [returnRedEnvelopeAddress, setReturnRedEnvelopeAddress] = useState('')
  
  const connectWalletHandler = async () => {
    const connectRes = await jssdk.connect()
    console.log('connectRes', connectRes)
    if (connectRes.status === UserResponseStatus.APPROVED) {
      setAccountAddress(connectRes.args.account.toBs58String())
    } else {
      alert('connect failed')
    }
  }

  const disconnectWalletHandler = () => {
    jssdk.disconnect().then(() => {
      console.log('disconnect success')
      setAccountAddress('')
    })
  }

  // const createAccountHandler = async (count: number) => {
  //   for(let i = 0; i < count; i++) {
  //     // TODO: create red envelope
  //     const account = Account.generate()
  //     console.log('account address', account.accountAddress.toBs58String())
  //     console.log('account private key', account.privateKey.toString())
  //   }
  // }

  const getAccountHandler = async () => {
    const getAccountRes = await jssdk.getAccount()
    console.log('getAccountRes', getAccountRes)
    if (getAccountRes.status === UserResponseStatus.APPROVED) {
      console.log('getAccountRes =====>', getAccountRes.args.account.toBs58String())
      setAccountAddress(getAccountRes.args.account.toBs58String())
    }
  }

  const changeDateHandler = (date: Date | null) => {
    if (!date) return
    setEndTime(date)
  }

  const getRedEnvelopeAddress = async (txnHash: string) => {
    try {
      const txn = await endless.getTransactionByHash({ transactionHash: txnHash }) as UserTransactionResponse

      if (txn.success) {
        const redEnvelopeAddress = txn.events.filter((e) => e.type.endsWith('::lucky_box::Packing'))[0].data.id
        console.log(redEnvelopeAddress, '====>', txn)
        setRedEnvelopeAddress(redEnvelopeAddress)
      } else {
        alert('Red envelope sending failed !')
      }
    } catch (error) {
      setTimeout(() => {
        getRedEnvelopeAddress(txnHash)
      }, 500)
    }
  }

  const signAndSubmitTrancactionHandler = async () => {
    if (!accountAddress) {
      alert('please connect wallet')
      return
    }

    if (!amount || !count) {
      alert('please input amount and count')
      return
    }

    const transferEDSAbi: EntryFunctionABI = {
      typeParameters: [],
      parameters: [
        new TypeTagU64(),
        new TypeTagU64(),
        new TypeTagBool(),
        new TypeTagU64(),
        new TypeTagVector(new TypeTagU64()),
      ]
    }

    const addresses = users.map(user => {
      const add = AccountAddress.fromBs58String(user)
      return addressToU64(add)
    })

    const transferData: EndlessSignAndSubmitTransactionInput = {
      payload: {
        function: `${RED_ENVELOPE_ADDRESS}pack`,
        functionArguments: [
          Math.floor(parseFloat(amount) * 100000000),
          count,
          !isAverage,
          Math.floor(endTime.getTime() / 1000),
          addresses,
        ],
        abi: transferEDSAbi,
      }
    }
    console.log('transferData =====>', transferData)
    const transactionRes = await jssdk.signAndSubmitTransaction(transferData)
    console.log('transactionRes =====>', transactionRes)
    if (transactionRes.status === UserResponseStatus.APPROVED) {
      console.log('transactionRes =====>', transactionRes.args.hash)
      setSendRedEnvelopeTxnHash(transactionRes.args.hash)
      setTimeout(() => {
        getRedEnvelopeAddress(transactionRes.args.hash)
      }, 1000)
    } else {
      console.error('Red envelope sending failed!', transactionRes)
    }
  }

  const returnRedEnvelopeHandler = async () => {

    if (!returnRedEnvelopeAddress) {
      alert('please input return Red Envelope Address')
    } else {
      const transferEDSAbi: EntryFunctionABI = {
        typeParameters: [],
        parameters: [new TypeTagAddress()]
      }

      const transferData: EndlessSignAndSubmitTransactionInput = {
        payload: {
          function: `${RED_ENVELOPE_ADDRESS}refund`,
          functionArguments: [
            returnRedEnvelopeAddress
          ],
          abi: transferEDSAbi,
        }
      }

      const transactionRes = await jssdk.signAndSubmitTransaction(transferData)

      if (transactionRes.status === UserResponseStatus.APPROVED) {
        console.log('transactionRes =====>', transactionRes.args.hash)
      } else {
        console.error('signAndSubmitTransaction failed', transactionRes)
      }
    }
  }

  const test = async () => {
    const txn = await endless.getTransactionByHash({ transactionHash: '0x13182a003c9d06668bb534de4ed853a2e4de016d493bdb617b7d06a904f627bf' }) as UserTransactionResponse
    console.log('txn =====>', txn)
  }

  useEffect(() => {
    test()
  }, [])

  return (
    <VStack spacing='20px'>
      <h1>Red Envelope</h1>
      <Box
        sx={{
          margin: '20px 12px'
        }}
      >
        accountAddress: {accountAddress}
      </Box>
      <Box
        sx={{
          margin: '20px 12px'
        }}
      >
        sendRedEnvelopeTxnHash: <a href={`https://scan.endless.link/txn/${sendRedEnvelopeTxnHash}/userTxnOverview?network=testnet`} target='_blank'>{sendRedEnvelopeTxnHash}</a>
      </Box>
      <HStack spacing='12px' sx={{
        margin: '20px 12px'
      }}>
        <Button onClick={connectWalletHandler}>
          connect
        </Button>
        <Button onClick={disconnectWalletHandler}>
          disconnect
        </Button>
        <Button onClick={getAccountHandler}>
          getAccount
        </Button>
        <Button onClick={() => jssdk.open()}>
          open
        </Button>
        {/* <Button onClick={ () => createAccountHandler(10) }>
          create 10 account
        </Button> */}
      </HStack>

      <Box sx={{ width: '700px' }}>

        <AccountCheckbox
          onChange={(e) => {
            setUsers(e)
            setCount(e.length)
          }}
          redEnvelopeAddress={redEnvelopeAddress}
          defaultValue={defaultValue}
        />
        <HStack sx={{ margin: '20px' }}>
          <Input placeholder='lucky box amount'
            onChange={(e) => setAmount(e.target.value)}
            value={amount}
          />
          <Box>EDS</Box>
        </HStack>
        <Box sx={{ margin: '20px' }}>
          {/* <Input placeholder='lucky box count'
            value={count}
            readOnly
          /> */}
          <Box>Lucky Box count: { count }</Box>
          <Slider aria-label='slider-ex-1' 
            defaultValue={ users.length } 
            min={1} 
            max={ users.length } 
            value={ count }
            step={1}
            onChange={ (e) => setCount(e) }
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </Box>
        <Box sx={{ margin: '20px' }}>
          <DatePicker
            showIcon
            showTimeInput
            timeInputLabel="Time:"
            dateFormat="MM/dd/yyyy h:mm aa"
            onChange={changeDateHandler}
            selected={endTime}
          />
        </Box>
        <HStack spacing={'20px'} sx={{ margin: '20px' }}>
          <Box>Is it average:</Box>
          <Checkbox isChecked={isAverage} onChange={e => setIsAverage(e.target.checked)} />
        </HStack>
        <HStack spacing={'20px'} sx={{ margin: '20px' }}>
          <Box>Lucky Box address: </Box>
          <a href={`https://scan.endless.link/object/${redEnvelopeAddress}?network=testnet`} target='_blank'>{redEnvelopeAddress}</a>
        </HStack>
        <HStack spacing={'20px'} sx={{ margin: '20px' }}>
          <Button onClick={signAndSubmitTrancactionHandler}>
            Send Lucky Box
          </Button>
        </HStack>
        <Box sx={{ margin: '20px' }}>
          <Box>Return Lucky Box :</Box>
          <Box sx={{ margin: '20px' }}>
            <Input placeholder='Return Lucky Box address'
              onChange={(e) => setReturnRedEnvelopeAddress(e.target.value)}
              value={returnRedEnvelopeAddress}
            />
          </Box>
          <Button onClick={returnRedEnvelopeHandler}>
            Return Lucky Box
          </Button>
        </Box>
      </Box>
    </VStack>
  )
}

export default RedEnvelope