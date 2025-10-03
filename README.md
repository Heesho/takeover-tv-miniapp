# TakeoverTV - Farcaster Mini App

A decentralized, single-channel television network built as a Farcaster Mini App. Anyone can "takeover" the channel by paying a continuously decaying price.

## Features

- 📺 **Single Shared Channel**: One video player for the entire Farcaster community
- 💰 **Dutch Auction Mechanics**: Price continuously decays from 2x the last takeover price to zero over 24 hours
- 🔄 **TV Static Transitions**: Nostalgic channel-switching effect with visual and audio feedback
- 🎬 **YouTube Integration**: Share any public YouTube video with the community
- ⛓️ **On-Chain Governance**: All takeovers are recorded on-chain via smart contract
- 📱 **Mobile-First Design**: Optimized for mobile Farcaster clients

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Blockchain**: Viem + Wagmi for Ethereum interactions
- **Farcaster**: Mini App SDK for seamless integration
- **Smart Contract**: Television.sol (Dutch auction mechanics)

## Getting Started

### Prerequisites

- Node.js 22.11.0 or higher
- A deployed Television smart contract
- Farcaster account for testing

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd takeover-tv-minapp
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
cp .env.local.example .env.local
```

4. Configure your `.env.local`:
```env
# Your deployed Television contract address
NEXT_PUBLIC_TELEVISION_ADDRESS=0x...

# Blockchain configuration (Base = 8453, Base Sepolia = 84532)
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org

# Your domain (use localhost:3000 for local dev)
NEXT_PUBLIC_APP_DOMAIN=localhost:3000
NEXT_PUBLIC_APP_NAME=TakeoverTV
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Setting Up Farcaster Mini App

### 1. Enable Developer Mode

1. Visit [https://farcaster.xyz/~/settings/developer-tools](https://farcaster.xyz/~/settings/developer-tools)
2. Toggle on "Developer Mode"

### 2. Preview Your App

1. Use ngrok or similar to expose your local server:
```bash
ngrok http 3000
```

2. Visit the [Mini App Preview Tool](https://farcaster.xyz/~/developers/mini-apps/preview)
3. Enter your ngrok URL to test

### 3. Sign Your Manifest

Before publishing, you need to sign your manifest:

1. Deploy your app to your production domain
2. Visit [https://farcaster.xyz/~/developers/mini-apps/manifest](https://farcaster.xyz/~/developers/mini-apps/manifest)
3. Enter your domain and sign the manifest
4. Copy the `accountAssociation` object
5. Update `app/api/manifest/route.ts` with the signed values

### 4. Create Images

Create the following images in your `public/` directory:

- `logo.png` (200x200px) - App icon for splash screen
- `og-image.png` (1200x630px) - Social sharing image (3:2 ratio)
- `screenshot1.png` - App screenshot for app store

## Project Structure

```
takeover-tv-minapp/
├── app/
│   ├── api/
│   │   └── manifest/
│   │       └── route.ts        # Farcaster manifest endpoint
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Main app page
│   └── globals.css             # Global styles with TV static effect
├── components/
│   ├── VideoPlayer.tsx         # YouTube player with static transitions
│   ├── ChannelInfo.tsx         # Current owner and price display
│   ├── TakeoverForm.tsx        # URL input and transaction handling
│   └── Providers.tsx           # Wagmi and React Query providers
├── contracts/
│   └── television-abi.ts       # Smart contract ABIs
├── hooks/
│   └── useTelevision.ts        # Custom hooks for contract interactions
├── lib/
│   └── wagmi.ts                # Wagmi configuration
└── utils/
    ├── env.ts                  # Environment configuration
    └── youtube.ts              # YouTube URL validation utilities
```

## Key Components

### VideoPlayer

- Displays YouTube videos in a 16:9 player
- Shows TV static transition effect when channel changes
- Displays "STANDBY" mode for invalid URIs
- Auto-plays videos when they load

### ChannelInfo

- Shows current channel owner address (shortened)
- Displays real-time decaying price
- Visual indicator that price is continuously decaying

### TakeoverForm

- YouTube URL validation with visual feedback
- Two-step transaction process:
  1. Approve USDC (if needed)
  2. Execute takeover
- Success/error feedback to user

## Smart Contract Integration

The app interacts with the Television.sol contract with these key functions:

- `getSlot0()`: Returns current owner and URI
- `getPrice()`: Returns current decaying price
- `takeover(string uri)`: Execute a takeover with new URI
- `Takeover` event: Emitted when channel changes hands

## Development Tips

### Testing Locally

1. Use ngrok to expose your local dev server
2. Test in the Farcaster Mini App Preview Tool
3. Note: `addMiniApp()` only works on production domains

### Wallet Integration

The app auto-connects to the Farcaster wallet using the `@farcaster/miniapp-wagmi-connector`.

### Price Decay

Prices are fetched every 5 seconds to show live decay. Adjust the interval in `hooks/useTelevision.ts` if needed.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Post-Deployment

1. Update `NEXT_PUBLIC_APP_DOMAIN` to your production domain
2. Sign your manifest using the Farcaster manifest tool
3. Upload required images (logo, og-image, screenshots)
4. Test the app using the preview tool
5. Share in Farcaster!

## Troubleshooting

### "Invalid domain manifest" error

Make sure your manifest is properly signed and accessible at `https://yourdomain.com/.well-known/farcaster.json`

### Transactions failing

1. Check that you have enough USDC in your wallet
2. Verify the Television contract address is correct
3. Ensure you're on the correct network (Base/Base Sepolia)

### Video not loading

1. Verify the YouTube URL is valid and embeddable
2. Check that the video is public and allows embedding
3. Test the URL manually on youtube.com

## Resources

- [Farcaster Mini Apps Docs](https://miniapps.farcaster.xyz)
- [Wagmi Documentation](https://wagmi.sh)
- [Next.js Documentation](https://nextjs.org/docs)
- [Viem Documentation](https://viem.sh)

## License

MIT
