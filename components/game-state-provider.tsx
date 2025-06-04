"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useGameSupabase } from "@/hooks/use-game-supabase"

// Create a context to hold the game state
const GameStateContext = createContext<any>(null)

// Provider component that wraps the game pages
export function GameStateProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)
  const gameHook = useGameSupabase()

  useEffect(() => {
    // Check if we have game data in localStorage
    const playerData = localStorage.getItem("storyforge-player")

    if (playerData && !isInitialized) {
      try {
        const data = JSON.parse(playerData)

        if (data.gameId) {
          console.log("Initializing game from stored data:", data.gameId)
          gameHook.initializeGame(data.gameId, data.playerId)
          setIsInitialized(true)
        }
      } catch (error) {
        console.error("Error initializing game from stored data:", error)
      }
    }
  }, [gameHook, isInitialized])

  return <GameStateContext.Provider value={gameHook}>{children}</GameStateContext.Provider>
}

// Hook to use the game state
export function useGameState() {
  const context = useContext(GameStateContext)
  if (!context) {
    throw new Error("useGameState must be used within a GameStateProvider")
  }
  return context
}
