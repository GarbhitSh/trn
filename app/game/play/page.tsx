"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  Heart,
  Zap,
  Star,
  MessageCircle,
  Trophy,
  Crown,
  Users,
  RefreshCw,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useGameSupabase } from "@/hooks/use-game-supabase"
import ClientWrapper from "@/components/client-wrapper"
import ConnectionStatus from "@/components/connection-status"
import GameBoardVisual from "@/components/game-board-visual"
import DiceRollAnimation from "@/components/dice-roll-animation"

const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6]

const tileTypeIcons = {
  task: Zap,
  dare: Heart,
  action: Dice1,
  dilemma: MessageCircle,
  bonus: Star,
  start: Star,
  finish: Trophy,
}

const tileTypeColors = {
  task: "bg-blue-500/20 border-blue-500/50",
  dare: "bg-pink-500/20 border-pink-500/50",
  action: "bg-green-500/20 border-green-500/50",
  dilemma: "bg-purple-500/20 border-purple-500/50",
  bonus: "bg-yellow-500/20 border-yellow-500/50",
  start: "bg-emerald-500/20 border-emerald-500/50",
  finish: "bg-orange-500/20 border-orange-500/50",
}

function GamePlayContent() {
  const [isRolling, setIsRolling] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState("Loading game...")
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [showDiceAnimation, setShowDiceAnimation] = useState(false)
  const [rolledValue, setRolledValue] = useState(1)
  const router = useRouter()

  const { gameState, currentPlayer, loading, error, rollDice, movePlayer, resolveEvent, endGame, initializeGame } =
    useGameSupabase()

  // Initialize or restore game state
  useEffect(() => {
    const initializeGameState = async () => {
      try {
        setLoadingMessage("Connecting to game...")

        // Get player data from localStorage
        const playerDataStr = localStorage.getItem("storyforge-player")
        if (!playerDataStr) {
          setLoadingError("No player data found. Please return to home and start again.")
          setIsLoading(false)
          return
        }

        const playerData = JSON.parse(playerDataStr)

        // If we don't have a gameId in localStorage, check sessionStorage for transition data
        if (!playerData.gameId) {
          const transitionData = sessionStorage.getItem("storyforge-game-state")
          if (transitionData) {
            const { gameId } = JSON.parse(transitionData)
            playerData.gameId = gameId
            // Update localStorage with the gameId
            localStorage.setItem("storyforge-player", JSON.stringify(playerData))
            // Clear transition data
            sessionStorage.removeItem("storyforge-game-state")
          }
        }

        if (!playerData.gameId) {
          setLoadingError("Game ID not found. Please return to home and start again.")
          setIsLoading(false)
          return
        }

        // Only initialize if we don't already have the right game loaded
        if (!gameState || gameState.id !== playerData.gameId) {
          console.log("Initializing game with IDs:", playerData.gameId, playerData.playerId)
          initializeGame(playerData.gameId, playerData.playerId)
        } else {
          console.log("Game already loaded with correct ID")
          setIsLoading(false)
        }

        // Wait for game state to load
        setLoadingMessage("Loading game data...")

        // We'll let the gameState effect handle the rest
      } catch (err) {
        console.error("Error initializing game:", err)
        setLoadingError("Failed to initialize game. Please try again.")
        setIsLoading(false)
      }
    }

    // Only initialize once
    if (isLoading && !gameState) {
      initializeGameState()
    }
  }, [initializeGame, gameState, isLoading])

  // Monitor game state loading
  useEffect(() => {
    if (loading) {
      setLoadingMessage("Connecting to game server...")
      return
    }

    if (error) {
      setLoadingError(error)
      return
    }

    // If we have game state and current player, we're ready
    if (gameState && currentPlayer) {
      // Verify the game is in playing state
      if (gameState.gamePhase !== "playing") {
        setLoadingError(`Game is not in playing phase. Current phase: ${gameState.gamePhase}`)
        return
      }

      setIsLoading(false)
    } else if (!loading && retryCount < 3) {
      // If not loading but we don't have game state yet, retry a few times
      const timer = setTimeout(() => {
        setRetryCount((prev) => prev + 1)
        setLoadingMessage(`Retrying connection (${retryCount + 1}/3)...`)
      }, 2000)

      return () => clearTimeout(timer)
    } else if (retryCount >= 3 && !gameState) {
      setLoadingError("Failed to load game after multiple attempts. Please refresh the page.")
    }
  }, [gameState, currentPlayer, loading, error, retryCount])

  // Show event modal when there's a current event
  useEffect(() => {
    if (gameState?.currentEvent) {
      setShowEventModal(true)
    } else {
      setShowEventModal(false)
    }
  }, [gameState?.currentEvent])

  // Check if game ended
  useEffect(() => {
    if (gameState?.gamePhase === "ended") {
      // Store transition data
      sessionStorage.setItem(
        "storyforge-game-state",
        JSON.stringify({
          gameId: gameState.id,
          phase: "ended",
        }),
      )
      router.push("/game/story")
    }
  }, [gameState?.gamePhase, router])

  const handleRollDice = async () => {
    if (!gameState || !currentPlayer || isRolling) return
    if (gameState.currentPlayerId !== currentPlayer.id) return

    setIsRolling(true)

    try {
      // Roll the dice and get the value
      const diceValue = await rollDice()
      setRolledValue(diceValue)

      // Show dice animation
      setShowDiceAnimation(true)
    } catch (error) {
      console.error("Error rolling dice:", error)
      setIsRolling(false)
    }
  }

  const handleDiceAnimationComplete = async () => {
    if (!gameState || !currentPlayer) return

    setShowDiceAnimation(false)

    // Move player after dice animation
    try {
      await movePlayer(currentPlayer.id, rolledValue)
    } catch (error) {
      console.error("Error moving player:", error)
    } finally {
      setIsRolling(false)
    }
  }

  const handleResolveEvent = async (success: boolean, choice?: string) => {
    if (!gameState || !currentPlayer || !gameState.currentEvent) return

    await resolveEvent(currentPlayer.id, success, choice)
    setShowEventModal(false)

    // Check if player reached the end
    const player = gameState.players[currentPlayer.id]
    if (player && player.position >= gameState.board.tiles.length - 1) {
      setTimeout(() => {
        endGame()
      }, 2000)
    }
  }

  const handleRetry = () => {
    setLoadingError(null)
    setIsLoading(true)
    setRetryCount(0)
    window.location.reload()
  }

  // Loading state
  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Loading Your Adventure</h2>
            <p className="text-blue-200 mb-4">{loadingMessage}</p>
            <ConnectionStatus showDetails={true} />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (loadingError || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <Card className="bg-red-500/10 backdrop-blur-sm border-red-500/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Error Loading Game</h2>
            <p className="text-red-200 mb-6">{loadingError || error}</p>
            <div className="flex justify-center gap-4">
              <Button onClick={handleRetry} className="bg-blue-600 hover:bg-blue-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Button onClick={() => router.push("/")} variant="outline" className="border-white/30 text-white">
                Return Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No game state or player
  if (!gameState || !currentPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Game Not Found</h2>
            <p className="text-blue-200 mb-4">Unable to load the game. Please return to home and try again.</p>
            <Button onClick={() => router.push("/")} className="bg-blue-600 hover:bg-blue-700">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const players = Object.values(gameState.players)
  const currentTurnPlayer = gameState.players[gameState.currentPlayerId]
  const isMyTurn = currentTurnPlayer?.id === currentPlayer.id

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-yellow-400 mb-2">StoryForge Adventure</h1>
          <p className="text-blue-200">{gameState.theme}</p>
          <div className="flex justify-center mt-2">
            <ConnectionStatus showDetails={true} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-3">
            <GameBoardVisual board={gameState.board} players={players} currentTile={currentTurnPlayer?.position} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Turn */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-center">Current Turn</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                {currentTurnPlayer && (
                  <>
                    <div
                      className={`w-16 h-16 ${currentTurnPlayer.color} rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-2xl`}
                    >
                      {currentTurnPlayer.avatar}
                    </div>
                    <p className="font-medium text-white mb-2">{currentTurnPlayer.name}</p>
                    <p className="text-sm text-blue-200 mb-4">Position: {currentTurnPlayer.position}</p>

                    {isMyTurn && !gameState.currentEvent && (
                      <div className="space-y-3">
                        <Button
                          onClick={handleRollDice}
                          disabled={isRolling}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:opacity-50"
                        >
                          {isRolling ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                              Rolling...
                            </>
                          ) : (
                            <>
                              {React.createElement(diceIcons[gameState.diceValue - 1], { className: "w-5 h-5 mr-2" })}
                              Roll Dice
                            </>
                          )}
                        </Button>
                        {gameState.diceValue && !isRolling && (
                          <p className="text-sm text-blue-200">Last roll: {gameState.diceValue}</p>
                        )}
                      </div>
                    )}

                    {!isMyTurn && (
                      <p className="text-sm text-yellow-400">Waiting for {currentTurnPlayer.name} to play...</p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Players */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="w-5 h-5" />
                  Players
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {players
                    .sort((a, b) => b.karma - a.karma)
                    .map((player, index) => (
                      <div key={player.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 ${player.color} rounded-full flex items-center justify-center text-white font-bold text-sm`}
                          >
                            {player.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              <p className="text-sm font-medium text-white">{player.name}</p>
                              {index === 0 && <Crown className="w-3 h-3 text-yellow-400" />}
                            </div>
                            <p className="text-xs text-blue-200">Pos: {player.position}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-yellow-400">{player.karma}</p>
                          <p className="text-xs text-blue-200">karma</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Game Log */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Adventure Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {gameState.gameLog.slice(-5).map((log, index) => (
                    <p key={index} className="text-xs text-blue-200">
                      {log}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dice Roll Animation */}
        <DiceRollAnimation
          finalValue={rolledValue}
          onAnimationComplete={handleDiceAnimationComplete}
          isVisible={showDiceAnimation}
          playerName={currentTurnPlayer?.name}
        />

        {/* Event Modal */}
        {showEventModal && gameState.currentEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 max-w-md w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  {React.createElement(tileTypeIcons[gameState.currentEvent.type], { className: "w-5 h-5" })}
                  {gameState.currentEvent.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-200 mb-4">{gameState.currentEvent.description}</p>

                {gameState.currentEvent.type === "dilemma" && gameState.currentEvent.choices ? (
                  <div className="space-y-3">
                    <p className="text-sm text-yellow-400 mb-3">Choose your path:</p>
                    {gameState.currentEvent.choices.map((choice, index) => (
                      <Button
                        key={index}
                        onClick={() => handleResolveEvent(true, choice)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-left justify-start"
                      >
                        {choice}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Button onClick={() => handleResolveEvent(true)} className="flex-1 bg-green-600 hover:bg-green-700">
                      Success (+{gameState.currentEvent.karmaValue} karma)
                    </Button>
                    <Button
                      onClick={() => handleResolveEvent(false)}
                      variant="outline"
                      className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10"
                    >
                      Fail (+{Math.floor(gameState.currentEvent.karmaValue / 2)} karma)
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default function GamePlay() {
  return (
    <ClientWrapper>
      <GamePlayContent />
    </ClientWrapper>
  )
}
