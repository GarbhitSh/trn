import { validateEnvironment, getCurrentNetwork, getNetworkConfig } from "./config"

export interface SetupStatus {
  overall: "complete" | "partial" | "missing"
  environment: {
    status: "valid" | "invalid"
    missing: string[]
    warnings: string[]
  }
  network: {
    status: "connected" | "disconnected"
    name: string
    chainId: number
  }
  contracts: {
    status: "deployed" | "missing"
    addresses: Record<string, string | null>
  }
  futurepass: {
    status: "configured" | "missing"
    clientId: string | null
  }
}

export async function checkTRNSetup(): Promise<SetupStatus> {
  // Check environment variables
  const envValidation = validateEnvironment()

  // Check network configuration
  const network = getCurrentNetwork()
  const networkConfig = getNetworkConfig(network)

  // Check contract addresses
  const contracts = {
    rootToken: process.env.NEXT_PUBLIC_ROOT_TOKEN_ADDRESS || null,
    nftContract: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || null,
    rewardsContract: process.env.NEXT_PUBLIC_REWARDS_CONTRACT_ADDRESS || null,
    loggerContract: process.env.NEXT_PUBLIC_LOGGER_CONTRACT_ADDRESS || null,
  }

  const contractsDeployed = Object.values(contracts).every((addr) => addr && addr !== "0x...")

  // Check FuturePass configuration
  const futurepassClientId = process.env.NEXT_PUBLIC_FUTUREPASS_CLIENT_ID || null

  // Determine overall status
  let overall: SetupStatus["overall"] = "complete"
  if (!envValidation.isValid || !contractsDeployed || !futurepassClientId) {
    overall = "missing"
  } else if (envValidation.warnings.length > 0) {
    overall = "partial"
  }

  return {
    overall,
    environment: {
      status: envValidation.isValid ? "valid" : "invalid",
      missing: envValidation.missing,
      warnings: envValidation.warnings,
    },
    network: {
      status: "disconnected", // Will be updated when wallet connects
      name: networkConfig.name,
      chainId: networkConfig.chainId,
    },
    contracts: {
      status: contractsDeployed ? "deployed" : "missing",
      addresses: contracts,
    },
    futurepass: {
      status: futurepassClientId ? "configured" : "missing",
      clientId: futurepassClientId,
    },
  }
}

export function generateSetupInstructions(status: SetupStatus): string[] {
  const instructions: string[] = []

  if (status.environment.status === "invalid") {
    instructions.push("📋 Set up required environment variables:")
    status.environment.missing.forEach((varName) => {
      instructions.push(`   - Add ${varName} to your .env.local file`)
    })
  }

  if (status.futurepass.status === "missing") {
    instructions.push("🔐 Configure FuturePass:")
    instructions.push("   - Register at https://developers.futureverse.app")
    instructions.push("   - Get your Client ID and set NEXT_PUBLIC_FUTUREPASS_CLIENT_ID")
    instructions.push("   - Configure redirect URI for your domain")
  }

  if (status.contracts.status === "missing") {
    instructions.push("📜 Deploy smart contracts:")
    instructions.push("   - Deploy ROOT token contract (or use existing)")
    instructions.push("   - Deploy StoryForge NFT contract")
    instructions.push("   - Deploy Karma rewards contract")
    instructions.push("   - Deploy game event logger contract")
    instructions.push("   - Update contract addresses in environment variables")
  }

  if (status.environment.warnings.length > 0) {
    instructions.push("⚠️  Optional improvements:")
    status.environment.warnings.forEach((warning) => {
      instructions.push(`   - ${warning}`)
    })
  }

  if (instructions.length === 0) {
    instructions.push("✅ TRN integration is fully configured!")
    instructions.push("🚀 You can now use all blockchain features")
  }

  return instructions
}

// Development helper to show setup status in console
export async function logSetupStatus(): Promise<void> {
  const status = await checkTRNSetup()
  const instructions = generateSetupInstructions(status)

  console.group("🔗 TRN Integration Setup Status")
  console.log(`Overall Status: ${status.overall.toUpperCase()}`)
  console.log(`Network: ${status.network.name} (Chain ID: ${status.network.chainId})`)
  console.log(`Environment: ${status.environment.status}`)
  console.log(`Contracts: ${status.contracts.status}`)
  console.log(`FuturePass: ${status.futurepass.status}`)

  if (instructions.length > 0) {
    console.group("📝 Setup Instructions")
    instructions.forEach((instruction) => console.log(instruction))
    console.groupEnd()
  }

  console.groupEnd()
}
