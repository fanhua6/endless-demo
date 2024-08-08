import { AccountAddress } from "endless-ts-sdk"

export  const addressToU64 = (address: AccountAddress) => {
  const buf = address.toUint8Array()
  return buf.slice(0, 8).reduce((m, a) => {
    m = (m << 8n) + BigInt(a)
    return m
  }, 0n)
}