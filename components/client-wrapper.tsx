"use client"

import type React from "react"
import { useEffect, useState } from "react"

interface ClientWrapperProps {
  children: React.ReactNode
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">Loading StoryForge...</h2>
          <p className="text-blue-200 mt-2">Initializing Supabase connection...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
