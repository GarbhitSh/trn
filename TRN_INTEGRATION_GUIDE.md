# TRN & $ROOT Integration Guide for Storyforge

## 🎯 Overview

This guide covers the complete integration of The Root Network (TRN) and $ROOT tokens into Storyforge, enabling blockchain-powered gameplay with karma rewards, NFT achievements, and gasless transactions.

## 🏗️ Architecture

### Core Modules

1. **TRNWalletConnector** (`lib/trn/wallet-connector.ts`)
   - FuturePass wallet integration
   - Wallet state management
   - Message signing for authentication

2. **KarmaTokenEngine** (`lib/trn/karma-token-engine.ts`)
   - Karma-to-$ROOT token conversion
   - Reward calculation and distribution
   - Balance tracking and multipliers

3. **TRNFuelManager** (`lib/trn/fuel-manager.ts`)
   - Gasless transaction management
   - Fee Pallet integration
   - Gas estimation in multiple tokens

4. **NFTLootEngine** (`lib/trn/nft-loot-engine.ts`)
   - Achievement NFT minting
   - Story summary NFTs
   - Karma milestone rewards

5. **TRNLogger** (`lib/trn/logger.ts`)
   - On-chain event logging
   - Game replay generation
   - Analytics and transparency

## 🎮 Game Integration Points

### Karma Rewards System

