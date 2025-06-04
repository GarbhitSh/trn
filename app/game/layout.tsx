"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { GameStateProvider } from "@/components/game-state-provider"

export default function GameLayout({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Only render the provider on the client to avoid hydration issues
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">Loading StoryForge...</h2>
        </div>
      </div>
    )
  }

  return <GameStateProvider>{children}</GameStateProvider>
}
