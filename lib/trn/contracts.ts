import { trnWallet } from "./wallet-provider"
import { ethers } from "ethers"

// Mock contract addresses for demo (replace with real deployed contracts)
export const CONTRACT_ADDRESSES = {
  testnet: {
    rootToken: "0x0000000000000000000000000000000000000000", // Will be deployed
    storyforgeNFT: "0x0000000000000000000000000000000000000000", // Will be deployed
    karmaRewards: "0x0000000000000000000000000000000000000000", // Will be deployed
  },
  mainnet: {
    rootToken: "0x0000000000000000000000000000000000000000", // Will be deployed
    storyforgeNFT: "0x0000000000000000000000000000000000000000", // Will be deployed
    karmaRewards: "0x0000000000000000000000000000000000000000", // Will be deployed
  },
} as const

// Simplified ABIs for demo
export const CONTRACT_ABIS = {
  ERC20: [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
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
  ],
  KarmaRewards: [
    "function awardKarma(address player, uint256 amount, string memory reason) external",
    "function getPlayerKarma(address player) view returns (uint256)",
    "function claimRewards(address player) external returns (uint256)",
  ],
} as const

export class TRNContractManager {
  private network: "testnet" | "mainnet"

  constructor(network: "testnet" | "mainnet" = "testnet") {
    this.network = network
  }

  private getContractAddress(contract: keyof (typeof CONTRACT_ADDRESSES)["testnet"]): string {
    return CONTRACT_ADDRESSES[this.network][contract]
  }

  // ROOT Token interactions
  async getRootBalance(address: string): Promise<string> {
    try {
      const contractAddress = this.getContractAddress("rootToken")
      if (contractAddress === "0x0000000000000000000000000000000000000000") {
        // Mock balance for demo
        return "100.0"
      }

      const balance = await trnWallet.callContract(contractAddress, CONTRACT_ABIS.ERC20, "balanceOf", [address])
      return ethers.formatUnits(balance, 18) // Assuming 18 decimals for ROOT
    } catch (error) {
      console.error("Error getting ROOT balance:", error)
      return "0.0"
    }
  }

  async transferRoot(to: string, amount: string): Promise<string> {
    try {
      const contractAddress = this.getContractAddress("rootToken")
      if (contractAddress === "0x0000000000000000000000000000000000000000") {
        // Mock transaction for demo
        return "0x" + Math.random().toString(16).substr(2, 64)
      }

      const amountWei = ethers.parseUnits(amount, 18)
      return await trnWallet.writeContract(contractAddress, CONTRACT_ABIS.ERC20, "transfer", [to, amountWei])
    } catch (error) {
      console.error("Error transferring ROOT:", error)
      throw error
    }
  }

  // NFT interactions
  async getNFTBalance(address: string): Promise<number> {
    try {
      const contractAddress = this.getContractAddress("storyforgeNFT")
      if (contractAddress === "0x0000000000000000000000000000000000000000") {
        // Mock NFT count for demo
        return Math.floor(Math.random() * 5)
      }

      const balance = await trnWallet.callContract(contractAddress, CONTRACT_ABIS.ERC721, "balanceOf", [address])
      return Number.parseInt(balance.toString())
    } catch (error) {
      console.error("Error getting NFT balance:", error)
      return 0
    }
  }

  async mintStoryNFT(to: string, tokenURI: string): Promise<string> {
    try {
      const contractAddress = this.getContractAddress("storyforgeNFT")
      if (contractAddress === "0x0000000000000000000000000000000000000000") {
        // Mock transaction for demo
        return "0x" + Math.random().toString(16).substr(2, 64)
      }

      return await trnWallet.writeContract(contractAddress, CONTRACT_ABIS.ERC721, "mint", [to, tokenURI])
    } catch (error) {
      console.error("Error minting NFT:", error)
      throw error
    }
  }

  // Karma rewards
  async getPlayerKarma(address: string): Promise<number> {
    try {
      const contractAddress = this.getContractAddress("karmaRewards")
      if (contractAddress === "0x0000000000000000000000000000000000000000") {
        // Mock karma for demo
        return Math.floor(Math.random() * 100)
      }

      const karma = await trnWallet.callContract(contractAddress, CONTRACT_ABIS.KarmaRewards, "getPlayerKarma", [
        address,
      ])
      return Number.parseInt(karma.toString())
    } catch (error) {
      console.error("Error getting karma:", error)
      return 0
    }
  }

  async awardKarma(player: string, amount: number, reason: string): Promise<string> {
    try {
      const contractAddress = this.getContractAddress("karmaRewards")
      if (contractAddress === "0x0000000000000000000000000000000000000000") {
        // Mock transaction for demo
        console.log(`Mock: Awarded ${amount} karma to ${player} for ${reason}`)
        return "0x" + Math.random().toString(16).substr(2, 64)
      }

      return await trnWallet.writeContract(contractAddress, CONTRACT_ABIS.KarmaRewards, "awardKarma", [
        player,
        amount,
        reason,
      ])
    } catch (error) {
      console.error("Error awarding karma:", error)
      throw error
    }
  }

  async claimRewards(player: string): Promise<string> {
    try {
      const contractAddress = this.getContractAddress("karmaRewards")
      if (contractAddress === "0x0000000000000000000000000000000000000000") {
        // Mock transaction for demo
        return "0x" + Math.random().toString(16).substr(2, 64)
      }

      return await trnWallet.writeContract(contractAddress, CONTRACT_ABIS.KarmaRewards, "claimRewards", [player])
    } catch (error) {
      console.error("Error claiming rewards:", error)
      throw error
    }
  }
}

// Singleton instance
export const trnContracts = new TRNContractManager("testnet")
