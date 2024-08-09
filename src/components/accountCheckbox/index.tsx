import { useState } from "react"
import {
  Box,
  CheckboxGroup,
  Checkbox,
  HStack,
  Button,
  Input,
  useToast
} from "@chakra-ui/react"
import {
  Account,
  Ed25519PrivateKey,
  Endless,
  EndlessConfig,
  EntryFunctionABI,
  TypeTagAddress,
  Network,
  AccountAddress,
  UserTransactionResponse
} from "endless-ts-sdk"
import type { IUser } from "@/typings"
import { users } from './users'
import { RED_ENVELOPE_ADDRESS } from '../../constants'
import { addressToU64 } from "../../utils"

const config = new EndlessConfig({
  network: Network.TESTNET,
})

const endless = new Endless(config)

type Iprops = {
  onChange: (e: string[]) => void
  redEnvelopeAddress: string,
  defaultValue: string[]
}

const AccountItem = ({ user, redEnvelopeAddress }: { user: IUser, redEnvelopeAddress: string }) => {
  const toast = useToast()

  const receiveHander = async () => {
    if (!redEnvelopeAddress || !user.key) return

    const privateKey = new Ed25519PrivateKey(user.key)
    const account = Account.fromPrivateKey({ privateKey })

    const transferEDSAbi: EntryFunctionABI = {
      typeParameters: [],
      parameters: [new TypeTagAddress()]
    }

    console.log(`receive ${user.address} from ${redEnvelopeAddress}, ${addressToU64(AccountAddress.fromBs58String(user.address))}`)

    try {
      const transaction = await endless.transaction.build.simple({
        sender: account.accountAddress,
        data: {
          function: `${RED_ENVELOPE_ADDRESS}unpack`,
          functionArguments: [
            redEnvelopeAddress
          ],
          abi: transferEDSAbi,
        }
      })

      const transferEDSTransaction = await endless.signAndSubmitTransaction({
        signer: account,
        transaction: transaction,
      })
      // console.log(transferEDSTransaction)
      console.log(`receive ${user.address} from ${redEnvelopeAddress} transaction hash: ${transferEDSTransaction}`)
      if(transferEDSTransaction.hash) {
        const txn = await endless.transaction.getTransactionByHash({ transactionHash: transferEDSTransaction.hash }) as UserTransactionResponse
        if(txn.success) {
          const amount = txn.events.find((e: { type: string }) => e.type.endsWith('::lucky_box::Unpacking'))?.data?.amount
          toast({
            title: 'Get Lucky Box Success.',
            description: `Amount ${ amount / 100000000 } EDS.`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          })
        }
      }
    } catch (error: unknown) {
      console.log(error)
      toast({
        title: 'Get Lucky Box Error.',
        // description: error.vm_error_code,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <HStack spacing='16px' sx={{
      margin: '8px 0'
    }}>
      <Checkbox value={user.address}>
        {user.address}
      </Checkbox>
      {
        redEnvelopeAddress && (
        user.key ?
        <Button colorScheme='blue'
          onClick={receiveHander}
        >
          Get Lucky Box
        </Button> :
        <a href="https://scan.endless.link/account/FKXmSfZNF6XXBb6xYgJtekzTv828c2ssHxGpiEpW1kTy/modules/run/lucky_box/unpack?network=testnet" target="_blank">
          <Button colorScheme='blue'>
            To Scan Get Lucky Box
          </Button>
        </a>
        )
      }

    </HStack>
  )
}

const AccountCheckbox = ({
  onChange,
  defaultValue,
  redEnvelopeAddress
}: Iprops) => {
  const [userArr, setUserArr] = useState<IUser[]>(users)
  const [checked, setChecked] = useState<string[]>(defaultValue)
  const [newUser, setNewUser] = useState<string>('')

  const onChangeHandler = (e: string[]) => {
    setChecked(e)
    onChange(e)
  }

  const addUserHandler = () => {
    if(newUser) {
      setUserArr([...userArr, {
        address: newUser,
        key: '',
      }])
      onChange([...checked, newUser])
      setChecked([...checked, newUser])
      setNewUser('')
    }
  }

  return (
    <Box>
      <Box sx={{ fontSize: '24px', fontWeight: '600' }}>
        Select users to receive red envelopes
      </Box>
      <CheckboxGroup
        onChange={onChangeHandler}
        value={checked}
      >
        {
          userArr.map(user =>
            <AccountItem
              key={user.address}
              user={user}
              redEnvelopeAddress={redEnvelopeAddress}
            />
          )
        }
      </CheckboxGroup>
      <Box>
        add user:
        <HStack spacing='16px' sx={{
          margin: '8px 0'
        }}>
          <Box sx={{ margin: '20px', width: '70%' }}>
            <Input placeholder="user wallet address" 
              value={newUser}
              onChange={(e) => setNewUser(e.target.value)}
            />
          </Box>
          <Button colorScheme='blue'
            onClick={ addUserHandler }
          >
            Add User
          </Button>
        </HStack>
      </Box>
    </Box>
  )
}

export default AccountCheckbox