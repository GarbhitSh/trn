"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, RefreshCw, Wifi, Clock, Hash, Link } from "lucide-react"
import { testTRNConnection } from "@/lib/trn/rpc-client"
import { getCurrentNetwork, getNetworkConfig } from "@/lib/trn/config"

interface ConnectionTestResult {
  success: boolean
  blockNumber?: string
  chainId?: string
  latency?: number
  error?: string
}

export function TRNConnectionTest() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ConnectionTestResult | null>(null)

  const network = getCurrentNetwork()
  const networkConfig = getNetworkConfig()

  const runTest = async () => {
    setIsLoading(true)
    try {
      const testResult = await testTRNConnection()
      setResult(testResult)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatLatency = (latency?: number) => {
    if (!latency) return "N/A"
    if (latency < 100) return `${latency}ms (Excellent)`
    if (latency < 300) return `${latency}ms (Good)`
    if (latency < 1000) return `${latency}ms (Fair)`
    return `${latency}ms (Slow)`
  }

  const getLatencyColor = (latency?: number) => {
    if (!latency) return "text-gray-400"
    if (latency < 100) return "text-green-400"
    if (latency < 300) return "text-blue-400"
    if (latency < 1000) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Wifi className="w-5 h-5" />
          TRN Network Connection Test
        </CardTitle>
        <CardDescription className="text-blue-200">
          Test your connection to the {networkConfig.name} network
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Network Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-blue-200 text-sm">Network:</span>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{networkConfig.name}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-200 text-sm">Chain ID:</span>
              <span className="text-white font-mono text-sm">{networkConfig.chainId}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-blue-200 text-sm">RPC Endpoint:</span>
              <span className="text-green-400 text-xs font-mono">
                {networkConfig.rpcUrl.includes("?")
                  ? networkConfig.rpcUrl.split("?")[0] + "?apikey=***"
                  : networkConfig.rpcUrl}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-200 text-sm">Explorer:</span>
              <a
                href={networkConfig.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 text-xs flex items-center gap-1"
              >
                <Link className="w-3 h-3" />
                View Explorer
              </a>
            </div>
          </div>
        </div>

        {/* Test Button */}
        <Button
          onClick={runTest}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Testing Connection...
            </>
          ) : (
            <>
              <Wifi className="w-4 h-4 mr-2" />
              Test TRN Connection
            </>
          )}
        </Button>

        {/* Results */}
        {result && (
          <div className="space-y-3">
            {result.success ? (
              <Alert className="bg-green-500/10 border-green-500/20">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-green-200">
                  ✅ Successfully connected to {networkConfig.name}!
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-red-500/10 border-red-500/20">
                <XCircle className="h-4 w-4" />
                <AlertDescription className="text-red-200">❌ Connection failed: {result.error}</AlertDescription>
              </Alert>
            )}

            {result.success && (
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-200 text-sm">Latest Block</span>
                  </div>
                  <span className="text-green-400 font-mono text-sm">
                    #{Number.parseInt(result.blockNumber || "0", 16).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Link className="w-4 h-4 text-purple-400" />
                    <span className="text-blue-200 text-sm">Chain ID</span>
                  </div>
                  <span className="text-purple-400 font-mono text-sm">
                    {Number.parseInt(result.chainId || "0", 16)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-400" />
                    <span className="text-blue-200 text-sm">Latency</span>
                  </div>
                  <span className={`font-mono text-sm ${getLatencyColor(result.latency)}`}>
                    {formatLatency(result.latency)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* API Key Status */}
        <div className="p-3 bg-white/5 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-blue-200 text-sm">API Key Status:</span>
            <Badge
              className={
                process.env.NEXT_PUBLIC_TRN_RPC_API_KEY
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : "bg-red-500/20 text-red-400 border-red-500/30"
              }
            >
              {process.env.NEXT_PUBLIC_TRN_RPC_API_KEY ? "Configured" : "Missing"}
            </Badge>
          </div>
          {process.env.NEXT_PUBLIC_TRN_RPC_API_KEY && (
            <p className="text-xs text-green-300 mt-1">
              Using API key: {process.env.NEXT_PUBLIC_TRN_RPC_API_KEY.substring(0, 8)}...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
