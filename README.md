# Take0ver TV

A community-controlled television built as a Farcaster Mini App. Users can "take over" the shared screen and broadcast their Twitch stream by paying the current takeover price. The price doubles after each takeover and decays back to zero over one hour, creating an engaging economic game.

## Features

- **Twitch Stream Integration** - Seamlessly embeds live Twitch streams
- **Dynamic Pricing** - Doubling-and-decay pricing algorithm
- **Smart Contract Integration** - On-chain ownership and price management via Base Sepolia
- **Farcaster Mini App** - Runs inside Farcaster clients like Warpcast
- **Retro/Cyberpunk UI** - CRT-style interface with scanlines and glitch effects
- **Wallet Integration** - Automatic wallet connection via Farcaster connector

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom retro styling
- **Web3**: Wagmi, Viem
- **Blockchain**: Base Sepolia
- **Platform**: Farcaster Mini App SDK
- **Tokens**: USDC for payments

## Project Structure

```
takeover-tv-minapp/
├── app/
│   ├── api/
│   │   └── manifest/
│   │       └── route.ts          # Farcaster manifest API
│   ├── globals.css               # Global styles with retro effects
│   ├── layout.tsx                # Root layout with providers
│   └── page.tsx                  # Main application page
├── components/
│   ├── ChannelInfo.tsx           # TV owner and price display
│   ├── Providers.tsx             # Wagmi and React Query providers
│   ├── StartOverlay.tsx          # Power-on screen
│   ├── TakeoverForm.tsx          # URL input and takeover button
│   └── VideoPlayer.tsx           # Twitch embed player
├── contracts/
│   ├── television-abi.ts         # Television contract ABI
│   └── usdc-abi.ts               # USDC contract ABI
├── hooks/
│   ├── useFarcasterContext.ts    # Hook for Farcaster user data
│   └── useTelevision.ts          # Hook for contract interactions
├── lib/
│   └── wagmi.ts                  # Wagmi configuration
├── public/
│   ├── .well-known/
│   │   └── farcaster.json        # Farcaster manifest
│   ├── logo.svg                  # App logo
│   └── og-image.svg              # Open Graph image
├── scripts/
│   ├── check-contract.mjs        # Contract verification script
│   └── check-setup.js            # Project setup validation
├── utils/
│   ├── env.ts                    # Environment configuration
│   ├── farcaster.ts              # Farcaster utilities
│   ├── twitch.ts                 # Twitch URL parsing
│   └── youtube.ts                # YouTube utilities (future)
├── .env.local                    # Environment variables
└── package.json
```

## Smart Contracts

### Television Contract
**Address**: `0x46Fcd75Dd8cB75e678D078353e8C3fd32671f215`

Main contract that manages channel ownership and takeover pricing.

**Key Functions**:
- `currentChannel()` - Returns current owner, price, timestamp, and URI
- `getCurrentPrice()` - Returns current takeover price
- `takeover(string uri)` - Execute a takeover with new channel URI

### USDC Contract
**Address**: `0x6c268B147FeB6d50a165F2357cE2eC57EF17d5B7`

Standard ERC-20 token used for payments on Base Sepolia.

## Setup Instructions

### Prerequisites

- Node.js 22.11.0 or higher
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd takeover-tv-minapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_CHAIN_ID=84532
   NEXT_PUBLIC_TELEVISION_CONTRACT=0x46Fcd75Dd8cB75e678D078353e8C3fd32671f215
   NEXT_PUBLIC_USDC_CONTRACT=0x6c268B147FeB6d50a165F2357cE2eC57EF17d5B7
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_DEFAULT_CHANNEL=gamesdonequick
   ```

4. **Verify setup**
   ```bash
   npm run check:setup
   ```

5. **Verify contract access**
   ```bash
   npm run check:contract
   ```

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

**Important**: Update `NEXT_PUBLIC_APP_URL` to your production domain.

### Farcaster Manifest

After deployment, update the Farcaster manifest:

1. Update `public/.well-known/farcaster.json` with your production URL
2. Generate account association signature (if needed)
3. Test manifest at: `https://your-domain.com/.well-known/farcaster.json`

## How It Works

### Economic Model

1. **Initial State**: TV starts with a default channel and price
2. **Takeover**: User enters a Twitch URL and pays the current price
3. **Price Update**: Price doubles and decay timer resets
4. **Decay**: Price linearly decreases to $0 over 1 hour
5. **Repeat**: Next user can takeover when ready

### Smart Contract Flow

1. User approves USDC spending (if needed)
2. User calls `takeover()` with their Twitch URL
3. Contract transfers USDC from user
4. Contract updates channel owner and URI
5. Contract doubles the `initPrice`
6. UI reflects new owner and begins price decay

### Farcaster Integration

- **Context**: Uses `@farcaster/miniapp-sdk` to get user info
- **Wallet**: Automatic connection via `farcasterConnector`
- **Launch**: Opens from casts, profiles, or direct links
- **Auth**: No separate auth needed - wallet is identity

### Twitch Embedding

The app properly handles Twitch's parent domain requirements for Farcaster clients:
- `client.warpcast.com`
- `supercast.xyz`
- `embeds.lfg.castle.fyi`

## Troubleshooting

### "Contract not found" error
- Verify you're on Base Sepolia (chainId: 84532)
- Check contract addresses in `.env.local`
- Run `npm run check:contract`

### Twitch player not loading
- Verify the Twitch URL format: `https://twitch.tv/channelname`
- Check browser console for parent domain errors
- Ensure you're accessing via proper domain (not localhost in production)

### Transaction failures
- Check you have USDC balance on Base Sepolia
- Verify you've approved sufficient USDC allowance
- Confirm wallet is connected

### Mini App not loading in Warpcast
- Verify manifest is accessible: `https://your-domain.com/.well-known/farcaster.json`
- Check `fc:miniapp` meta tag in HTML
- Ensure `sdk.actions.ready()` is called after app loads

## Development Tips

### Testing Locally

1. Use a tunnel service (ngrok, localtunnel) to test in Farcaster
2. Add tunnel domain to Twitch parent domains in `utils/twitch.ts`
3. Test with Base Sepolia testnet USDC

### Getting Testnet USDC

1. Bridge ETH to Base Sepolia
2. Use a Base Sepolia faucet for test USDC
3. Or ask in the project's community channels

### Customization

- **Styling**: Edit `app/globals.css` for retro effects
- **Default Channel**: Change `NEXT_PUBLIC_DEFAULT_CHANNEL`
- **Pricing Algorithm**: Modify `EPOCH_PERIOD` in `hooks/useTelevision.ts`
- **UI Components**: Customize components in `components/`

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Add your license here]

## Support

For issues and questions:
- Open an issue on GitHub
- Contact via Farcaster: [Add your handle]

## Acknowledgments

- Built for the Farcaster ecosystem
- Uses the Farcaster Mini App SDK
- Powered by Base Sepolia
- Twitch integration for live streaming
