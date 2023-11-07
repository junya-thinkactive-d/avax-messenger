import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'

const transport = http(process.env.NEXT_PUBLIC_RPC_PROVIDER)

export const publicClient = createPublicClient({
  chain: sepolia,
  transport,
})

export type CreatePublicClientType = typeof publicClient
