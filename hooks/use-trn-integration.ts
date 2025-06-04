"use client"

import { useState, useEffect, useCallback } from "react"
import { trnWallet, type TRNWalletState } from "@/lib/trn/wallet-connector"
import { KarmaTokenEngine, type KarmaReward } from "@/lib/trn/karma-token-engine"
import { TRNFuelManager, type GaslessTransaction } from "@/lib/trn/fuel-manager"
import { NFTLootEngine, type GameNFT } from "@/lib/trn/nft-loot-engine"
import { TRNLogger, type GameEvent } from "@/lib/trn/logger"

export interface TRNIntegrationState {
  wallet: TRNWalletState
  isInitialized: boolean
  karmaRewards: KarmaReward[]
  gaslessTransactions: GaslessTransaction[]
  nfts: GameNFT[]
  events: GameEvent[]
  rootBalance: string
  karmaMultiplier: number
}

export function useTRNIntegration() {
  const [state, setState] = useState<TRNIntegrationState>({
    wallet: {
      isConnected: false,
      address: null,
      provider: null,
      network: "trn-testnet",
    },
    isInitialized: false,
    karmaRewards: [],
    gaslessTransactions: [],
    nfts: [],
    events: [],
    rootBalance: "0",
    karmaMultiplier: 1.0,
  })

  const [engines, setEngines] = useState<{
    karma: KarmaTokenEngine | null
    fuel: TRNFuelManager | null
    nft: NFTLootEngine | null
    logger: TRNLogger | null
  }>({
    karma: null,
    fuel: null,
    nft: null,
    logger: null,
  })

  // Initialize TRN integration
  const initialize = useCallback(async () => {
    try {
      console.log("🚀 Initializing TRN integration...")

      // Set up wallet state listener
      trnWallet.onStateChange((walletState) => {
        setState((prev) => ({ ...prev, wallet: walletState }))

        // Update engines when wallet state changes
        if (walletState.provider) {
          const karma = new KarmaTokenEngine(walletState.provider, walletState.network)
          const fuel = new TRNFuelManager(walletState.provider, walletState.network)
          const nft = new NFTLootEngine(walletState.provider, walletState.network)
          const logger = new TRNLogger(walletState.provider, walletState.network)

          setEngines({ karma, fuel, nft, logger })
        }
      })

      setState((prev) => ({ ...prev, isInitialized: true }))
      console.log("✅ TRN integration initialized")
    } catch (error) {
      console.error("Error initializing TRN integration:", error)
    }
  }, [])

  // Connect wallet
  const connectWallet = useCallback(async (): Promise<boolean> => {
    try {
      const connected = await trnWallet.connect()
      if (connected && state.wallet.address) {
        await updatePlayerData(state.wallet.address)
      }
      return connected
    } catch (error) {
      console.error("Error connecting wallet:", error)
      return false
    }
  }, [state.wallet.address])

  // Disconnect wallet
  const disconnectWallet = useCallback(async (): Promise<void> => {
    try {
      await trnWallet.disconnect()
      setEngines({ karma: null, fuel: null, nft: null, logger: null })
    } catch (error) {
      console.error("Error disconnecting wallet:", error)
    }
  }, [])

  // Update player data (balance, multiplier, etc.)
  const updatePlayerData = useCallback(
    async (address: string) => {
      try {
        if (!engines.karma) return

        const [balance, multiplier] = await Promise.all([
          engines.karma.getRootBalance(address),
          engines.karma.getKarmaMultiplier(address),
        ])

        setState((prev) => ({
          ...prev,
          rootBalance: balance,
          karmaMultiplier: multiplier,
        }))
      } catch (error) {
        console.error("Error updating player data:", error)
      }
    },
    [engines.karma],
  )

  // Award karma tokens
  const awardKarmaTokens = useCallback(
    async (
      type: Parameters<KarmaTokenEngine["awardKarmaTokens"]>[1],
      karmaAmount: number,
    ): Promise<KarmaReward | null> => {
      try {
        if (!engines.karma || !state.wallet.address) return null

        const reward = await engines.karma.awardKarmaTokens(state.wallet.address, type, karmaAmount)

        if (reward) {
          setState((prev) => ({
            ...prev,
            karmaRewards: [...prev.karmaRewards, reward],
          }))

          // Update balance after reward
          await updatePlayerData(state.wallet.address)
        }

        return reward
      } catch (error) {
        console.error("Error awarding karma tokens:", error)
        return null
      }
    },
    [engines.karma, state.wallet.address, updatePlayerData],
  )

  // Submit gasless transaction
  const submitGaslessTransaction = useCallback(
    async (
      type: Parameters<TRNFuelManager["submitGaslessTransaction"]>[0],
      gameData: any,
      gasToken = "$ROOT",
    ): Promise<string | null> => {
      try {
        if (!engines.fuel || !state.wallet.address) return null

        const txId = await engines.fuel.submitGaslessTransaction(type, state.wallet.address, gameData, gasToken)

        if (txId) {
          // Update transactions list
          const tx = engines.fuel.getTransactionStatus(txId)
          if (tx) {
            setState((prev) => ({
              ...prev,
              gaslessTransactions: [...prev.gaslessTransactions, tx],
            }))
          }
        }

        return txId
      } catch (error) {
        console.error("Error submitting gasless transaction:", error)
        return null
      }
    },
    [engines.fuel, state.wallet.address],
  )

  // Mint NFT
  const mintNFT = useCallback(
    async (
      type: "tile_achievement" | "story_summary" | "karma_milestone",
      gameId: string,
      data: any,
    ): Promise<GameNFT | null> => {
      try {
        if (!engines.nft || !state.wallet.address) return null

        let nft: GameNFT | null = null

        switch (type) {
          case "tile_achievement":
            nft = await engines.nft.mintTileAchievementNFT(state.wallet.address, gameId, data)
            break
          case "story_summary":
            nft = await engines.nft.mintStorySummaryNFT(state.wallet.address, gameId, data)
            break
          case "karma_milestone":
            nft = await engines.nft.mintKarmaMilestoneNFT(state.wallet.address, gameId, data)
            break
        }

        if (nft) {
          setState((prev) => ({
            ...prev,
            nfts: [...prev.nfts, nft],
          }))
        }

        return nft
      } catch (error) {
        console.error("Error minting NFT:", error)
        return null
      }
    },
    [engines.nft, state.wallet.address],
  )

  // Log game event
  const logGameEvent = useCallback(
    async (type: Parameters<TRNLogger["logEvent"]>[0], gameId: string, data?: any): Promise<string | null> => {
      try {
        if (!engines.logger) return null

        let eventId: string | null = null

        switch (type) {
          case "game_created":
            eventId = await engines.logger.logGameCreated(
              gameId,
              state.wallet.address || "",
              data.theme,
              data.playerCount,
            )
            break
          case "player_joined":
            eventId = await engines.logger.logPlayerJoined(
              gameId,
              data.playerId,
              state.wallet.address || "",
              data.playerName,
            )
            break
          case "dice_rolled":
            eventId = await engines.logger.logDiceRolled(
              gameId,
              data.playerId,
              state.wallet.address || "",
              data.diceValue,
            )
            break
          // Add other event types as needed
        }

        if (eventId) {
          const event = engines.logger.getEvent(eventId)
          if (event) {
            setState((prev) => ({
              ...prev,
              events: [...prev.events, event],
            }))
          }
        }

        return eventId
      } catch (error) {
        console.error("Error logging game event:", error)
        return null
      }
    },
    [engines.logger, state.wallet.address],
  )

  // Initialize on mount
  useEffect(() => {
    initialize()
  }, [initialize])

  // Update player data when wallet connects
  useEffect(() => {
    if (state.wallet.isConnected && state.wallet.address) {
      updatePlayerData(state.wallet.address)
    }
  }, [state.wallet.isConnected, state.wallet.address, updatePlayerData])

  return {
    // State
    ...state,

    // Actions
    connectWallet,
    disconnectWallet,
    awardKarmaTokens,
    submitGaslessTransaction,
    mintNFT,
    logGameEvent,
    updatePlayerData,

    // Utilities
    isWalletConnected: state.wallet.isConnected,
    walletAddress: state.wallet.address,
    formatRootAmount: (amount: number) => engines.karma?.formatRootAmount(amount) || "0 $ROOT",

    // Engine access (for advanced usage)
    engines,
  }
}