\`\`\`typescript
// Karma to $ROOT conversion rates
const KARMA_TO_ROOT_RATES = {
  task_success: 0.05,      // +5 karma = +0.05 $ROOT
  dare_success: 0.03,      // +3 karma = +0.03 $ROOT
  dilemma_good: 0.10,      // +10 karma = +0.10 $ROOT
  bonus_tile: 0.15,        // +15 karma = +0.15 $ROOT
  game_winner: 0.25,       // +25 karma = +0.25 $ROOT
  participation: 0.01      // Base participation reward
}
\`\`\`

### NFT Achievement Types

1. **Tile Achievement NFTs**
   - Minted when completing special tiles
   - Contains tile metadata and karma earned
   - Unique artwork based on tile type

2. **Story Summary NFTs**
   - Generated at game completion
   - Contains full player story and stats
   - Personalized artwork and metadata

3. **Karma Milestone NFTs**
   - Awarded for reaching karma thresholds
   - Progressive rarity based on milestone
   - Cross-game achievement tracking

### Gasless Transactions

All gameplay actions can be performed without gas fees:
- Dice rolling
- Player movement
- Event resolution
- NFT minting

Gas is paid using $ROOT tokens or other supported tokens via TRN's Fee Pallet.

## 🔧 Setup Instructions

### 1. Environment Configuration

\`\`\`bash
# Add to your .env.local
NEXT_PUBLIC_TRN_NETWORK=trn-testnet  # or trn-mainnet
NEXT_PUBLIC_ROOT_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_LOGGER_CONTRACT_ADDRESS=0x...
\`\`\`

### 2. Smart Contract Deployment

Deploy the following contracts to TRN:

1. **Karma Reward Contract**
   ```solidity
   contract KarmaRewards {
     function rewardKarma(address player, uint256 karma) external;
     function getPlayerKarma(address player) external view returns (uint256);
   }
   \`\`\`

2. **NFT Achievement Contract**
   ```solidity
   contract StoryforgeNFT is ERC721 {
     function mintAchievement(address to, string memory tokenURI) external;
     function mintStory(address to, string memory tokenURI) external;
   }
   \`\`\`

3. **Game Logger Contract**
   ```solidity
   contract GameLogger {
     event GameEvent(string gameId, string eventType, bytes data);
     function logEvent(string memory gameId, string memory eventType, bytes memory data) external;
   }
   \`\`\`

### 3. Integration Steps

1. **Initialize TRN Integration**
   \`\`\`typescript
   import { useTRNIntegration } from '@/hooks/use-trn-integration'
   
   function GameComponent() {
     const trnIntegration = useTRNIntegration()
     
     useEffect(() => {
       // Integration is automatically initialized
     }, [])
   }
   \`\`\`

2. **Connect Wallet**
   \`\`\`typescript
   const handleConnectWallet = async () => {
     const connected = await trnIntegration.connectWallet()
     if (connected) {
       console.log('Wallet connected:', trnIntegration.walletAddress)
     }
   }
   \`\`\`

3. **Award Karma Tokens**
   \`\`\`typescript
   const handleEventSuccess = async (eventType: string, karma: number) => {
     await trnIntegration.awardKarmaTokens('task_success', karma)
   }
   \`\`\`

4. **Mint Achievement NFTs**
   \`\`\`typescript
   const handleAchievement = async (gameId: string, tileData: any) => {
     await trnIntegration.mintNFT('tile_achievement', gameId, tileData)
   }
   \`\`\`

## 🎯 Game Forge Submission

### Required Features for TRN Game Forge Track

✅ **FuturePass Integration**
- Wallet connection and authentication
- User identity management
- Seamless onboarding

✅ **$ROOT Token Utility**
- Karma rewards in $ROOT tokens
- Gas payments using $ROOT
- Staking for karma multipliers

✅ **Gasless Transactions**
- All gameplay actions are gasless
- Fee Pallet integration
- Multiple gas token support

✅ **NFT Achievements**
- Dynamic NFT generation
- Achievement tracking
- Cross-game compatibility

✅ **On-chain Transparency**
- All game events logged on-chain
- Verifiable game outcomes
- Replay functionality

### Submission Checklist

- [ ] Deploy contracts to TRN testnet
- [ ] Complete FuturePass integration testing
- [ ] Verify gasless transaction flow
- [ ] Test NFT minting and metadata
- [ ] Document API endpoints
- [ ] Create demo video
- [ ] Submit to Game Forge portal

## 🔍 Testing Guide

### Local Testing

1. **Start Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

2. **Connect FuturePass Wallet**
   - Use TRN testnet
   - Ensure test $ROOT tokens available

3. **Test Game Flow**
   - Create local game
   - Complete tiles and earn karma
   - Verify $ROOT rewards
   - Check NFT minting

### Testnet Deployment

1. **Deploy to Vercel**
   \`\`\`bash
   vercel --prod
   \`\`\`

2. **Configure Environment Variables**
   - Set TRN testnet endpoints
   - Add contract addresses
   - Configure API keys

3. **End-to-End Testing**
   - Full multiplayer game
   - Cross-device testing
   - Blockchain interaction verification

## 📊 Analytics and Monitoring

### Key Metrics

- **Player Engagement**
  - Wallet connection rate
  - Games completed with TRN features
  - Average $ROOT earned per game

- **Token Economics**
  - Total $ROOT distributed
  - Token circulation
  - Karma multiplier usage

- **NFT Activity**
  - Achievement NFTs minted
  - Story NFTs created
  - Secondary market activity

### Monitoring Dashboard

Track real-time metrics:
- Active wallet connections
- Transaction success rates
- Gas optimization performance
- NFT minting statistics

## 🚀 Future Enhancements

### Phase 2 Features

1. **Cross-Game Karma**
   - Karma persistence across games
   - Global leaderboards
   - Season rewards

2. **Advanced NFTs**
   - Animated achievements
   - Composable story elements
   - Rarity mechanics

3. **DAO Governance**
   - Community voting on themes
   - Player-created content
   - Reward pool management

4. **Mobile Integration**
   - React Native app
   - Mobile wallet support
   - Push notifications

### Scaling Considerations

- **Performance Optimization**
  - Batch transaction processing
  - Efficient state management
  - Caching strategies

- **User Experience**
  - Progressive Web App features
  - Offline gameplay support
  - Seamless wallet integration

## 🛠️ Troubleshooting

### Common Issues

1. **Wallet Connection Fails**
   \`\`\`typescript
   // Check network configuration
   if (trnIntegration.wallet.network !== 'trn-testnet') {
     console.error('Wrong network selected')
   }
   \`\`\`

2. **Transaction Reverts**
   \`\`\`typescript
   // Verify gas token balance
   const canAfford = await trnIntegration.engines.fuel?.canAffordGas(
     address, 'dice_roll', '$ROOT'
   )
   \`\`\`

3. **NFT Minting Fails**
   \`\`\`typescript
   // Check contract permissions
   const hasPermission = await checkMintingPermission(address)
   \`\`\`

### Debug Mode

Enable detailed logging:
\`\`\`typescript
localStorage.setItem('trn-debug', 'true')
\`\`\`

## 📞 Support

For technical support and questions:
- GitHub Issues: [Repository Link]
- Discord: [Community Server]
- Documentation: [Docs Site]
- Email: support@storyforge.game

---

*This integration brings Storyforge into the Web3 gaming ecosystem, providing players with true ownership of their achievements and rewards while maintaining the fun, social gameplay experience.*
