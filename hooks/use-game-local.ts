"use client"

import { useCallback, useContext, useEffect, useState } from "react"
import { GameContext } from "../contexts/GameContext"
import type { GameState } from "../types"
import { useTRNIntegration } from "./use-trn-integration"

export const useGameLocal = () => {
  const { gameManager } = useContext(GameContext)
  const [gameState, setGameState] = useState<GameState | null>(null)

  useEffect(() => {
    if (!gameManager) return

    const unsubscribe = gameManager.onGameStateChange((newGameState) => {
      setGameState(newGameState)
    })

    return () => unsubscribe()
  }, [gameManager])

  const startGame = useCallback(
    async (theme: string, playerNames: string[]) => {
      if (!gameManager) return

      await gameManager.startGame(theme, playerNames)
    },
    [gameManager],
  )

  const addPlayer = useCallback(
    async (name: string) => {
      if (!gameManager) return

      await gameManager.addPlayer(name)
    },
    [gameManager],
  )

  const removePlayer = useCallback(
    async (playerId: string) => {
      if (!gameManager) return

      await gameManager.removePlayer(playerId)
    },
    [gameManager],
  )

  const kickPlayer = useCallback(
    async (playerId: string) => {
      if (!gameManager) return

      await gameManager.kickPlayer(playerId)
    },
    [gameManager],
  )

  const drawEvent = useCallback(async () => {
    if (!gameManager) return

    await gameManager.drawEvent()
  }, [gameManager])

  const discardEvent = useCallback(async () => {
    if (!gameManager) return

    await gameManager.discardEvent()
  }, [gameManager])

  const resolveEvent = useCallback(
    async (playerId: string, success: boolean, choice?: string) => {
      if (!gameManager) return

      await gameManager.resolveEvent(playerId, success, choice)
    },
    [gameManager],
  )

  const updatePlayerKarma = useCallback(
    async (playerId: string, karma: number) => {
      if (!gameManager) return

      await gameManager.updatePlayerKarma(playerId, karma)
    },
    [gameManager],
  )

  const updatePlayerActions = useCallback(
    async (playerId: string, actions: string[]) => {
      if (!gameManager) return

      await gameManager.updatePlayerActions(playerId, actions)
    },
    [gameManager],
  )

  const endGame = useCallback(async () => {
    if (!gameManager) return

    await gameManager.endGame()
  }, [gameManager])

  const trnIntegration = useTRNIntegration()

  const resolveEvent = useCallback(
    async (playerId: string, success: boolean, choice?: string) => {
      if (!gameManager) return

      await gameManager.resolveEvent(playerId, success, choice)

      // Award TRN karma tokens if wallet is connected
      if (trnIntegration.isWalletConnected && gameState?.currentEvent) {
        const event = gameState.currentEvent
        let karmaType: Parameters<typeof trnIntegration.awardKarmaTokens>[0] = "participation"

        if (event.type === "task" && success) karmaType = "task_success"
        else if (event.type === "dare" && success) karmaType = "dare_success"
        else if (event.type === "dilemma") karmaType = "dilemma_good"
        else if (event.type === "bonus") karmaType = "bonus_tile"

        const karmaAmount = success ? event.karmaValue : Math.floor(event.karmaValue / 2)
        await trnIntegration.awardKarmaTokens(karmaType, karmaAmount)

        // Mint tile achievement NFT
        if (success && gameState) {
          await trnIntegration.mintNFT("tile_achievement", gameState.id, {
            tileId: event.id,
            title: event.title,
            type: event.type,
            karmaEarned: karmaAmount,
            theme: gameState.theme,
          })
        }
      }
    },
    [gameManager, gameState, trnIntegration],
  )

  return {
    gameState,
    startGame,
    addPlayer,
    removePlayer,
    kickPlayer,
    drawEvent,
    discardEvent,
    resolveEvent,
    updatePlayerKarma,
    updatePlayerActions,
    endGame,
    trnIntegration,

    mintStoryNFT: useCallback(async () => {
      if (!gameState || !trnIntegration.isWalletConnected) return null

      const players = Object.values(gameState.players)
      const currentPlayer = players.find((p) => p.id === trnIntegration.walletAddress)

      if (currentPlayer) {
        return await trnIntegration.mintNFT("story_summary", gameState.id, {
          playerName: currentPlayer.name,
          theme: gameState.theme,
          finalKarma: currentPlayer.karma,
          isWinner: players.sort((a, b) => b.karma - a.karma)[0].id === currentPlayer.id,
          keyActions: currentPlayer.actions,
          storyText: `${currentPlayer.name} completed the ${gameState.theme} adventure with ${currentPlayer.karma} karma.`,
        })
      }
      return null
    }, [gameState, trnIntegration]),
  }
}
