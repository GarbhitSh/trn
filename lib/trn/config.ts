// TRN Network Configuration
export const TRN_CONFIG = {
  networks: {
    testnet: {
      name: "Porcini Testnet",
      chainId: 7668,
      rpcUrl: "https://porcini.rootscan.io/archive",
      wsUrl: "wss://porcini.rootscan.io/live/ws",
      explorerUrl: "https://porcini.rootscan.io",
      nativeCurrency: {
        name: "XRP",
        symbol: "XRP",
        decimals: 6,
      },
    },
    mainnet: {
      name: "The Root Network",
      chainId: 7672,
      rpcUrl: "https://rootscan.io/archive",
      wsUrl: "wss://rootscan.io/live/ws",
      explorerUrl: "https://rootscan.io",
      nativeCurrency: {
        name: "XRP",
        symbol: "XRP",
        decimals: 6,
      },
    },
  },
  contracts: {
    testnet: {
      rootToken: process.env.NEXT_PUBLIC_ROOT_TOKEN_ADDRESS_TESTNET || "0x...", // ROOT token on Porcini
      storyforgeNFT: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS_TESTNET || "0x...", // StoryForge NFT on Porcini
      karmaRewards: process.env.NEXT_PUBLIC_REWARDS_CONTRACT_ADDRESS_TESTNET || "0x...", // Karma rewards on Porcini
      gameLogger: process.env.NEXT_PUBLIC_LOGGER_CONTRACT_ADDRESS_TESTNET || "0x...", // Game logger on Porcini
    },
    mainnet: {
      rootToken: process.env.NEXT_PUBLIC_ROOT_TOKEN_ADDRESS_MAINNET || "0x...", // ROOT token on mainnet
      storyforgeNFT: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS_MAINNET || "0x...", // StoryForge NFT on mainnet
      karmaRewards: process.env.NEXT_PUBLIC_REWARDS_CONTRACT_ADDRESS_MAINNET || "0x...", // Karma rewards on mainnet
      gameLogger: process.env.NEXT_PUBLIC_LOGGER_CONTRACT_ADDRESS_MAINNET || "0x...", // Game logger on mainnet
    },
  },
  futurepass: {
    testnet: {
      authUrl: "https://auth.futureverse.app/testnet",
      walletUrl: "https://wallet.futureverse.app/testnet",
    },
    mainnet: {
      authUrl: "https://auth.futureverse.app",
      walletUrl: "https://wallet.futureverse.app",
    },
  },
  relayer: {
    testnet: "https://relayer.futureverse.app/testnet",
    mainnet: "https://relayer.futureverse.app",
  },
} as const

export type NetworkType = keyof typeof TRN_CONFIG.networks

// Environment variables that need to be set
export const REQUIRED_ENV_VARS = {
  // RPC Configuration
  NEXT_PUBLIC_TRN_RPC_API_KEY: "Your RootScan API key (e.g., 2c0bd468-580e-41b9-979e-3eba235fb358)",
  NEXT_PUBLIC_TRN_API_KEY: "Your TRN API key (e.g., e6f50477-d9b0-4936-9d02-a53147ea79f1)",

  // Network Selection
  NEXT_PUBLIC_TRN_NETWORK: "testnet or mainnet (recommend testnet for development)",

  // FuturePass Configuration
  NEXT_PUBLIC_FUTUREPASS_CLIENT_ID: "Your FuturePass client ID from developers.futureverse.app",
  NEXT_PUBLIC_FUTUREPASS_REDIRECT_URI: "Your app redirect URI (e.g., https://yourdomain.com/auth/callback)",

  // Contract Addresses - Testnet
  NEXT_PUBLIC_ROOT_TOKEN_ADDRESS_TESTNET: "ROOT token contract address on Porcini testnet",
  NEXT_PUBLIC_NFT_CONTRACT_ADDRESS_TESTNET: "StoryForge NFT contract address on Porcini testnet",
  NEXT_PUBLIC_REWARDS_CONTRACT_ADDRESS_TESTNET: "Karma rewards contract address on Porcini testnet",
  NEXT_PUBLIC_LOGGER_CONTRACT_ADDRESS_TESTNET: "Game logger contract address on Porcini testnet",

  // Contract Addresses - Mainnet (for production)
  NEXT_PUBLIC_ROOT_TOKEN_ADDRESS_MAINNET: "ROOT token contract address on mainnet",
  NEXT_PUBLIC_NFT_CONTRACT_ADDRESS_MAINNET: "StoryForge NFT contract address on mainnet",
  NEXT_PUBLIC_REWARDS_CONTRACT_ADDRESS_MAINNET: "Karma rewards contract address on mainnet",
  NEXT_PUBLIC_LOGGER_CONTRACT_ADDRESS_MAINNET: "Game logger contract address on mainnet",

  // Optional: IPFS for NFT metadata
  IPFS_API_KEY: "IPFS API key for storing NFT metadata",
  NEXT_PUBLIC_IPFS_GATEWAY: "Custom IPFS gateway URL",
} as const

