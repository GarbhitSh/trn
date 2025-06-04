"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, ExternalLink, Copy, RefreshCw } from "lucide-react"
import { checkTRNSetup, generateSetupInstructions, type SetupStatus } from "@/lib/trn/setup-checker"
import { TRNConnectionTest } from "./trn-connection-test"

export function TRNSetupGuide() {
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [instructions, setInstructions] = useState<string[]>([])

  const checkSetup = async () => {
    setIsLoading(true)
    try {
      const status = await checkTRNSetup()
      const setupInstructions = generateSetupInstructions(status)
      setSetupStatus(status)
      setInstructions(setupInstructions)
    } catch (error) {
      console.error("Error checking TRN setup:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkSetup()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
      case "valid":
      case "deployed":
      case "configured":
      case "connected":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "partial":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case "missing":
      case "invalid":
      case "disconnected":
      default:
        return <XCircle className="w-5 h-5 text-red-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete":
      case "valid":
      case "deployed":
      case "configured":
      case "connected":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "partial":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "missing":
      case "invalid":
      case "disconnected":
      default:
        return "bg-red-500/20 text-red-400 border-red-500/30"
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (isLoading) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-6 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-blue-200">Checking TRN integration setup...</p>
        </CardContent>
      </Card>
    )
  }

  if (!setupStatus) {
    return (
      <Alert className="bg-red-500/10 border-red-500/20">
        <XCircle className="h-4 w-4" />
        <AlertDescription className="text-red-400">
          Failed to check TRN setup status. Please check your configuration.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            {getStatusIcon(setupStatus.overall)}
            TRN Integration Status
            <Badge className={getStatusColor(setupStatus.overall)}>{setupStatus.overall.toUpperCase()}</Badge>
          </CardTitle>
          <CardDescription className="text-blue-200">
            Current status of your TRN blockchain integration setup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Environment */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-blue-200">Environment Variables</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(setupStatus.environment.status)}
                <Badge className={getStatusColor(setupStatus.environment.status)} variant="outline">
                  {setupStatus.environment.status}
                </Badge>
              </div>
            </div>

            {/* Network */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-blue-200">Network Config</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(setupStatus.network.status)}
                <Badge className={getStatusColor(setupStatus.network.status)} variant="outline">
                  {setupStatus.network.name}
                </Badge>
              </div>
            </div>

            {/* Contracts */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-blue-200">Smart Contracts</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(setupStatus.contracts.status)}
                <Badge className={getStatusColor(setupStatus.contracts.status)} variant="outline">
                  {setupStatus.contracts.status}
                </Badge>
              </div>
            </div>

            {/* FuturePass */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-blue-200">FuturePass</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(setupStatus.futurepass.status)}
                <Badge className={getStatusColor(setupStatus.futurepass.status)} variant="outline">
                  {setupStatus.futurepass.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={checkSetup} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Status
            </Button>
            <Button onClick={() => window.open("https://docs.rootnet.live", "_blank")} variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              TRN Docs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Connection Test */}
      <TRNConnectionTest />

      {/* Setup Instructions */}
      {instructions.length > 0 && (
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Setup Instructions</CardTitle>
            <CardDescription className="text-blue-200">
              Follow these steps to complete your TRN integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {instructions.map((instruction, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="text-blue-400 font-mono text-sm mt-1">{String(index + 1).padStart(2, "0")}.</span>
                  <div className="flex-1">
                    <p className="text-blue-200 text-sm">{instruction}</p>
                    {instruction.includes("NEXT_PUBLIC_") && (
                      <Button
                        onClick={() => copyToClipboard(instruction)}
                        variant="ghost"
                        size="sm"
                        className="mt-1 h-6 px-2 text-xs"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contract Addresses */}
      {setupStatus.contracts.status === "deployed" && (
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Contract Addresses</CardTitle>
            <CardDescription className="text-blue-200">
              Deployed smart contract addresses on {setupStatus.network.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(setupStatus.contracts.addresses).map(([name, address]) => (
                <div key={name} className="flex items-center justify-between p-2 bg-white/5 rounded">
                  <span className="text-blue-200 capitalize">{name.replace(/([A-Z])/g, " $1").trim()}</span>
                  <div className="flex items-center gap-2">
                    <code className="text-green-400 text-sm font-mono">{address || "Not deployed"}</code>
                    {address && (
                      <Button
                        onClick={() => copyToClipboard(address)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Environment Variables Template */}
      {setupStatus.environment.status === "invalid" && (
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Environment Variables Template</CardTitle>
            <CardDescription className="text-blue-200">Copy this template to your .env.local file</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-black/20 p-4 rounded-lg">
              <pre className="text-green-400 text-sm overflow-x-auto">
                {`# FuturePass Configuration
NEXT_PUBLIC_FUTUREPASS_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_FUTUREPASS_REDIRECT_URI=https://yourdomain.com/auth/callback

# Network Configuration
NEXT_PUBLIC_TRN_NETWORK=testnet
NEXT_PUBLIC_TRN_RPC_URL=https://root.rootnet.live/archive

# Contract Addresses
NEXT_PUBLIC_ROOT_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_REWARDS_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_LOGGER_CONTRACT_ADDRESS=0x...

# API Keys
TRN_RELAYER_API_KEY=your_relayer_api_key
IPFS_API_KEY=your_ipfs_api_key`}
              </pre>
              <Button
                onClick={() =>
                  copyToClipboard(`# FuturePass Configuration
NEXT_PUBLIC_FUTUREPASS_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_FUTUREPASS_REDIRECT_URI=https://yourdomain.com/auth/callback

# Network Configuration
NEXT_PUBLIC_TRN_NETWORK=testnet
NEXT_PUBLIC_TRN_RPC_URL=https://root.rootnet.live/archive

# Contract Addresses
NEXT_PUBLIC_ROOT_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_REWARDS_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_LOGGER_CONTRACT_ADDRESS=0x...

# API Keys
TRN_RELAYER_API_KEY=your_relayer_api_key
IPFS_API_KEY=your_ipfs_api_key`)
                }
                className="mt-3"
                variant="outline"
                size="sm"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Template
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
