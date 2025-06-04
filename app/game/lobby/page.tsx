"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Users, Copy, Play, Crown, MessageCircle, Sparkles, ArrowLeft, Wand2, Loader2, Zap } from "lucide-react"
import { useRouter } from "next/navigation"
import { useGameSupabase } from "@/hooks/use-game-supabase"
import ClientWrapper from "@/components/client-wrapper"
import DatabaseSetupGuide from "@/components/database-setup-guide"
import ConnectionStatus from "@/components/connection-status"
import { hasPrebuiltBoard } from "@/lib/prebuilt-boards"

function GameLobbyContent() {
  const [playerData, setPlayerData] = useState<any>(null)
  const [gameId, setGameId] = useState("")
  const [chatMessage, setChatMessage] = useState("")
  const [copySuccess, setCopySuccess] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [isInstantPlay, setIsInstantPlay] = useState(false)
  const router = useRouter()
  const {
    gameState,
    chatMessages,
    currentPlayer,
    loading,
    error,
    initializeGame,
    createGame,
    startGame,
    sendChatMessage,
  } = useGameSupabase()

  // Use ref to prevent multiple initializations
  const initializationRef = useRef(false)
  const gameCreatedRef = useRef(false)

  useEffect(() => {
    // Prevent multiple initializations
    if (initializationRef.current) return

    // Load player data from localStorage
    const data = localStorage.getItem("storyforge-player")
    if (data) {
      try {
        const parsedData = JSON.parse(data)
        setPlayerData(parsedData)

        // Check if this is an instant play theme
        if (parsedData.theme && hasPrebuiltBoard(parsedData.theme)) {
          setIsInstantPlay(true)
        }

        if (parsedData.isHost && !gameCreatedRef.current) {
          initializationRef.current = true
          gameCreatedRef.current = true

          console.log("Initializing host game creation...")

          // Initialize and create game
          const { gameId: newGameId } = initializeGame()
          setGameId(newGameId)

          // Create game with AI-generated board
          createGame(parsedData.playerName, parsedData.theme)
            .then((createdGameId) => {
              if (createdGameId) {
                console.log("Game successfully created:", createdGameId)
                // Don't reload - let the real-time updates handle state changes
              } else {
                console.error("Failed to create game - no ID returned")
                gameCreatedRef.current = false
              }
            })
            .catch((error) => {
              console.error("Failed to create game:", error)
              gameCreatedRef.current = false
            })
        } else if (parsedData.gameId) {
          // If we're joining an existing game, set the game ID and initialize
          setGameId(parsedData.gameId)
          initializeGame(parsedData.gameId, parsedData.playerId)
        }
      } catch (error) {
        console.error("Error parsing player data:", error)
      }
    }
  }, [initializeGame, createGame])

  // Update game ID from game state when available
  useEffect(() => {
    if (gameState && gameState.id) {
      setGameId(gameState.id)
    }
  }, [gameState])

  const copyInviteLink = async () => {
    const inviteLink = `${window.location.origin}/game/join?id=${gameId}`

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(inviteLink)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea")
        textArea.value = inviteLink
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        textArea.style.top = "-999999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        try {
          document.execCommand("copy")
          setCopySuccess(true)
          setTimeout(() => setCopySuccess(false), 2000)
        } catch (err) {
          console.error("Fallback copy failed:", err)
          alert(`Copy this invite link: ${inviteLink}`)
        }

        document.body.removeChild(textArea)
      }
    } catch (err) {
      console.error("Failed to copy:", err)
      alert(`Copy this invite link: ${inviteLink}`)
    }
  }

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      sendChatMessage(chatMessage.trim())
      setChatMessage("")
    }
  }

  const handleStartGame = async () => {
    if (!gameState || isStarting) return

    const playerCount = Object.keys(gameState.players).length
    if (playerCount < 1) {
      alert("Need at least 1 player to start!")
      return
    }

    setIsStarting(true)
    console.log("Attempting to start game...")

    try {
      const success = await startGame()
      console.log("Start game success:", success)

      if (success) {
        console.log("Game started successfully, navigating to play page...")

        // Store game state in sessionStorage to ensure persistence during navigation
        try {
          if (gameState) {
            sessionStorage.setItem(
              "storyforge-game-state",
              JSON.stringify({
                gameId: gameState.id,
                phase: "playing",
              }),
            )
          }
        } catch (err) {
          console.error("Failed to store game state:", err)
        }

        // Add a small delay to ensure state is updated
        setTimeout(() => {
          router.push("/game/play")
        }, 500)
      } else {
        console.error("Failed to start game")
        alert("Failed to start game. Please try again.")
        setIsStarting(false)
      }
    } catch (error) {
      console.error("Error starting game:", error)
      alert("Error starting game. Please try again.")
      setIsStarting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">
              {isInstantPlay ? "Loading Instant Adventure..." : "Creating Your Adventure..."}
            </h2>
            <p className="text-blue-200 mb-2">
              {isInstantPlay ? "Pre-built board loading instantly!" : "AI is generating your unique game board"}
            </p>
            {!isInstantPlay && <p className="text-blue-200">This may take a moment due to rate limits</p>}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    // Check if it's a database setup issue
    if (error.includes("relation") && error.includes("does not exist")) {
      return <DatabaseSetupGuide />
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <Card className="bg-red-500/10 backdrop-blur-sm border-red-500/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
            <p className="text-red-200 mb-4">{error}</p>
            <div className="space-y-2">
              <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 mr-2">
                Retry
              </Button>
              <Button onClick={() => router.push("/")} variant="outline" className="border-white/30 text-white">
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Loading Game...</h2>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4" />
            <p className="text-blue-200 text-sm">Setting up real-time connections...</p>
            <ConnectionStatus showDetails={true} />

            {/* Add manual refresh option if loading takes too long */}
            <div className="mt-4">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
                className="border-white/30 text-white hover:bg-white/10"
              >
                Refresh if stuck
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const players = Object.values(gameState.players)
  const isHost = currentPlayer?.isHost || false
  const isPrebuilt = hasPrebuiltBoard(gameState.theme)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => router.push("/")} className="text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-yellow-400">Game Lobby</h1>
            <p className="text-blue-200">Room ID: {gameId}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                {gameState.gamePhase === "lobby" ? "Waiting to Start" : gameState.gamePhase}
              </Badge>
              {isPrebuilt && (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  <Zap className="w-3 h-3 mr-1" />
                  Instant Play
                </Badge>
              )}
              <ConnectionStatus showDetails={true} />
            </div>
          </div>
          <div></div>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
          {/* Game Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Theme Card */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Wand2 className="w-5 h-5" />
                  {isPrebuilt ? "Pre-built Adventure" : "AI-Generated Adventure"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`p-4 rounded-lg border border-white/10 ${isPrebuilt ? "bg-gradient-to-r from-green-500/20 to-blue-600/20" : "bg-gradient-to-r from-pink-500/20 to-purple-600/20"}`}
                >
                  <p className="text-lg font-medium text-white">{gameState.theme}</p>
                  <p className="text-sm text-blue-200 mt-2">{gameState.board.storyContext}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {gameState.board.tiles.length} Unique Tiles
                    </Badge>
                    {isPrebuilt ? (
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        <Zap className="w-3 h-3 mr-1" />
                        Instant Play
                      </Badge>
                    ) : (
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">AI-Powered</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Players */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="w-5 h-5" />
                  Players ({players.length}/4)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {players.map((player) => (
                    <div key={player.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 ${player.color} rounded-full flex items-center justify-center text-white font-bold`}
                        >
                          {player.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-white">{player.name}</p>
                          <p className="text-sm text-blue-200">
                            {player.isOnline ? "Online" : "Offline"} • Karma: {player.karma}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {player.isHost && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            <Crown className="w-3 h-3 mr-1" />
                            Host
                          </Badge>
                        )}
                        {player.isReady && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Ready</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {players.length < 4 && (
                  <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-sm text-blue-200 text-center">Waiting for more players to join...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Invite Section */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Invite Friends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    value={`${window.location.origin}/game/join?id=${gameId}`}
                    readOnly
                    className="bg-white/20 border-white/30 text-white"
                  />
                  <Button
                    onClick={copyInviteLink}
                    className={`${copySuccess ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-blue-200 mt-2">
                  {copySuccess
                    ? "✅ Link copied to clipboard!"
                    : "Share this link with friends to invite them to your adventure!"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Chat & Actions */}
          <div className="space-y-6">
            {/* Chat */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <MessageCircle className="w-5 h-5" />
                  Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 h-48 overflow-y-auto mb-3">
                  {chatMessages.map((msg, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium text-blue-300">{msg.playerName}:</span>
                      <span className="text-white ml-2">{msg.message}</span>
                    </div>
                  ))}
                  {chatMessages.length === 0 && (
                    <p className="text-blue-300 text-sm text-center py-8">No messages yet...</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="bg-white/20 border-white/30 text-white placeholder:text-blue-300"
                  />
                  <Button onClick={handleSendMessage} size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Send
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Start Game */}
            {isHost && (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <Button
                    onClick={handleStartGame}
                    disabled={players.length < 1 || isStarting}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-lg py-6"
                  >
                    {isStarting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        Starting Adventure...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-3" />
                        Start Adventure
                        {isPrebuilt && (
                          <Badge className="ml-2 bg-green-600/20 text-green-300 border-green-500/30">
                            <Zap className="w-3 h-3 mr-1" />
                            Instant
                          </Badge>
                        )}
                      </>
                    )}
                  </Button>
                  {players.length < 1 && (
                    <p className="text-sm text-yellow-400 text-center mt-2">Need at least 1 player to start</p>
                  )}
                </CardContent>
              </Card>
            )}

            {!isHost && (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6 text-center">
                  <p className="text-blue-200 mb-2">Waiting for host to start the game...</p>
                  <div className="animate-pulse w-8 h-8 bg-blue-500/20 rounded-full mx-auto" />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GameLobby() {
  return (
    <ClientWrapper>
      <GameLobbyContent />
    </ClientWrapper>
  )
}