// Get current network configuration
export function getCurrentNetwork(): NetworkType {
  const network = process.env.NEXT_PUBLIC_TRN_NETWORK as NetworkType
  if (!network || !TRN_CONFIG.networks[network]) {
    console.warn("Invalid or missing TRN_NETWORK, defaulting to testnet")
    return "testnet"
  }
  return network
}

// Get network configuration
export function getNetworkConfig(network?: NetworkType) {
  const currentNetwork = network || getCurrentNetwork()
  return TRN_CONFIG.networks[currentNetwork]
}

// Get contract addresses for current network
export function getContractAddresses(network?: NetworkType) {
  const currentNetwork = network || getCurrentNetwork()
  return TRN_CONFIG.contracts[currentNetwork]
}

// Get API headers for TRN requests
export function getAPIHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  const apiKey = process.env.NEXT_PUBLIC_TRN_API_KEY
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`
    headers["X-API-Key"] = apiKey
  }

  return headers
}

// Validate environment setup
export function validateEnvironment(): {
  isValid: boolean
  missing: string[]
  warnings: string[]
} {
  const missing: string[] = []
  const warnings: string[] = []

  // Check required environment variables
  const requiredVars = ["NEXT_PUBLIC_TRN_NETWORK", "NEXT_PUBLIC_TRN_RPC_API_KEY", "NEXT_PUBLIC_FUTUREPASS_CLIENT_ID"]

  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missing.push(varName)
    }
  })

  // Check optional but recommended variables
  const recommendedVars = ["NEXT_PUBLIC_TRN_API_KEY", "IPFS_API_KEY", "NEXT_PUBLIC_FUTUREPASS_REDIRECT_URI"]

  recommendedVars.forEach((varName) => {
    if (!process.env[varName]) {
      warnings.push(`${varName} not set - some features may be limited`)
    }
  })

  // Validate network
  const network = process.env.NEXT_PUBLIC_TRN_NETWORK
  if (network && !TRN_CONFIG.networks[network as NetworkType]) {
    missing.push("NEXT_PUBLIC_TRN_NETWORK (invalid value)")
  }

  // Check if contract addresses are set for current network
  const currentNetwork = getCurrentNetwork()
  const contractVars = [
    `NEXT_PUBLIC_ROOT_TOKEN_ADDRESS_${currentNetwork.toUpperCase()}`,
    `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS_${currentNetwork.toUpperCase()}`,
    `NEXT_PUBLIC_REWARDS_CONTRACT_ADDRESS_${currentNetwork.toUpperCase()}`,
    `NEXT_PUBLIC_LOGGER_CONTRACT_ADDRESS_${currentNetwork.toUpperCase()}`,
  ]

  contractVars.forEach((varName) => {
    if (!process.env[varName] || process.env[varName] === "0x...") {
      warnings.push(`${varName} not set - contract interactions will fail`)
    }
  })

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  }
}

// Test RPC connection
export async function testRPCConnection(network?: NetworkType): Promise<{
  success: boolean
  latency?: number
  error?: string
}> {
  try {
    const config = getNetworkConfig(network)
    const startTime = Date.now()

    const response = await fetch(config.rpcUrl, {
      method: "POST",
      headers: getAPIHeaders(),
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_blockNumber",
        params: [],
        id: 1,
      }),
    })

    const latency = Date.now() - startTime

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error.message)
    }

    return {
      success: true,
      latency,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Contract ABIs (simplified - in production, import from generated types)
export const CONTRACT_ABIS = {
  ERC20: [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function name() view returns (string)",
  ],
  ERC721: [
    "function balanceOf(address owner) view returns (uint256)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "function mint(address to, string memory tokenURI) returns (uint256)",
    "function approve(address to, uint256 tokenId)",
    "function getApproved(uint256 tokenId) view returns (address)",
    "function setApprovalForAll(address operator, bool approved)",
    "function isApprovedForAll(address owner, address operator) view returns (bool)",
  ],
  KarmaRewards: [
    "function awardKarma(address player, uint256 amount, string memory reason) external",
    "function getPlayerKarma(address player) view returns (uint256)",
    "function getKarmaMultiplier(address player) view returns (uint256)",
    "function claimRewards(address player) external returns (uint256)",
    "function getClaimableRewards(address player) view returns (uint256)",
  ],
  GameLogger: [
    "function logGameEvent(string memory gameId, string memory eventType, bytes memory data) external",
    "function getGameEvents(string memory gameId) view returns (tuple[])",
    "function getPlayerStats(address player) view returns (tuple)",
  ],
} as const

// Helper to get RPC URL with API key
export function getRPCUrl(network?: NetworkType): string {
  const config = getNetworkConfig(network)
  return config.rpcUrl
}

// Helper to get WebSocket URL with API key
export function getWSUrl(network?: NetworkType): string {
  const config = getNetworkConfig(network)
  return config.wsUrl
}
