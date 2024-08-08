import {
  Box,
  CheckboxGroup,
  Checkbox,
  HStack,
  Button
} from "@chakra-ui/react"
import { 
  Account,
  Ed25519PrivateKey,
  Endless, 
  EndlessConfig, 
  EntryFunctionABI, 
  TypeTagAddress,
  Network, 
  AccountAddress
} from "endless-ts-sdk"
import type { User } from "@/typings"
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

const AccountItem = ({ user, redEnvelopeAddress }: { user: User, redEnvelopeAddress: string }) => {

  const receiveHander = async () => {
    if(!redEnvelopeAddress) return

    const privateKey = new Ed25519PrivateKey(user.key)
    const account = Account.fromPrivateKey({ privateKey })

    const transferEDSAbi: EntryFunctionABI = {
      typeParameters: [],
      parameters: [ new TypeTagAddress() ]
    }

    console.log(`receive ${user.address} from ${redEnvelopeAddress}, ${ addressToU64(AccountAddress.fromBs58String(user.address)) }`)

    const transaction = await endless.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${ RED_ENVELOPE_ADDRESS }unpack`,
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
    console.log(`receive ${user.address} from ${redEnvelopeAddress} transaction hash: ${ transferEDSTransaction }`)
  }

  return (
    <HStack spacing='16px' sx={{
      margin: '8px 0'
    }}>
      <Checkbox value={user.address}>
        {user.address}
      </Checkbox>
      {
        redEnvelopeAddress &&
        <Button colorScheme='blue'
          onClick={receiveHander}
        >
          Receive Red Envelopes
        </Button>
      }

    </HStack>
  )
}

const AccountCheckbox = ({
  onChange,
  defaultValue,
  redEnvelopeAddress
}: Iprops) => {
  return (
    <Box>
      <Box sx={{ fontSize: '24px', fontWeight: '600' }}>
        Select users to receive red envelopes
      </Box>
      <CheckboxGroup 
        onChange={e => {
          onChange(e as string[])
        }}
        defaultValue={ defaultValue }
      >
        {
          users.map(user =>
            <AccountItem
              key={user.address}
              user={user}
              redEnvelopeAddress={redEnvelopeAddress}
            />
          )
        }

      </CheckboxGroup>
    </Box>
  )
}

export default AccountCheckbox