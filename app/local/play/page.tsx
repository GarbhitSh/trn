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
  Monitor,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useGameLocal } from "@/hooks/use-game-local"
import ClientWrapper from "@/components/client-wrapper"
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

function LocalPlayContent() {
  const [isRolling, setIsRolling] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [showDiceAnimation, setShowDiceAnimation] = useState(false)
  const [rolledValue, setRolledValue] = useState(1)
  const router = useRouter()

  const { gameState, loading, error, rollDice, movePlayer, resolveEvent, endGame, loadGame } = useGameLocal()

  // Initialize game state
  useEffect(() => {
    const initializeGameState = async () => {
      try {
        // Check if we have local game data
        const gameDataStr = localStorage.getItem("storyforge-local-game")
        if (!gameDataStr) {
          setLoadingError("No local game data found. Please start a new game.")
          setIsLoading(false)
          return
        }

        const gameData = JSON.parse(gameDataStr)
        setDebugInfo(`Game data found: ${JSON.stringify(gameData)}`)

        if (gameData.gameMode !== "local") {
          setLoadingError("Invalid game mode. Please start a new local game.")
          setIsLoading(false)
          return
        }

        // Load the game
        console.log("Loading local game for play...")
        const loaded = await loadGame()
        if (!loaded) {
          setLoadingError("Failed to load local game. Please start a new game.")
          setIsLoading(false)
          return
        }

        setIsLoading(false)
      } catch (err) {
        console.error("Error initializing local game:", err)
        setLoadingError(`Failed to initialize game: ${err instanceof Error ? err.message : String(err)}`)
        setIsLoading(false)
      }
    }

    initializeGameState()
  }, [loadGame])

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
      // Store game state for story page
      localStorage.setItem("storyforge-final-game", JSON.stringify(gameState))
      router.push("/local/story")
    }
  }, [gameState, router])

  const handleRollDice = async () => {
    if (!gameState || isRolling) return

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
    if (!gameState) return

    setShowDiceAnimation(false)

    // Move player after dice animation
    const currentPlayerId = gameState.currentPlayerId

    try {
      await movePlayer(currentPlayerId, rolledValue)
    } catch (error) {
      console.error("Error moving player:", error)
    } finally {
      setIsRolling(false)
    }
  }

  const handleResolveEvent = async (success: boolean, choice?: string) => {
    if (!gameState || !gameState.currentEvent) return

    await resolveEvent(gameState.currentPlayerId, success, choice)
    setShowEventModal(false)

    // Check if current player reached the end
    const currentPlayer = gameState.players[gameState.currentPlayerId]
    if (currentPlayer && currentPlayer.position >= gameState.board.tiles.length - 1) {
      setTimeout(() => {
        endGame()
      }, 2000)
    }
  }

  const handleRetry = () => {
    setLoadingError(null)
    setIsLoading(true)
    window.location.reload()
  }

  // Loading state
  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Loading Local Adventure</h2>
            <p className="text-blue-200 mb-4">Setting up your same-device game...</p>
            <Monitor className="w-8 h-8 text-green-400 mx-auto" />
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
            {debugInfo && (
              <div className="mb-6 p-4 bg-black/30 rounded text-xs text-left overflow-auto max-h-40">
                <pre className="text-gray-300">{debugInfo}</pre>
              </div>
            )}
            <div className="flex justify-center gap-4">
              <Button onClick={handleRetry} className="bg-blue-600 hover:bg-blue-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Button onClick={() => router.push("/local")} variant="outline" className="border-white/30 text-white">
                Back to Setup
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No game state
  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Game Not Found</h2>
            <p className="text-blue-200 mb-4">Unable to load the local game. Please return to setup and try again.</p>
            <Button onClick={() => router.push("/local")} className="bg-blue-600 hover:bg-blue-700">
              Back to Setup
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const players = Object.values(gameState.players)
  const currentTurnPlayer = gameState.players[gameState.currentPlayerId]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-yellow-400 mb-2">Local StoryForge Adventure</h1>
          <p className="text-blue-200">{gameState.theme}</p>
          <div className="flex justify-center items-center gap-2 mt-2">
            <Monitor className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm">Same Device Play</span>
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

                    {!gameState.currentEvent && (
                      <div className="space-y-3">
                        <p className="text-sm text-yellow-400 mb-2">{currentTurnPlayer.name}, it's your turn!</p>
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

                    {gameState.currentEvent && (
                      <p className="text-sm text-yellow-400">Resolve the current event to continue</p>
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
                            className={`w-8 h-8 ${player.color} rounded-full flex items-center justify-center text-white font-bold text-sm ${
                              player.id === currentTurnPlayer?.id ? "ring-2 ring-yellow-400" : ""
                            }`}
                          >
                            {player.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              <p className="text-sm font-medium text-white">{player.name}</p>
                              {index === 0 && <Crown className="w-3 h-3 text-yellow-400" />}
                              {player.id === currentTurnPlayer?.id && (
                                <span className="text-xs text-yellow-400">← Turn</span>
                              )}
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

            {/* Turn Instructions */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-white mb-2">Pass the Device!</h3>
                <p className="text-sm text-blue-200">
                  Hand the device to <span className="text-yellow-400 font-medium">{currentTurnPlayer?.name}</span> to
                  take their turn
                </p>
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
                <div className="mb-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <p className="text-sm text-yellow-400 font-medium">{currentTurnPlayer?.name}, make your choice:</p>
                </div>

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

export default function LocalPlay() {
  return (
    <ClientWrapper>
      <LocalPlayContent />
    </ClientWrapper>
  )
}
