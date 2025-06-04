import { API_CONFIG } from "./wallet-provider"

export class TRNRPCClient {
  private rpcUrl: string
  private network: "testnet" | "mainnet"

  constructor(network: "testnet" | "mainnet" = "testnet") {
    this.network = network
    this.rpcUrl = network === "testnet" ? "https://porcini.rootscan.io/archive" : "https://rootscan.io/archive"
  }

  private getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      "X-API-Key": API_CONFIG.rpcApiKey,
      Authorization: `Bearer ${API_CONFIG.trnApiKey}`,
    }
  }

  async call(method: string, params: any[] = []): Promise<any> {
    try {
      const response = await fetch(this.rpcUrl, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          jsonrpc: "2.0",
          method,
          params,
          id: Date.now(),
        }),
      })

      if (!response.ok) {
        throw new Error(`RPC request failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(`RPC error: ${data.error.message}`)
      }

      return data.result
    } catch (error) {
      console.error(`TRN RPC call failed (${method}):`, error)
      throw error
    }
  }

  // Common RPC methods
  async getBlockNumber(): Promise<number> {
    const result = await this.call("eth_blockNumber")
    return Number.parseInt(result, 16)
  }

  async getBalance(address: string): Promise<string> {
    const result = await this.call("eth_getBalance", [address, "latest"])
    return result
  }

  async getTransactionCount(address: string): Promise<number> {
    const result = await this.call("eth_getTransactionCount", [address, "latest"])
    return Number.parseInt(result, 16)
  }

  async getChainId(): Promise<number> {
    const result = await this.call("eth_chainId")
    return Number.parseInt(result, 16)
  }

  async getGasPrice(): Promise<string> {
    return await this.call("eth_gasPrice")
  }

  async getTransactionReceipt(txHash: string): Promise<any> {
    return await this.call("eth_getTransactionReceipt", [txHash])
  }

  async getTransaction(txHash: string): Promise<any> {
    return await this.call("eth_getTransactionByHash", [txHash])
  }

  // Network info
  getNetworkName(): string {
    return this.network
  }

  getRPCUrl(): string {
    return this.rpcUrl
  }
}

// Test connection
export async function testTRNConnection(network: "testnet" | "mainnet" = "testnet"): Promise<{
  success: boolean
  blockNumber?: number
  chainId?: number
  latency?: number
  error?: string
}> {
  try {
    const client = new TRNRPCClient(network)
    const startTime = Date.now()

    const [blockNumber, chainId] = await Promise.all([client.getBlockNumber(), client.getChainId()])

    const latency = Date.now() - startTime

    return {
      success: true,
      blockNumber,
      chainId,
      latency,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
