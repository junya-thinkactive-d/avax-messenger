import { useCallback, useEffect, useState } from 'react'
import { sepolia } from 'viem/chains'

import { walletClient } from '@/libs/viem'
import { getEthereumSafety } from '@/utils/ethereum'

type ReturnUseConnectWallet = {
  currentAccount: `0x${string}` | null
  currentChainId: number | null
  isConnectChain: boolean
  connectWallet: () => Promise<void>
  connectChain: () => Promise<void>
}

export const useConnectWallet = (): ReturnUseConnectWallet => {
  const [currentAccount, setCurrentAccount] = useState<`0x${string}` | null>(null)
  const [currentChainId, setCurrentChainId] = useState<number | null>(null)
  const [isConnectChain, setIsConnectChain] = useState<boolean>(false)

  const ethereum = getEthereumSafety()

  const setAccount = useCallback(() => {
    const accounts = walletClient.getAddresses()
    if (accounts && Array.isArray(accounts)) {
      const account = accounts[0]
      setCurrentAccount(account)
    } else {
      setCurrentAccount(null)
    }
  }, [])

  useEffect(() => {
    ethereum?.on('accountsChanged', setAccount)
    return () => {
      ethereum?.removeListener('accountsChanged', setAccount)
    }
  }, [ethereum, setAccount])

  const checkIfWalletIsConnected = useCallback(async () => {
    try {
      if (!ethereum) {
        console.log('Make sure you have metamask!')
        return
      } else {
        console.log('We have the ethereum object', ethereum)
      }
      const accounts = await walletClient.getAddresses()
      if (accounts && Array.isArray(accounts)) {
        const account = accounts[0]
        setCurrentAccount(account)
      } else {
        console.log('No accounts found')
      }
    } catch (error) {
      console.log(error)
    }
  }, [ethereum])

  const setChain = useCallback(async (isConfirm: boolean) => {
    setIsConnectChain(isConfirm)
  }, [])

  const confirmIsConnectChain = useCallback(async () => {
    const currentChain = await walletClient.getChainId()
    const isConnectChain = sepolia.id === currentChain
    await setChain(isConnectChain)
  }, [setChain])

  const switchChain = async () => {
    await walletClient.switchChain({ id: sepolia.id })
  }

  const handleSetChainId = useCallback(async () => {
    const chainId = await walletClient.getChainId()
    setCurrentChainId(chainId)
    console.log('chainId', currentChainId)
  }, [currentChainId])

  useEffect(() => {
    ethereum?.on('chainChanged', confirmIsConnectChain)
    ethereum?.on('chainChanged', handleSetChainId)
    return () => {
      ethereum?.removeListener('chainChanged', confirmIsConnectChain)
      ethereum?.removeListener('chainChanged', handleSetChainId)
    }
  }, [confirmIsConnectChain, ethereum, handleSetChainId])

  const connectChain = useCallback(async () => {
    try {
      if (!ethereum) {
        alert('Get MetaMask!')
        return
      }
      if (!isConnectChain) {
        await switchChain()
      }
      await confirmIsConnectChain()
    } catch (error) {
      console.log(error)
    }
  }, [confirmIsConnectChain, ethereum, isConnectChain])

  const connectWallet = useCallback(async () => {
    try {
      if (!ethereum) {
        alert('Get MetaMask!')
        return
      }
      const accounts = await walletClient.requestAddresses()

      if (accounts && Array.isArray(accounts)) {
        console.log('Connected', accounts[0])
        const account = accounts[0]
        setCurrentAccount(account)
      }
      connectChain()
    } catch (error) {
      console.log(error)
    }
  }, [connectChain, ethereum])

  useEffect(() => {
    checkIfWalletIsConnected()
    confirmIsConnectChain()
  }, [checkIfWalletIsConnected, confirmIsConnectChain, connectChain, handleSetChainId])

  return {
    currentAccount,
    currentChainId,
    isConnectChain,
    connectWallet,
    connectChain,
  }
}
