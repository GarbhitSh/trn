import { ethers } from "ethers"

// TRN Network Configuration - Hardcoded with your API keys
export const TRN_NETWORKS = {
  testnet: {
    chainId: "0x1DFC", // 7668 in hex
    chainName: "Porcini Testnet",
    nativeCurrency: {
      name: "XRP",
      symbol: "XRP",
      decimals: 18, // Changed from 6 to 18
    },
    rpcUrls: ["https://porcini.rootscan.io/archive"],
    blockExplorerUrls: ["https://porcini.rootscan.io"],
  },
  mainnet: {
    chainId: "0x1E00", // 7672 in hex
    chainName: "The Root Network",
    nativeCurrency: {
      name: "XRP",
      symbol: "XRP",
      decimals: 18, // Changed from 6 to 18
    },
    rpcUrls: ["https://rootscan.io/archive"],
    blockExplorerUrls: ["https://rootscan.io"],
  },
} as const

// Your API Keys - Hardcoded
export const API_CONFIG = {
  rpcApiKey: "2c0bd468-580e-41b9-979e-3eba235fb358",
  trnApiKey: "e6f50477-d9b0-4936-9d02-a53147ea79f1",
} as const

export interface WalletState {
  isConnected: boolean
  address: string | null
  balance: string | null
  network: "testnet" | "mainnet" | null
  provider: ethers.BrowserProvider | null
}

export class TRNWalletProvider {
  private state: WalletState = {
    isConnected: false,
    address: null,
    balance: null,
    network: null,
    provider: null,
  }
  private callbacks: ((state: WalletState) => void)[] = []

  constructor() {
    this.checkConnection()
  }

  async checkConnection() {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          await this.connect()
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error)
      }
    }
  }

  async connect(): Promise<boolean> {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask to connect your wallet!")
        return false
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length === 0) {
        throw new Error("No accounts found")
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()

      // Check if we're on TRN network
      const network = await provider.getNetwork()
      const chainId = "0x" + network.chainId.toString(16)

      let trnNetwork: "testnet" | "mainnet" | null = null
      if (chainId === TRN_NETWORKS.testnet.chainId) {
        trnNetwork = "testnet"
      } else if (chainId === TRN_NETWORKS.mainnet.chainId) {
        trnNetwork = "mainnet"
      } else {
        // Try to switch to testnet
        await this.switchToTRN("testnet")
        trnNetwork = "testnet"
      }

      // Get balance
      const balance = await provider.getBalance(address)
      const balanceInXRP = ethers.formatUnits(balance, 18) // Changed from 6 to 18

      this.state = {
        isConnected: true,
        address,
        balance: balanceInXRP,
        network: trnNetwork,
        provider,
      }

      console.log("✅ Wallet connected:", address)
      this.notifyStateChange()
      return true
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      return false
    }
  }

  async switchToTRN(network: "testnet" | "mainnet"): Promise<boolean> {
    try {
      if (!window.ethereum) return false

      const networkConfig = TRN_NETWORKS[network]

      // Try to switch to the network
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: networkConfig.chainId }],
        })
      } catch (switchError: any) {
        // Network doesn't exist, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [networkConfig],
          })
        } else {
          throw switchError
        }
      }

      // Update state after network switch
      if (this.state.provider) {
        const newNetwork = await this.state.provider.getNetwork()
        const chainId = "0x" + newNetwork.chainId.toString(16)

        if (chainId === networkConfig.chainId) {
          this.state.network = network
          // Update balance for new network
          if (this.state.address) {
            const balance = await this.state.provider.getBalance(this.state.address)
            this.state.balance = ethers.formatUnits(balance, 18) // Changed from 6 to 18
          }
          this.notifyStateChange()
          return true
        }
      }

      return false
    } catch (error) {
      console.error("Failed to switch network:", error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    this.state = {
      isConnected: false,
      address: null,
      balance: null,
      network: null,
      provider: null,
    }
    this.notifyStateChange()
  }

  getState(): WalletState {
    return { ...this.state }
  }

  onStateChange(callback: (state: WalletState) => void): void {
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

  // Transaction methods
  async sendTransaction(to: string, value: string, data?: string): Promise<string> {
    if (!this.state.provider || !this.state.address) {
      throw new Error("Wallet not connected")
    }

    const signer = await this.state.provider.getSigner()
    const tx = await signer.sendTransaction({
      to,
      value: ethers.parseUnits(value, 18), // Changed from 6 to 18
      data: data || "0x",
    })

    return tx.hash
  }

  async signMessage(message: string): Promise<string> {
    if (!this.state.provider || !this.state.address) {
      throw new Error("Wallet not connected")
    }

    const signer = await this.state.provider.getSigner()
    return await signer.signMessage(message)
  }

  // Contract interaction
  async callContract(contractAddress: string, abi: any[], method: string, params: any[] = []): Promise<any> {
    if (!this.state.provider) {
      throw new Error("Wallet not connected")
    }

    const contract = new ethers.Contract(contractAddress, abi, this.state.provider)
    return await contract[method](...params)
  }

  async writeContract(
    contractAddress: string,
    abi: any[],
    method: string,
    params: any[] = [],
    value?: string,
  ): Promise<string> {
    if (!this.state.provider || !this.state.address) {
      throw new Error("Wallet not connected")
    }

    const signer = await this.state.provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)

    const tx = await contract[method](...params, {
      value: value ? ethers.parseUnits(value, 18) : 0, // Changed from 6 to 18
    })

    return tx.hash
  }
}

// Singleton instance
export const trnWallet = new TRNWalletProvider()

// Listen for account changes
if (typeof window !== "undefined" && window.ethereum) {
  window.ethereum.on("accountsChanged", (accounts: string[]) => {
    if (accounts.length === 0) {
      trnWallet.disconnect()
    } else {
      trnWallet.connect()
    }
  })

  window.ethereum.on("chainChanged", () => {
    // Reload the page when chain changes
    window.location.reload()
  })
}
