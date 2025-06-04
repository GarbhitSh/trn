"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Users, Play, Crown, Sparkles, ArrowLeft, Wand2, Loader2, Zap, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useGameLocal } from "@/hooks/use-game-local"
import { hasPrebuiltBoard } from "@/lib/prebuilt-boards"

function LocalLobbyContent() {
  const [playerData, setPlayerData] = useState<any>(null)
  const [newPlayerName, setNewPlayerName] = useState("")
  const [isStarting, setIsStarting] = useState(false)
  const [isInstantPlay, setIsInstantPlay] = useState(false)
  const [isCreatingGame, setIsCreatingGame] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const router = useRouter()
  const { gameState, currentPlayer, loading, error, createGame, addPlayer, startGame, loadGame } = useGameLocal()
  const [errorMessage, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeLocalGame = async () => {
      // Load player data from localStorage
      const data = localStorage.getItem("storyforge-player")
      if (!data) {
        console.error("No player data found")
        setError("No player data found. Please start a new game.")
        return
      }

      try {
        const parsedData = JSON.parse(data)
        setPlayerData(parsedData)
        setDebugInfo(`Player data: ${JSON.stringify(parsedData)}`)

        // Check if this is an instant play theme
        if (parsedData.theme && hasPrebuiltBoard(parsedData.theme)) {
          setIsInstantPlay(true)
        }

        if (parsedData.isHost && parsedData.gameMode === "local") {
          console.log("Host creating new local game...")
          setIsCreatingGame(true)

          try {
            // Create game with board - the createGame function will handle initialization
            const gameId = await createGame(parsedData.playerName, parsedData.theme)
            if (gameId) {
              console.log("Local game successfully created:", gameId)
              setDebugInfo((prev) => `${prev}\nGame created with ID: ${gameId}`)
            } else {
              console.error("Failed to create local game")
              setError("Failed to create local game. Please try again.")
              setDebugInfo((prev) => `${prev}\nFailed to create game: null gameId returned`)
            }
          } catch (error) {
            console.error("Failed to create local game:", error)
            setError(`Failed to create local game: ${error instanceof Error ? error.message : String(error)}`)
            setDebugInfo(
              (prev) => `${prev}\nError creating game: ${error instanceof Error ? error.message : String(error)}`,
            )
          } finally {
            setIsCreatingGame(false)
          }
        } else {
          // Try to load existing game
          console.log("Attempting to load existing local game...")
          const loaded = await loadGame()
          if (!loaded) {
            console.error("Failed to load existing game")
            setError("Failed to load existing game. Please start a new game.")
            setDebugInfo((prev) => `${prev}\nFailed to load existing game`)
          } else {
            setDebugInfo((prev) => `${prev}\nSuccessfully loaded existing game`)
          }
        }
      } catch (error) {
        console.error("Error parsing player data:", error)
        setError(`Invalid player data: ${error instanceof Error ? error.message : String(error)}`)
        setDebugInfo(
          (prev) => `${prev}\nError parsing player data: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    }

    initializeLocalGame()
  }, [createGame, loadGame])

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) {
      alert("Please enter a player name!")
      return
    }

    const success = await addPlayer(newPlayerName.trim())
    if (success) {
      setNewPlayerName("")
    } else {
      alert("Failed to add player. Game might be full or already started.")
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
    console.log("Starting local game...")

    try {
      const success = await startGame()
      console.log("Start game success:", success)

      if (success) {
        console.log("Local game started successfully, navigating to play page...")
        setTimeout(() => {
          router.push("/local/play")
        }, 500)
      } else {
        console.error("Failed to start local game")
        alert("Failed to start game. Please try again.")
        setIsStarting(false)
      }
    } catch (error) {
      console.error("Error starting local game:", error)
      alert("Error starting game. Please try again.")
      setIsStarting(false)
    }
  }

  if (loading || isCreatingGame) {
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
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || errorMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <Card className="bg-red-500/10 backdrop-blur-sm border-red-500/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
            <p className="text-red-200 mb-4">{error || errorMessage}</p>
            {debugInfo && (
              <div className="mb-6 p-4 bg-black/30 rounded text-xs text-left overflow-auto max-h-40">
                <pre className="text-gray-300">{debugInfo}</pre>
              </div>
            )}
            <div className="space-y-2">
              <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 mr-2">
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

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Loading Game...</h2>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4" />
            <p className="text-blue-200 text-sm">Setting up local game...</p>
            {debugInfo && (
              <div className="mt-6 p-4 bg-black/30 rounded text-xs text-left overflow-auto max-h-40">
                <pre className="text-gray-300">{debugInfo}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const players = Object.values(gameState.players)
  const isPrebuilt = hasPrebuiltBoard(gameState.theme)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => router.push("/local")} className="text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Setup
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-yellow-400">Local Game Lobby</h1>
            <p className="text-blue-200">Same Device Multiplayer</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                {gameState.gamePhase === "lobby" ? "Setting Up" : gameState.gamePhase}
              </Badge>
              {isPrebuilt && (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  <Zap className="w-3 h-3 mr-1" />
                  Instant Play
                </Badge>
              )}
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
                          <p className="text-sm text-blue-200">Karma: {player.karma}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {player.isHost && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            <Crown className="w-3 h-3 mr-1" />
                            Host
                          </Badge>
                        )}
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Ready</Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {players.length < 4 && (
                  <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-sm text-blue-200 text-center">Add more players to join the adventure!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">How to Play</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 text-sm text-blue-200">
                  <li>1. Add all players who will be participating</li>
                  <li>2. Start the game when everyone is ready</li>
                  <li>3. Pass the device between players for each turn</li>
                  <li>4. Make choices and roll dice when it's your turn</li>
                  <li>5. Enjoy your personalized story at the end!</li>
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* Add Players & Actions */}
          <div className="space-y-6">
            {/* Add Player */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <UserPlus className="w-5 h-5" />
                  Add Player
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Input
                    placeholder="Enter player name..."
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddPlayer()}
                    className="bg-white/20 border-white/30 text-white placeholder:text-blue-300"
                    disabled={players.length >= 4}
                  />
                  <Button
                    onClick={handleAddPlayer}
                    disabled={!newPlayerName.trim() || players.length >= 4}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Player
                  </Button>
                  {players.length >= 4 && <p className="text-sm text-yellow-400 text-center">Maximum 4 Players!</p>}
                </div>
              </CardContent>
            </Card>

            {/* Start Game */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Play className="w-5 h-5" />
                  Start Game
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-200 text-sm mb-4">Once all players have joined, the host can start the game.</p>
                <Button
                  onClick={handleStartGame}
                  disabled={Object.keys(gameState.players).length < 1 || isStarting}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isStarting ? (
                    <>
                      Starting...
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Adventure
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        {debugInfo && (
          <div className="mt-8 p-4 bg-black/30 rounded text-xs text-left overflow-auto max-h-40">
            <pre className="text-gray-300">{debugInfo}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default LocalLobbyContent
