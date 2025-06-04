"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  Users,
  Sparkles,
  GamepadIcon,
  Share2,
  Wand2,
  Zap,
  Monitor,
  Wifi,
  Coins,
  Trophy,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { generateRandomTheme } from "@/lib/gemini"
import { QUICK_THEMES, hasPrebuiltBoard } from "@/lib/prebuilt-boards"
import ClientWrapper from "@/components/client-wrapper"
import { WalletConnection } from "@/components/wallet-connection"
import { useTRNWallet } from "@/hooks/use-trn-wallet"

const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6]

function HomePageContent() {
  const [playerName, setPlayerName] = useState("")
  const [gameTheme, setGameTheme] = useState("")
  const [isGeneratingTheme, setIsGeneratingTheme] = useState(false)
  const router = useRouter()

  const { isConnected, address } = useTRNWallet()

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

  const createGame = async () => {
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
      walletAddress: isConnected ? address : null,
      blockchainEnabled: isConnected,
    }

    localStorage.setItem("storyforge-player", JSON.stringify(gameData))
    router.push("/game/lobby")
  }

  const joinGame = async () => {
    if (!playerName.trim()) {
      alert("Please enter your name!")
      return
    }

    const gameData = {
      playerName: playerName.trim(),
      isHost: false,
      walletAddress: isConnected ? address : null,
      blockchainEnabled: isConnected,
    }

    localStorage.setItem("storyforge-player", JSON.stringify(gameData))
    router.push("/game/join")
  }

  const createLocalGame = () => {
    router.push("/local")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GamepadIcon className="w-12 h-12 text-yellow-400" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              StoryForge
            </h1>
          </div>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            The AI-powered board game where every story is unique. Built for TRN with real $ROOT rewards and NFT
            collectibles!
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <Wand2 className="w-3 h-3 mr-1" />
              AI-Powered Stories
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              <Users className="w-3 h-3 mr-1" />
              Multiplayer
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              Dynamic Boards
            </Badge>
            {isConnected && (
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                <Coins className="w-3 h-3 mr-1" />
                TRN Connected
              </Badge>
            )}
          </div>
        </div>

        {/* Wallet Connection */}
        <div className="max-w-4xl mx-auto mb-8">
          <WalletConnection />
        </div>

        {/* Game Mode Selection */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 mb-12">
          {/* Online Multiplayer */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Wifi className="w-5 h-5" />
                Online Multiplayer
                {isConnected && (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                    <Coins className="w-3 h-3 mr-1" />
                    +$ROOT
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-blue-200">
                Play with friends worldwide.{" "}
                {isConnected ? "Earn $ROOT tokens and mint NFTs!" : "Connect wallet for rewards!"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Real-time sync</Badge>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Up to 4 players</Badge>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Cross-device</Badge>
                {isConnected && (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Blockchain rewards</Badge>
                )}
              </div>
              <p className="text-sm text-blue-200">
                Create a room and share the code with friends. Everyone plays on their own device with live updates.
                {isConnected && " Earn real $ROOT tokens and mint story NFTs!"}
              </p>
            </CardContent>
          </Card>

          {/* Local Multiplayer */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Monitor className="w-5 h-5" />
                Local Multiplayer
              </CardTitle>
              <CardDescription className="text-blue-200">
                Play on the same device - perfect for family game nights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Same device</Badge>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">No internet needed</Badge>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Instant start</Badge>
              </div>
              <p className="text-sm text-blue-200">
                Pass the device between players for each turn. Great for parties and family time!
              </p>
              <Button
                onClick={createLocalGame}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                <Monitor className="w-4 h-4 mr-2" />
                Start Local Game
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Online Game Setup */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-white mb-6">
            {isConnected ? "Start Your TRN-Powered Adventure" : "Online Game Setup"}
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Player Setup */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="w-5 h-5" />
                  Player Setup
                </CardTitle>
                <CardDescription className="text-blue-200">
                  Enter your name to begin your StoryForge adventure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-blue-200">Your Name</label>
                  <Input
                    placeholder="Enter your name..."
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder:text-blue-300"
                  />
                </div>
                {isConnected && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-green-400 text-sm flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      TRN wallet connected! You'll earn real $ROOT tokens and can mint NFTs.
                    </p>
                  </div>
                )}
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
                    placeholder="e.g., Playing with cousins, Office team building..."
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
                    {QUICK_THEMES.slice(0, 3).map((theme, index) => (
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
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Actions */}
          <div className="max-w-2xl mx-auto space-y-4">
            <Button
              onClick={createGame}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg py-6"
            >
              <Wifi className="w-6 h-6 mr-3" />
              Create Online Game
              {gameTheme && hasPrebuiltBoard(gameTheme) && (
                <Badge className="ml-2 bg-blue-600/20 text-blue-300 border-blue-500/30">
                  <Zap className="w-3 h-3 mr-1" />
                  Instant
                </Badge>
              )}
              {isConnected && (
                <Badge className="ml-2 bg-yellow-600/20 text-yellow-300 border-yellow-500/30">
                  <Coins className="w-3 h-3 mr-1" />
                  Earn $ROOT
                </Badge>
              )}
            </Button>

            <div className="text-center">
              <span className="text-blue-300">or</span>
            </div>

            <Button
              onClick={joinGame}
              size="lg"
              variant="outline"
              className="w-full border-white/30 text-white hover:bg-white/10 text-lg py-6"
            >
              <Share2 className="w-6 h-6 mr-3" />
              Join Existing Game
              {isConnected && (
                <Badge className="ml-2 bg-yellow-600/20 text-yellow-300 border-yellow-500/30">
                  <Coins className="w-3 h-3 mr-1" />
                  Earn $ROOT
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* TRN Features Showcase */}
        <div className="max-w-6xl mx-auto mt-16 grid md:grid-cols-3 gap-6">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6 text-center">
              <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Fee Pallets</h3>
              <p className="text-blue-200 text-sm">
                All gameplay transactions are gasless! Pay fees in $ROOT, karma tokens, or any supported asset.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6 text-center">
              <Trophy className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">NFT Collectibles</h3>
              <p className="text-blue-200 text-sm">
                Mint unique story NFTs, achievement badges, and collectible game moments using TRN's NFT pallets.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6 text-center">
              <Coins className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">$ROOT Rewards</h3>
              <p className="text-blue-200 text-sm">
                Earn real $ROOT tokens for karma points, game completion, and achievements. True play-to-earn gaming!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <ClientWrapper>
      <HomePageContent />
    </ClientWrapper>
  )
}
