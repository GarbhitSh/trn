// Mock TRN Wallet Connector for demonstration
// In production, this would use @0xsequence/web3 or TRN's official SDK

export interface TRNWalletState {
  isConnected: boolean
  address: string | null
  provider: any | null
  network: "trn-mainnet" | "trn-testnet"
}

export class TRNWalletConnector {
  private state: TRNWalletState = {
    isConnected: false,
    address: null,
    provider: null,
    network: "trn-testnet",
  }
  private callbacks: ((state: TRNWalletState) => void)[] = []

  constructor(network: "trn-mainnet" | "trn-testnet" = "trn-testnet") {
    this.state.network = network
  }

  async connect(): Promise<boolean> {
    try {
      console.log("🔗 Connecting to FuturePass wallet (Mock)...")

      // Simulate wallet connection delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock wallet connection
      const mockAddress = "0x" + Math.random().toString(16).substr(2, 40)

      this.state = {
        isConnected: true,
        address: mockAddress,
        provider: {
          // Mock provider object
          getBalance: async () => "1000000000000000000", // 1 ETH in wei
          getNetwork: () => ({ name: this.state.network, chainId: 7668 }),
        },
        network: this.state.network,
      }

      console.log("✅ FuturePass wallet connected (Mock):", mockAddress)
      this.notifyStateChange()
      return true
    } catch (error) {
      console.error("Failed to connect FuturePass wallet:", error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    try {
      this.state = {
        isConnected: false,
        address: null,
        provider: null,
        network: this.state.network,
      }

      console.log("FuturePass wallet disconnected")
      this.notifyStateChange()
    } catch (error) {
      console.error("Error disconnecting wallet:", error)
    }
  }

  getState(): TRNWalletState {
    return { ...this.state }
  }

  getProvider(): any | null {
    return this.state.provider
  }

  getAddress(): string | null {
    return this.state.address
  }

  isConnected(): boolean {
    return this.state.isConnected
  }

  onStateChange(callback: (state: TRNWalletState) => void): void {
    this.callbacks.push(callback)
    // Immediately call with current state
    callback(this.getState())
  }

  private notifyStateChange(): void {
    const currentState = this.getState()
    this.callbacks.forEach((callback) => {
      try {
        callback(currentState)
      } catch (error) {
        console.error("Error in wallet state callback:", error)
      }
    })
  }

  // Mock sign message
  async signMessage(message: string): Promise<string | null> {
    try {
      if (!this.state.isConnected) {
        throw new Error("Wallet not connected")
      }

      // Simulate signing delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock signature
      const mockSignature =
        "0x" + Array.from({ length: 130 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
      console.log("📝 Message signed (Mock):", message.substring(0, 50) + "...")
      return mockSignature
    } catch (error) {
      console.error("Error signing message:", error)
      return null
    }
  }

  // Mock wallet info
  async getWalletInfo(): Promise<{
    address: string
    balance: string
    network: string
  } | null> {
    try {
      if (!this.state.provider || !this.state.address) {
        return null
      }

      const balance = await this.state.provider.getBalance()

      return {
        address: this.state.address,
        balance: balance,
        network: this.state.network,
      }
    } catch (error) {
      console.error("Error getting wallet info:", error)
      return null
    }
  }
}

// Singleton instance
export const trnWallet = new TRNWalletConnector()
