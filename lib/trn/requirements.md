## RPC Endpoints

Use these official TRN RPC endpoints with your API key:

### Porcini Testnet
- **HTTPS**: `https://porcini.rootscan.io/archive?apikey=YOUR_API_KEY`
- **WebSocket**: `wss://porcini.rootscan.io/live/ws?apikey=YOUR_API_KEY`
- **Explorer**: https://porcini.rootscan.io

### Root Mainnet  
- **HTTPS**: `https://rootscan.io/archive?apikey=YOUR_API_KEY`
- **WebSocket**: `wss://rootscan.io/live/ws?apikey=YOUR_API_KEY`
- **Explorer**: https://rootscan.io

### API Keys
You have these API keys configured:
- **RPC API Key**: `2c0bd468-580e-41b9-979e-3eba235fb358`
- **TRN API Key**: `e6f50477-d9b0-4936-9d02-a53147ea79f1`

## Environment Variables

\`\`\`bash
# RPC Configuration (REQUIRED)
NEXT_PUBLIC_TRN_RPC_API_KEY=2c0bd468-580e-41b9-979e-3eba235fb358
NEXT_PUBLIC_TRN_API_KEY=e6f50477-d9b0-4936-9d02-a53147ea79f1
NEXT_PUBLIC_TRN_NETWORK=testnet

# FuturePass Configuration (REQUIRED)
NEXT_PUBLIC_FUTUREPASS_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_FUTUREPASS_REDIRECT_URI=https://yourdomain.com/auth/callback
