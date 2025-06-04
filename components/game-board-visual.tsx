"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Wand2, Zap, Trophy, Star, Heart } from "lucide-react"
import type { GameBoard, GameTile } from "@/lib/gemini"
import { getRandomGameImage } from "@/lib/graphics-api"
import { hasPrebuiltBoard } from "@/lib/prebuilt-boards"

interface GameBoardVisualProps {
  board: GameBoard
  players: any[]
  currentTile?: number
  animateMovement?: boolean
}

export default function GameBoardVisual({
  board,
  players,
  currentTile,
  animateMovement = false,
}: GameBoardVisualProps) {
  const [boardImage, setBoardImage] = useState<string>("")
  const [tileImages, setTileImages] = useState<{ [key: number]: string }>({})
  const [animatingPlayers, setAnimatingPlayers] = useState<Set<string>>(new Set())
  const isPrebuilt = hasPrebuiltBoard(board.theme)

  // Define the board path layout (snake-like pattern)
  const getBoardLayout = () => {
    const rows = 4
    const cols = 5
    const layout: number[][] = []

    for (let row = 0; row < rows; row++) {
      const rowTiles: number[] = []
      for (let col = 0; col < cols; col++) {
        if (row % 2 === 0) {
          // Left to right
          rowTiles.push(row * cols + col)
        } else {
          // Right to left
          rowTiles.push(row * cols + (cols - 1 - col))
        }
      }
      layout.push(rowTiles)
    }
    return layout
  }

  const boardLayout = getBoardLayout()

  useEffect(() => {
    // Generate board background image
    getRandomGameImage(board.theme).then(setBoardImage)

    // Generate images for special tiles
    const generateTileImages = async () => {
      const images: { [key: number]: string } = {}

      for (const tile of board.tiles) {
        if (tile.type === "start" || tile.type === "finish" || tile.type === "bonus") {
          try {
            const image = await getRandomGameImage(`${tile.type} ${tile.title}`)
            images[tile.id] = image
          } catch (error) {
            console.error(`Error generating image for tile ${tile.id}:`, error)
          }
        }
      }

      setTileImages(images)
    }

    generateTileImages()
  }, [board])

  const getTileColor = (tile: GameTile) => {
    const colors = {
      start: "bg-gradient-to-br from-emerald-400 to-emerald-600 border-emerald-300",
      finish: "bg-gradient-to-br from-orange-400 to-orange-600 border-orange-300",
      task: "bg-gradient-to-br from-blue-400 to-blue-600 border-blue-300",
      dare: "bg-gradient-to-br from-pink-400 to-pink-600 border-pink-300",
      action: "bg-gradient-to-br from-green-400 to-green-600 border-green-300",
      dilemma: "bg-gradient-to-br from-purple-400 to-purple-600 border-purple-300",
      bonus: "bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-300",
    }
    return colors[tile.type] || "bg-gradient-to-br from-gray-400 to-gray-600 border-gray-300"
  }

  const getPlayersOnTile = (tileIndex: number) => {
    return players.filter((player) => player.position === tileIndex)
  }

  const getTileIcon = (tile: GameTile) => {
    const icons = {
      start: "🏁",
      finish: "🏆",
      task: "📝",
      dare: "🎭",
      action: "⚡",
      dilemma: "🤔",
      bonus: "⭐",
    }
    return icons[tile.type] || "🎯"
  }

  const renderTile = (tileIndex: number, rowIndex: number, colIndex: number) => {
    const tile = board.tiles[tileIndex]
    if (!tile) return null

    const playersOnTile = getPlayersOnTile(tileIndex)
    const isCurrentTile = currentTile === tileIndex
    const colorClass = getTileColor(tile)

    return (
      <div
        key={tile.id}
        className={`
          relative p-4 rounded-xl border-3 transition-all duration-500 transform
          ${colorClass}
          ${isCurrentTile ? "ring-4 ring-yellow-400 ring-opacity-75 scale-110 shadow-2xl" : "shadow-lg"}
          hover:scale-105 cursor-pointer backdrop-blur-sm
          min-h-[140px] flex flex-col justify-between
        `}
        style={{
          animationDelay: `${(rowIndex * 5 + colIndex) * 0.1}s`,
        }}
      >
        {/* Tile Background Image */}
        {tileImages[tile.id] && (
          <div
            className="absolute inset-0 rounded-xl opacity-20 bg-cover bg-center"
            style={{ backgroundImage: `url(${tileImages[tile.id]})` }}
          />
        )}

        {/* Tile Header */}
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-between mb-2">
            <div className="text-lg font-bold text-white bg-black/30 rounded-full w-8 h-8 flex items-center justify-center">
              #{tile.id}
            </div>
            <div className="text-2xl">{getTileIcon(tile)}</div>
          </div>

          <div className="text-sm font-bold text-white mb-1 leading-tight drop-shadow-lg">{tile.title}</div>

          <div className="text-xs text-white/90 mb-2 leading-tight bg-black/20 rounded p-1">
            {tile.description.substring(0, 60)}
            {tile.description.length > 60 ? "..." : ""}
          </div>
        </div>

        {/* Karma Value */}
        <div className="relative z-10 text-center">
          <div
            className={`
            inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold
            ${
              tile.karmaValue > 0
                ? "bg-green-500/80 text-white"
                : tile.karmaValue < 0
                  ? "bg-red-500/80 text-white"
                  : "bg-gray-500/80 text-white"
            }
          `}
          >
            <Heart className="w-3 h-3" />
            {tile.karmaValue > 0 ? `+${tile.karmaValue}` : tile.karmaValue} karma
          </div>
        </div>

        {/* Player Tokens */}
        {playersOnTile.length > 0 && (
          <div className="absolute -top-3 -right-3 flex flex-wrap gap-1">
            {playersOnTile.map((player, pIndex) => (
              <div
                key={player.id}
                className={`
                  w-8 h-8 rounded-full border-3 border-white shadow-lg
                  flex items-center justify-center text-sm font-bold
                  ${player.color} transform transition-all duration-300
                  ${isCurrentTile ? "animate-bounce scale-110" : ""}
                  ${animatingPlayers.has(player.id) ? "animate-pulse" : ""}
                `}
                title={player.name}
                style={{
                  zIndex: 20 + pIndex,
                  transform: `translate(${pIndex * -4}px, ${pIndex * -4}px)`,
                }}
              >
                {player.avatar}
              </div>
            ))}
          </div>
        )}

        {/* Special Tile Indicators */}
        {tile.type === "bonus" && (
          <div className="absolute top-2 left-2">
            <Star className="w-5 h-5 text-yellow-300 animate-pulse" />
          </div>
        )}

        {tile.type === "finish" && (
          <div className="absolute top-2 left-2">
            <Trophy className="w-5 h-5 text-orange-300 animate-pulse" />
          </div>
        )}

        {/* Connection Lines */}
        {tileIndex < board.tiles.length - 1 && (
          <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 z-0">
            <div className="w-4 h-1 bg-white/50 rounded-full"></div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur-sm border-white/20 overflow-hidden">
      <div className="relative">
        {/* Board Background */}
        <div
          className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{
            backgroundImage: boardImage ? `url(${boardImage})` : "url(/images/board-background.png)",
          }}
        />

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400/10 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-16 w-16 h-16 bg-pink-400/10 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-blue-400/10 rounded-full animate-pulse delay-2000"></div>
        </div>

        {/* Board Header */}
        <div className="relative z-10 p-6 bg-gradient-to-r from-purple-600/70 to-blue-600/70 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Wand2 className="w-6 h-6" />
                {board.theme}
              </h2>
              <p className="text-blue-200 text-sm mt-2 max-w-2xl">{board.storyContext}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-3 py-1">
                <Sparkles className="w-4 h-4 mr-2" />
                {board.tiles.length} Tiles
              </Badge>
              {isPrebuilt && (
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-3 py-1">
                  <Zap className="w-4 h-4 mr-2" />
                  Pre-built
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Game Board Track */}
        <div className="relative z-10 p-8">
          <div className="space-y-4">
            {boardLayout.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className={`
                  flex gap-4 
                  ${rowIndex % 2 === 1 ? "flex-row-reverse" : ""}
                `}
              >
                {row.map((tileIndex, colIndex) => (
                  <div key={tileIndex} className="flex-1">
                    {renderTile(tileIndex, rowIndex, colIndex)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Board Stats */}
        <div className="relative z-10 p-6 bg-black/30 border-t border-white/10 backdrop-blur-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-400">
                {board.tiles.filter((t) => t.type === "task").length}
              </div>
              <div className="text-sm text-blue-200">Tasks</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold text-pink-400">
                {board.tiles.filter((t) => t.type === "dare").length}
              </div>
              <div className="text-sm text-blue-200">Dares</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-400">
                {board.tiles.filter((t) => t.type === "dilemma").length}
              </div>
              <div className="text-sm text-blue-200">Dilemmas</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-400">
                {board.tiles.filter((t) => t.type === "bonus").length}
              </div>
              <div className="text-sm text-blue-200">Bonuses</div>
            </div>
          </div>
        </div>

        {/* Player Legend */}
        {players.length > 0 && (
          <div className="relative z-10 p-4 bg-black/20 border-t border-white/10">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Players
            </h3>
            <div className="flex flex-wrap gap-3">
              {players.map((player) => (
                <div key={player.id} className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1">
                  <div
                    className={`
                      w-6 h-6 rounded-full border-2 border-white
                      flex items-center justify-center text-xs font-bold
                      ${player.color}
                    `}
                  >
                    {player.avatar}
                  </div>
                  <span className="text-white text-sm font-medium">{player.name}</span>
                  <span className="text-blue-200 text-xs">Pos: {player.position}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
