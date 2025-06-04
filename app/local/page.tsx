"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Sparkles, GamepadIcon, Wand2, Zap, Monitor, UserPlus, Play } from "lucide-react"
import { useRouter } from "next/navigation"
import { generateRandomTheme } from "@/lib/gemini"
import { QUICK_THEMES, hasPrebuiltBoard } from "@/lib/prebuilt-boards"
import ClientWrapper from "@/components/client-wrapper"

function LocalGamePageContent() {
  const [playerName, setPlayerName] = useState("")
  const [gameTheme, setGameTheme] = useState("")
  const [isGeneratingTheme, setIsGeneratingTheme] = useState(false)
  const router = useRouter()

  const generateRandomThemeHandler = async () => {
    setIsGeneratingTheme(true)
    try {
      const theme = await generateRandomTheme()
      setGameTheme(theme)
    } catch (error) {
      console.error("Failed to generate theme:", error)
      const fallbackThemes = [
        "Jungle Safari Adventure",
        "Ghost Town Road Trip",
        "Space Station Mystery",
        "Medieval Castle Quest",
        "Underwater Treasure Hunt",
      ]
      setGameTheme(fallbackThemes[Math.floor(Math.random() * fallbackThemes.length)])
    }
    setIsGeneratingTheme(false)
  }

  const createLocalGame = async () => {
    if (!playerName.trim()) {
      alert("Please enter your name!")
      return
    }
    if (!gameTheme.trim()) {
      alert("Please select or generate a theme!")
      return
    }

    const gameData = {
      playerName: playerName.trim(),
      theme: gameTheme.trim(),
      isHost: true,
      gameMode: "local",
    }

    localStorage.setItem("storyforge-player", JSON.stringify(gameData))
    router.push("/local/lobby")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Monitor className="w-12 h-12 text-green-400" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Local Play
            </h1>
          </div>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Play StoryForge on the same device! Perfect for family game nights, parties, or when you want to play
            without internet.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <Monitor className="w-3 h-3 mr-1" />
              Same Device
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              <Users className="w-3 h-3 mr-1" />
              Hot-Seat Multiplayer
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              No Internet Required
            </Badge>
          </div>
        </div>

        {/* Main Game Setup */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Player Setup */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="w-5 h-5" />
                First Player Setup
              </CardTitle>
              <CardDescription className="text-blue-200">
                Enter the name of the first player to start the game
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-blue-200">Player Name</label>
                <Input
                  placeholder="Enter first player's name..."
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-blue-300"
                />
              </div>
            </CardContent>
          </Card>

          {/* Theme Selection */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Sparkles className="w-5 h-5" />
                Game Theme
              </CardTitle>
              <CardDescription className="text-blue-200">
                Choose a pre-built adventure or let AI create something new
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-blue-200">Theme</label>
                <Input
                  placeholder="e.g., Family game night, Office party..."
                  value={gameTheme}
                  onChange={(e) => setGameTheme(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-blue-300"
                />
              </div>

              <Button
                onClick={generateRandomThemeHandler}
                disabled={isGeneratingTheme}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                {isGeneratingTheme ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    AI is thinking...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />🎲 Generate AI Theme!
                  </>
                )}
              </Button>

              <div className="space-y-2">
                <p className="text-sm text-blue-200 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Instant Play Themes:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {QUICK_THEMES.map((theme, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30 transition-colors p-2 text-center justify-center"
                      onClick={() => setGameTheme(theme)}
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      {theme}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-green-300 text-center">
                  ⚡ These themes start instantly - no AI generation delay!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Game Actions */}
        <div className="max-w-2xl mx-auto mt-12 space-y-4">
          <Button
            onClick={createLocalGame}
            size="lg"
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-lg py-6"
          >
            <GamepadIcon className="w-6 h-6 mr-3" />
            Start Local Game
            {gameTheme && hasPrebuiltBoard(gameTheme) && (
              <Badge className="ml-2 bg-green-600/20 text-green-300 border-green-500/30">
                <Zap className="w-3 h-3 mr-1" />
                Instant
              </Badge>
            )}
          </Button>

          <div className="text-center">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              Back to Main Menu
            </Button>
          </div>
        </div>

        {/* How Local Play Works */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-center text-white mb-8">How Local Play Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold text-white mb-2">Setup Game</h3>
              <p className="text-sm text-blue-200">Choose theme and enter first player's name</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold text-white mb-2">Add Players</h3>
              <p className="text-sm text-blue-200">Add up to 4 players on the same device</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold text-white mb-2">Take Turns</h3>
              <p className="text-sm text-blue-200">Pass the device between players for each turn</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                4
              </div>
              <h3 className="font-semibold text-white mb-2">Enjoy Stories</h3>
              <p className="text-sm text-blue-200">Get personalized endings for each player</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-6xl mx-auto mt-16 grid md:grid-cols-3 gap-6">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6 text-center">
              <Monitor className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Same Device Play</h3>
              <p className="text-blue-200 text-sm">
                No internet or multiple devices needed - perfect for gatherings and family time
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6 text-center">
              <UserPlus className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Easy Player Management</h3>
              <p className="text-blue-200 text-sm">
                Add players on the fly and manage turns seamlessly with hot-seat gameplay
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6 text-center">
              <Play className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Instant Start</h3>
              <p className="text-blue-200 text-sm">
                No waiting for connections or server issues - start playing immediately
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function LocalGamePage() {
  return (
    <ClientWrapper>
      <LocalGamePageContent />
    </ClientWrapper>
  )
}
