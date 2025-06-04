"use client"

import { useState, useEffect } from "react"
import { trnWallet, type WalletState } from "@/lib/trn/wallet-provider"
import { trnContracts } from "@/lib/trn/contracts"

export function useTRNWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    network: null,
    provider: null,
  })
  const [rootBalance, setRootBalance] = useState<string>("0.0")
  const [nftCount, setNftCount] = useState<number>(0)
  const [karma, setKarma] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Subscribe to wallet state changes
    const unsubscribe = trnWallet.onStateChange((state) => {
      setWalletState(state)
      if (state.isConnected && state.address) {
        loadWalletData(state.address)
      } else {
        setRootBalance("0.0")
        setNftCount(0)
        setKarma(0)
      }
    })

    return () => {
      // Note: In a real implementation, you'd want to properly unsubscribe
    }
  }, [])

  const loadWalletData = async (address: string) => {
    try {
      setIsLoading(true)
      const [rootBal, nftBal, karmaPoints] = await Promise.all([
        trnContracts.getRootBalance(address),
        trnContracts.getNFTBalance(address),
        trnContracts.getPlayerKarma(address),
      ])

      setRootBalance(rootBal)
      setNftCount(nftBal)
      setKarma(karmaPoints)
    } catch (error) {
      console.error("Error loading wallet data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const connectWallet = async (): Promise<boolean> => {
    setIsLoading(true)
    try {
      const success = await trnWallet.connect()
      return success
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWallet = async (): Promise<void> => {
    await trnWallet.disconnect()
  }

  const switchNetwork = async (network: "testnet" | "mainnet"): Promise<boolean> => {
    setIsLoading(true)
    try {
      return await trnWallet.switchToTRN(network)
    } finally {
      setIsLoading(false)
    }
  }

  const awardKarma = async (amount: number, reason: string): Promise<string | null> => {
    if (!walletState.address) return null

    try {
      setIsLoading(true)
      const txHash = await trnContracts.awardKarma(walletState.address, amount, reason)
      // Refresh karma after transaction
      setTimeout(() => {
        if (walletState.address) {
          loadWalletData(walletState.address)
        }
      }, 2000)
      return txHash
    } catch (error) {
      console.error("Error awarding karma:", error)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const mintNFT = async (tokenURI: string): Promise<string | null> => {
    if (!walletState.address) return null

    try {
      setIsLoading(true)
      const txHash = await trnContracts.mintStoryNFT(walletState.address, tokenURI)
      // Refresh NFT count after transaction
      setTimeout(() => {
        if (walletState.address) {
          loadWalletData(walletState.address)
        }
      }, 2000)
      return txHash
    } catch (error) {
      console.error("Error minting NFT:", error)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const claimRewards = async (): Promise<string | null> => {
    if (!walletState.address) return null

    try {
      setIsLoading(true)
      const txHash = await trnContracts.claimRewards(walletState.address)
      // Refresh balances after transaction
      setTimeout(() => {
        if (walletState.address) {
          loadWalletData(walletState.address)
        }
      }, 2000)
      return txHash
    } catch (error) {
      console.error("Error claiming rewards:", error)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    // Wallet state
    isConnected: walletState.isConnected,
    address: walletState.address,
    balance: walletState.balance,
    network: walletState.network,
    isLoading,

    // Token data
    rootBalance,
    nftCount,
    karma,

    // Actions
    connectWallet,
    disconnectWallet,
    switchNetwork,
    awardKarma,
    mintNFT,
    claimRewards,

    // Utilities
    refreshData: () => walletState.address && loadWalletData(walletState.address),
  }
}
