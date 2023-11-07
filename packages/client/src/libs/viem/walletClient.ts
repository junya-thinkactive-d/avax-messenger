import { createWalletClient, custom, http } from 'viem'

import { SPECIFIED_CHAIN } from '@/constant'
import { getEthereumSafety } from '@/utils/ethereum'

const ethereum = getEthereumSafety()

export const walletClient = ethereum
  ? createWalletClient({
      chain: SPECIFIED_CHAIN,
      transport: custom(ethereum),
    })
  : createWalletClient({
      chain: SPECIFIED_CHAIN,
      transport: http(),
    })
