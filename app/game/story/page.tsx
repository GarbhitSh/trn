"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Crown, Home, RotateCcw, Share2, Sparkles, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useGameSupabase } from "@/hooks/use-game-supabase"
import ClientWrapper from "@/components/client-wrapper"

function GameStoryContent() {
  const [playerStories, setPlayerStories] = useState<{ [playerId: string]: string }>({})
  const [isGeneratingStories, setIsGeneratingStories] = useState(true)
  const [winner, setWinner] = useState<any>(null)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const router = useRouter()

  const { gameState, generateStories, initializeGame } = useGameSupabase()

  // Initialize game from stored data if needed
  useEffect(() => {
    const initializeGameState = async () => {
      try {
        // Check for transition data in sessionStorage
        const transitionData = sessionStorage.getItem("storyforge-game-state")
        if (transitionData) {
          const { gameId } = JSON.parse(transitionData)

          // Get player data from localStorage
          const playerDataStr = localStorage.getItem("storyforge-player")
          if (playerDataStr) {
            const playerData = JSON.parse(playerDataStr)

            // Initialize game with the stored IDs
            initializeGame(gameId, playerData.playerId)

            // Clear transition data
            sessionStorage.removeItem("storyforge-game-state")
          }
        }
      } catch (err) {
        console.error("Error initializing game:", err)
        setLoadingError("Failed to initialize game. Please try again.")
      }
    }

    initializeGameState()
  }, [initializeGame])

  // Generate stories when game state is available
  useEffect(() => {
    if (gameState) {
      generatePlayerStories()
    }
  }, [gameState])

  const generatePlayerStories = async () => {
    if (!gameState) return

    setIsGeneratingStories(true)

    try {
      const stories = await generateStories()
      setPlayerStories(stories)

      // Determine winner
      const players = Object.values(gameState.players)
      const sortedPlayers = players.sort((a, b) => b.karma - a.karma)
      setWinner(sortedPlayers[0])
    } catch (error) {
      console.error("Error generating stories:", error)
      setLoadingError("Failed to generate stories. Please try again.")
    }

    setIsGeneratingStories(false)
  }

  const shareStory = () => {
    if (!gameState || !winner) return

    const storyText = `I just completed an epic StoryForge adventure! 🎮✨

Theme: "${gameState.theme}"
Winner: ${winner.name} with ${winner.karma} karma points!

Every choice mattered, every decision shaped our story. The AI created a unique adventure just for us!

Play your own story at ${window.location.origin}`

    if (navigator.share) {
      navigator.share({
        title: "StoryForge Adventure Complete!",
        text: storyText,
        url: window.location.origin,
      })
    } else {
      navigator.clipboard.writeText(storyText)
      alert("Story copied to clipboard!")
    }
  }

  const playAgain = () => {
    localStorage.removeItem("storyforge-player")
    localStorage.removeItem("storyforge-game")
    localStorage.removeItem("storyforge-final")
    router.push("/")
  }

  // Loading state
  if (isGeneratingStories) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 max-w-lg mx-4">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Crafting Your Epic Tales...</h2>
            <p className="text-blue-200 mb-2">AI is analyzing your journey and choices</p>
            <p className="text-blue-200 mb-2">Weaving personalized narratives for each adventurer</p>
            <p className="text-blue-200">Creating memories that will last forever</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (loadingError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <Card className="bg-red-500/10 backdrop-blur-sm border-red-500/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
            <p className="text-red-200 mb-6">{loadingError}</p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
                <Loader2 className="w-4 h-4 mr-2" />
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

  // No game state
  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Loading Stories...</h2>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto" />
          </CardContent>
        </Card>
      </div>
    )
  }

  const players = Object.values(gameState.players).sort((a, b) => b.karma - a.karma)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">Your Epic StoryForge Adventure</h1>
          <p className="text-xl text-blue-200">{gameState.theme}</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Generated Stories
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Adventure Complete</Badge>
          </div>
        </div>

        {/* Winner Announcement */}
        {winner && (
          <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50 mb-8 max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">🎉 Legendary Victory! 🎉</h2>
              <p className="text-xl text-yellow-400 mb-2">
                {winner.name} emerges victorious with {winner.karma} karma!
              </p>
              <p className="text-blue-200">The most virtuous soul of this epic adventure</p>
            </CardContent>
          </Card>
        )}

        {/* Player Stories */}
        <div className="max-w-4xl mx-auto space-y-6 mb-8">
          {players.map((player, index) => (
            <Card key={player.id} className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 ${player.color} rounded-full flex items-center justify-center text-white font-bold text-lg`}
                    >
                      {player.avatar}
                    </div>
                    <div>
                      <CardTitle className="text-white">{player.name}'s Epic Journey</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          <Star className="w-3 h-3 mr-1" />
                          {player.karma} Karma
                        </Badge>
                        {index === 0 && (
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                            <Crown className="w-3 h-3 mr-1" />
                            Champion
                          </Badge>
                        )}
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Rank #{index + 1}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-yellow-400">#{index + 1}</p>
                    <p className="text-sm text-blue-200">Final Rank</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <p className="text-blue-100 leading-relaxed">
                    {playerStories[player.id] ||
                      `${player.name} embarked on an incredible journey through "${gameState.theme}". With ${player.karma} karma points, they showed their true character through every choice and challenge. Their adventure will be remembered as a testament to their spirit and determination.`}
                  </p>
                </div>

                {/* Player Actions Summary */}
                {player.actions.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-blue-200 mb-2">Key Moments:</p>
                    <div className="flex flex-wrap gap-1">
                      {player.actions.slice(0, 3).map((action, actionIndex) => (
                        <Badge key={actionIndex} variant="secondary" className="bg-white/10 text-blue-300 text-xs">
                          {action}
                        </Badge>
                      ))}
                      {player.actions.length > 3 && (
                        <Badge variant="secondary" className="bg-white/10 text-blue-300 text-xs">
                          +{player.actions.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              onClick={shareStory}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg py-6"
            >
              <Share2 className="w-5 h-5 mr-3" />
              Share Epic Tale
            </Button>
            <Button
              onClick={playAgain}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-lg py-6"
            >
              <RotateCcw className="w-5 h-5 mr-3" />
              New Adventure
            </Button>
          </div>

          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="w-full border-white/30 text-white hover:bg-white/10 text-lg py-6"
          >
            <Home className="w-5 h-5 mr-3" />
            Return Home
          </Button>
        </div>

        {/* Adventure Statistics */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 max-w-2xl mx-auto mt-8">
          <CardHeader>
            <CardTitle className="text-white text-center">Adventure Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-yellow-400">{players.length}</p>
                <p className="text-sm text-blue-200">Adventurers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{Math.max(...players.map((p) => p.karma))}</p>
                <p className="text-sm text-blue-200">Max Karma</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400">{gameState.board.tiles.length}</p>
                <p className="text-sm text-blue-200">Unique Tiles</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-400">∞</p>
                <p className="text-sm text-blue-200">Memories</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Story Context */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 max-w-2xl mx-auto mt-6">
          <CardContent className="p-6 text-center">
            <p className="text-blue-200 italic">"{gameState.board.storyContext}"</p>
            <p className="text-sm text-blue-300 mt-2">- Your AI Storyteller</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function GameStory() {
  return (
    <ClientWrapper>
      <GameStoryContent />
    </ClientWrapper>
  )
}
