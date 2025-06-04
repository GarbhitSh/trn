"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, ExternalLink, RefreshCw, Coins, Trophy, Zap, Network } from "lucide-react"
import { useTRNWallet } from "@/hooks/use-trn-wallet"

export function WalletConnection() {
  const {
    isConnected,
    address,
    balance,
    network,
    rootBalance,
    nftCount,
    karma,
    isLoading,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    awardKarma,
    mintNFT,
    claimRewards,
    refreshData,
  } = useTRNWallet()

  const handleConnect = async () => {
    const success = await connectWallet()
    if (!success) {
      alert("Failed to connect wallet. Please make sure MetaMask is installed and try again.")
    }
  }

  const handleSwitchNetwork = async (targetNetwork: "testnet" | "mainnet") => {
    const success = await switchNetwork(targetNetwork)
    if (!success) {
      alert(`Failed to switch to ${targetNetwork}. Please try manually switching in MetaMask.`)
    }
  }

  const handleTestKarma = async () => {
    const txHash = await awardKarma(10, "Test karma reward")
    if (txHash) {
      alert(`Karma awarded! Transaction: ${txHash}`)
    }
  }

  const handleTestNFT = async () => {
    const tokenURI = `https://api.storyforge.game/nft/${Date.now()}`
    const txHash = await mintNFT(tokenURI)
    if (txHash) {
      alert(`NFT minted! Transaction: ${txHash}`)
    }
  }

  const handleClaimRewards = async () => {
    const txHash = await claimRewards()
    if (txHash) {
      alert(`Rewards claimed! Transaction: ${txHash}`)
    }
  }

  if (!isConnected) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Wallet className="w-5 h-5" />
            Connect TRN Wallet
          </CardTitle>
          <CardDescription className="text-blue-200">
            Connect your MetaMask wallet to interact with The Root Network
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-blue-300">
              <Coins className="w-4 h-4 text-yellow-400" />
              Earn $ROOT tokens for gameplay
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-300">
              <Trophy className="w-4 h-4 text-green-400" />
              Mint NFTs for achievements
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-300">
              <Zap className="w-4 h-4 text-blue-400" />
              Gasless transactions via Fee Pallets
            </div>
          </div>

          <Button
            onClick={handleConnect}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                Connect MetaMask
              </>
            )}
          </Button>

          <Alert className="bg-blue-500/10 border-blue-500/20">
            <Network className="h-4 w-4" />
            <AlertDescription className="text-blue-200">
              Make sure you have MetaMask installed. The wallet will automatically switch to TRN Testnet.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Wallet className="w-5 h-5 text-green-400" />
          TRN Wallet Connected
        </CardTitle>
        <CardDescription className="text-blue-200">
          Your wallet is connected to {network === "testnet" ? "Porcini Testnet" : "The Root Network"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Wallet Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-blue-200 text-sm">Address:</span>
              <div className="flex items-center gap-2">
                <span className="text-green-400 font-mono text-sm">
                  {address?.substring(0, 6)}...{address?.substring(-4)}
                </span>
                <a
                  href={`https://${network === "testnet" ? "porcini." : ""}rootscan.io/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-200 text-sm">Network:</span>
              <Badge
                className={
                  network === "testnet"
                    ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                    : "bg-green-500/20 text-green-400 border-green-500/30"
                }
              >
                {network === "testnet" ? "Porcini Testnet" : "Root Mainnet"}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-blue-200 text-sm">XRP Balance:</span>
              <span className="text-white font-bold">{balance} XRP</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-200 text-sm">$ROOT Balance:</span>
              <span className="text-yellow-400 font-bold">{rootBalance} $ROOT</span>
            </div>
          </div>
        </div>

        {/* Game Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-green-400" />
              <span className="text-blue-200 text-sm">NFTs</span>
            </div>
            <span className="text-green-400 font-bold">{nftCount}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-blue-200 text-sm">Karma</span>
            </div>
            <span className="text-blue-400 font-bold">{karma}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="text-blue-200 text-sm">Multiplier</span>
            </div>
            <span className="text-yellow-400 font-bold">2.5x</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-3">
          <Button onClick={handleTestKarma} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700" size="sm">
            {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
            Test Karma Award
          </Button>
          <Button onClick={handleTestNFT} disabled={isLoading} className="bg-green-600 hover:bg-green-700" size="sm">
            {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Trophy className="w-4 h-4 mr-2" />}
            Test NFT Mint
          </Button>
          <Button
            onClick={handleClaimRewards}
            disabled={isLoading}
            className="bg-yellow-600 hover:bg-yellow-700"
            size="sm"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Coins className="w-4 h-4 mr-2" />}
            Claim Rewards
          </Button>
          <Button onClick={refreshData} disabled={isLoading} variant="outline" size="sm">
            {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Refresh
          </Button>
        </div>

        {/* Network Switch */}
        {network && (
          <div className="flex gap-2">
            <Button
              onClick={() => handleSwitchNetwork("testnet")}
              disabled={network === "testnet" || isLoading}
              variant="outline"
              size="sm"
            >
              Switch to Testnet
            </Button>
            <Button
              onClick={() => handleSwitchNetwork("mainnet")}
              disabled={network === "mainnet" || isLoading}
              variant="outline"
              size="sm"
            >
              Switch to Mainnet
            </Button>
          </div>
        )}

        <Button
          onClick={disconnectWallet}
          variant="outline"
          size="sm"
          className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
        >
          Disconnect Wallet
        </Button>
      </CardContent>
    </Card>
  )
}
