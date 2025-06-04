"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ArrowLeft, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useGameSupabase } from "@/hooks/use-game-supabase"
import ClientWrapper from "@/components/client-wrapper"

function JoinGameContent() {
  const [gameId, setGameId] = useState("")
  const [playerName, setPlayerName] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { joinGame } = useGameSupabase()

  useEffect(() => {
    // Get game ID from URL params
    const id = searchParams.get("id")
    if (id) {
      setGameId(id)
    }

    // Load player data
    const playerData = localStorage.getItem("storyforge-player")
    if (playerData) {
      const data = JSON.parse(playerData)
      setPlayerName(data.playerName)
    }
  }, [searchParams])

  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      setError("Please enter your name!")
      return
    }
    if (!gameId.trim()) {
      setError("Please enter a game ID!")
      return
    }

    setIsJoining(true)
    setError("")

    try {
      console.log("Attempting to join game:", gameId.trim(), "as:", playerName.trim())

      const success = await joinGame(gameId.trim(), playerName.trim())

      if (success) {
        console.log("Successfully joined game, saving data and navigating...")

        const gameData = {
          playerName: playerName.trim(),
          gameId: gameId.trim(),
          isHost: false,
        }

        localStorage.setItem("storyforge-player", JSON.stringify(gameData))

        // Add a small delay to ensure state is updated
        setTimeout(() => {
          router.push("/game/lobby")
        }, 500)
      } else {
        setError("Failed to join game. Please check the game ID and try again.")
      }
    } catch (err) {
      console.error("Error joining game:", err)
      setError("Failed to join game. Please try again.")
    } finally {
      setIsJoining(false)
    }
  }

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
            <h1 className="text-3xl font-bold text-yellow-400">Join Adventure</h1>
            <p className="text-blue-200">Enter the game room and start your story</p>
          </div>
          <div></div>
        </div>

        {/* Join Form */}
        <div className="max-w-md mx-auto">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white text-center">
                <Users className="w-5 h-5" />
                Join StoryForge Adventure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2 text-blue-200">Your Name</label>
                <Input
                  placeholder="Enter your name..."
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-blue-300"
                  disabled={isJoining}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-blue-200">Game ID</label>
                <Input
                  placeholder="Enter game room ID..."
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value.toUpperCase())}
                  className="bg-white/20 border-white/30 text-white placeholder:text-blue-300 font-mono"
                  disabled={isJoining}
                />
                <p className="text-xs text-blue-300 mt-1">Ask your friend for the 6-character game ID</p>
              </div>

              <Button
                onClick={handleJoinGame}
                disabled={isJoining || !playerName.trim() || !gameId.trim()}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-lg py-6"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Joining Adventure...
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5 mr-3" />
                    Join Adventure
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 mt-6">
            <CardContent className="p-6">
              <h3 className="font-semibold text-white mb-3">How to Join:</h3>
              <ol className="space-y-2 text-sm text-blue-200">
                <li>1. Get the game ID from your friend who created the adventure</li>
                <li>2. Enter your name and the 6-character game ID above</li>
                <li>3. Click "Join Adventure" to enter the lobby</li>
                <li>4. Wait for the host to start your epic journey!</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function JoinGame() {
  return (
    <ClientWrapper>
      <JoinGameContent />
    </ClientWrapper>
  )
}
