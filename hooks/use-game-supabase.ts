"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  GameManagerSupabase,
  type GameState,
  type Player,
  type ChatMessage,
  generateGameId,
  generatePlayerId,
  getPlayerColors,
  getPlayerAvatars,
} from "@/lib/game-logic-supabase"
import { generateGameBoard, generatePlayerStory } from "@/lib/gemini"

export function useGameSupabase() {
  const [gameManager, setGameManager] = useState<GameManagerSupabase | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // Use refs to prevent infinite re-renders and premature cleanup
  const gameManagerRef = useRef<GameManagerSupabase | null>(null)
  const initializationRef = useRef<boolean>(false)
  const gameIdRef = useRef<string>("")
  const playerIdRef = useRef<string>("")
  const isCleaningUpRef = useRef<boolean>(false)
  const isNavigatingRef = useRef<boolean>(false)

  // Setup game listeners (separated to prevent multiple subscriptions)
  const setupGameListeners = useCallback((manager: GameManagerSupabase) => {
    if (isCleaningUpRef.current) {
      console.log("Cannot setup listeners - cleaning up")
      return
    }

    // Check if listeners are already set up
    if (gameManagerRef.current && gameManagerRef.current === manager) {
      console.log("Listeners already set up for this manager")
      return
    }

    console.log("Setting up game listeners...")

    manager.onGameStateChange((newGameState) => {
      if (!isCleaningUpRef.current) {
        console.log("Game state changed:", newGameState?.id)
        setGameState(newGameState)

        // If we have a game state, we're connected
        if (newGameState) {
          setIsConnected(true)

          // Try to find current player
          if (newGameState.players && playerIdRef.current) {
            const player = newGameState.players[playerIdRef.current]
            if (player) {
              setCurrentPlayer(player)
            }
          }
        }
      }
    })

    manager.onChatMessages((newMessages) => {
      if (!isCleaningUpRef.current) {
        console.log("Chat messages updated:", newMessages.length)
        setChatMessages(newMessages)
      }
    })

    manager.onConnectionStatusChange((status) => {
      setIsConnected(status === "connected")
    })
  }, [])

  // Initialize game manager
  const initializeGame = useCallback(
    (gameId?: string, playerId?: string) => {
      // Prevent multiple initializations with the same IDs
      if (
        initializationRef.current &&
        gameManagerRef.current &&
        gameIdRef.current === (gameId || gameIdRef.current) &&
        playerIdRef.current === (playerId || playerIdRef.current)
      ) {
        console.log("Game already initialized with same IDs, returning existing")
        return { gameId: gameIdRef.current, playerId: playerIdRef.current }
      }

      // Clean up existing manager if we're reinitializing with different IDs
      if (gameManagerRef.current && (gameIdRef.current !== gameId || playerIdRef.current !== playerId)) {
        console.log("Cleaning up existing manager for reinitialization")
        gameManagerRef.current.cleanup()
        gameManagerRef.current = null
        initializationRef.current = false
      }

      const finalGameId = gameId || generateGameId()
      const finalPlayerId = playerId || generatePlayerId()

      console.log("Initializing game:", { finalGameId, finalPlayerId })

      // Store IDs in refs
      gameIdRef.current = finalGameId
      playerIdRef.current = finalPlayerId

      const manager = new GameManagerSupabase(finalGameId, finalPlayerId)
      setGameManager(manager)
      gameManagerRef.current = manager
      initializationRef.current = true

      // Set up listeners immediately after initialization
      setupGameListeners(manager)

      return { gameId: finalGameId, playerId: finalPlayerId }
    },
    [setupGameListeners],
  )

  // Create new game
  const createGame = useCallback(async (playerName: string, theme: string) => {
    if (!gameManagerRef.current) {
      console.error("No game manager available")
      return null
    }

    setLoading(true)
    setError(null)

    try {
      console.log("Creating game with theme:", theme, "for player:", playerName)

      // Generate game board
      const board = await generateGameBoard(theme, 4)
      console.log("Generated board with", board.tiles.length, "tiles")

      // Get random avatar and color
      const colors = getPlayerColors()
      const avatars = getPlayerAvatars()

      // Create host player
      const hostPlayer: Player = {
        id: playerIdRef.current,
        name: playerName,
        avatar: avatars[Math.floor(Math.random() * avatars.length)],
        karma: 0,
        position: 0,
        isHost: true,
        isReady: true,
        isOnline: true,
        actions: [],
        color: colors[Math.floor(Math.random() * colors.length)],
      }

      console.log("Created host player:", hostPlayer)
      setCurrentPlayer(hostPlayer)

      // Create game
      const gameId = await gameManagerRef.current.createGame(hostPlayer, theme, board)
      console.log("Game created with ID:", gameId)

      // Force immediate state refresh after creation
      if (gameId && gameManagerRef.current) {
        console.log("Forcing immediate state refresh...")
        setTimeout(async () => {
          const freshState = await gameManagerRef.current?.forceStateRefresh()
          if (freshState) {
            console.log("Fresh state loaded:", freshState.id)
            setGameState(freshState)
          }
        }, 500)
      }

      return gameId
    } catch (err) {
      console.error("Error creating game:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to create game"
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Join existing game
  const joinGame = useCallback(
    async (gameId: string, playerName: string) => {
      console.log("Attempting to join game:", gameId, "as:", playerName)

      const { playerId } = initializeGame(gameId)

      if (!gameManagerRef.current) {
        console.error("No game manager available for joining")
        return false
      }

      setLoading(true)
      setError(null)

      try {
        const colors = getPlayerColors()
        const avatars = getPlayerAvatars()

        const player: Player = {
          id: playerId,
          name: playerName,
          avatar: avatars[Math.floor(Math.random() * avatars.length)],
          karma: 0,
          position: 0,
          isHost: false,
          isReady: true,
          isOnline: true,
          actions: [],
          color: colors[Math.floor(Math.random() * colors.length)],
        }

        console.log("Created joining player:", player)
        setCurrentPlayer(player)

        const success = await gameManagerRef.current.joinGame(player)

        if (success) {
          console.log("Successfully joined game")
        } else {
          console.error("Failed to join game")
          setError("Failed to join game")
        }

        return success
      } catch (err) {
        console.error("Error joining game:", err)
        const errorMessage = err instanceof Error ? err.message : "Failed to join game"
        setError(errorMessage)
        return false
      } finally {
        setLoading(false)
      }
    },
    [initializeGame],
  )

  // Game actions
  const startGame = useCallback(async () => {
    if (!gameManagerRef.current) {
      console.error("No game manager available for starting game")
      return false
    }

    // Set navigating flag to prevent cleanup
    isNavigatingRef.current = true

    console.log("Starting game...")
    const result = await gameManagerRef.current.startGame()
    console.log("Start game result:", result)
    return result
  }, [])

  const rollDice = useCallback(async () => {
    if (!gameManagerRef.current) return 0
    console.log("Rolling dice...")
    return await gameManagerRef.current.rollDice()
  }, [])

  const movePlayer = useCallback(async (playerId: string, steps: number) => {
    if (!gameManagerRef.current) return null
    console.log("Moving player:", playerId, "steps:", steps)
    return await gameManagerRef.current.movePlayer(playerId, steps)
  }, [])

  const resolveEvent = useCallback(async (playerId: string, success: boolean, choice?: string) => {
    if (!gameManagerRef.current) return
    console.log("Resolving event for player:", playerId, "success:", success, "choice:", choice)
    await gameManagerRef.current.resolveEvent(playerId, success, choice)
  }, [])

  const sendChatMessage = useCallback(
    async (message: string) => {
      if (!gameManagerRef.current || !currentPlayer) return
      console.log("Sending chat message:", message)
      await gameManagerRef.current.sendChatMessage(currentPlayer.id, currentPlayer.name, message)
    },
    [currentPlayer],
  )

  const endGame = useCallback(async () => {
    if (!gameManagerRef.current) return

    // Set navigating flag to prevent cleanup
    isNavigatingRef.current = true

    console.log("Ending game...")
    await gameManagerRef.current.endGame()
  }, [])

  // Generate stories for all players
  const generateStories = useCallback(async () => {
    if (!gameState) {
      console.log("No game state available for story generation")
      return {}
    }

    console.log("Generating stories for", Object.keys(gameState.players).length, "players")

    const stories: { [playerId: string]: string } = {}
    const players = Object.values(gameState.players)

    // Determine winner
    const sortedPlayers = players.sort((a, b) => b.karma - a.karma)
    const winner = sortedPlayers[0]

    // Generate story for each player with rate limiting
    for (const player of players) {
      try {
        console.log("Generating story for:", player.name)
        const story = await generatePlayerStory(
          player.name,
          gameState.theme,
          player.karma,
          player.actions,
          player.position,
          player.id === winner.id,
        )
        stories[player.id] = story
        console.log("Generated story for:", player.name)
      } catch (error) {
        console.error(`Error generating story for ${player.name}:`, error)
        // Fallback story
        stories[player.id] =
          `${player.name} embarked on an incredible journey through "${gameState.theme}". With ${player.karma} karma points, they showed their true character through every choice and challenge.`
      }
    }

    return stories
  }, [gameState])

  // Cleanup function
  const cleanup = useCallback(() => {
    if (isCleaningUpRef.current) {
      console.log("Already cleaning up, skipping...")
      return
    }

    // Skip cleanup if we're navigating between game pages
    if (isNavigatingRef.current) {
      console.log("Skipping cleanup - navigating between game pages")
      return
    }

    console.log("Starting cleanup...")
    isCleaningUpRef.current = true

    if (gameManagerRef.current) {
      try {
        gameManagerRef.current.cleanup()
      } catch (error) {
        console.error("Error during cleanup:", error)
      }
    }

    // Reset refs
    gameManagerRef.current = null
    initializationRef.current = false
    gameIdRef.current = ""
    playerIdRef.current = ""

    // Reset state
    setGameManager(null)
    setGameState(null)
    setChatMessages([])
    setCurrentPlayer(null)
    setLoading(false)
    setError(null)
    setIsConnected(false)

    console.log("Cleanup completed")
  }, [])

  // Handle navigation between pages
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only prevent unload if we're not navigating between game pages
      if (!isNavigatingRef.current) {
        // This will show a confirmation dialog when the user tries to leave the page
        e.preventDefault()
        e.returnValue = ""
      }
    }

    // Add event listener for page unload
    window.addEventListener("beforeunload", handleBeforeUnload)

    // Listen for route changes
    const handleRouteChange = (url: string) => {
      const currentPath = window.location.pathname

      // Check if we're navigating between game pages
      const isNavigatingWithinGame =
        (currentPath.includes("/game/") && url.includes("/game/")) ||
        (currentPath === "/game/lobby" && url === "/game/play") ||
        (currentPath === "/game/play" && url === "/game/story")

      isNavigatingRef.current = isNavigatingWithinGame

      if (!isNavigatingWithinGame) {
        // Clean up if we're leaving the game
        cleanup()
      }
    }

    // Clean up event listeners
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [cleanup])

  return {
    gameManager,
    gameState,
    chatMessages,
    currentPlayer,
    loading,
    error,
    isConnected,
    initializeGame,
    createGame,
    joinGame,
    startGame,
    rollDice,
    movePlayer,
    resolveEvent,
    sendChatMessage,
    endGame,
    generateStories,
    cleanup,
  }
}
