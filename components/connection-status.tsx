"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"
import { useGameSupabase } from "@/hooks/use-game-supabase"

interface ConnectionStatusProps {
  isConnected?: boolean
  showDetails?: boolean
}

export default function ConnectionStatus({ showDetails = false }: ConnectionStatusProps) {
  const [connectionState, setConnectionState] = useState<"connected" | "disconnected" | "reconnecting">("reconnecting")
  const { isConnected } = useGameSupabase()

  useEffect(() => {
    if (isConnected) {
      setConnectionState("connected")
    } else {
      setConnectionState("disconnected")
      // Show reconnecting state briefly
      const timer = setTimeout(() => {
        setConnectionState("reconnecting")
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isConnected])

  const getStatusConfig = () => {
    switch (connectionState) {
      case "connected":
        return {
          icon: Wifi,
          text: "Connected",
          className: "bg-green-500/20 text-green-400 border-green-500/30",
        }
      case "disconnected":
        return {
          icon: WifiOff,
          text: "Using Polling",
          className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        }
      case "reconnecting":
        return {
          icon: RefreshCw,
          text: "Connecting...",
          className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <Badge className={config.className}>
      <Icon className={`w-3 h-3 mr-1 ${connectionState === "reconnecting" ? "animate-spin" : ""}`} />
      {config.text}
      {showDetails && connectionState === "disconnected" && <span className="ml-1 text-xs">(Fallback mode)</span>}
    </Badge>
  )
}
