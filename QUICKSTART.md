# TakeoverTV - Quick Start Guide

Get your TakeoverTV Mini App running in 5 minutes!

## Prerequisites

- Node.js 22.11.0+ installed
- A deployed Television smart contract
- Farcaster account

## Quick Setup

### 1. Configure Environment

```bash
# Copy the example environment file
cp .env.local.example .env.local
```

Edit `.env.local` with your values:

```env
NEXT_PUBLIC_TELEVISION_ADDRESS=0xYourContractAddress
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_APP_DOMAIN=localhost:3000
NEXT_PUBLIC_APP_NAME=TakeoverTV
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Validate Setup

```bash
npm run check
```

This will verify all files and configurations are correct.

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Test in Farcaster

To test in a Farcaster client, you need to expose your local server:

```bash
# Install ngrok if you haven't
npm install -g ngrok

# In a new terminal, expose port 3000
ngrok http 3000
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

Then test using the Farcaster preview tool:
1. Go to [https://farcaster.xyz/~/developers/mini-apps/preview](https://farcaster.xyz/~/developers/mini-apps/preview)
2. Enter your ngrok URL
3. Click Preview

## Expected Behavior

When working correctly, you should see:

✅ **Video Player Area** - Shows STANDBY until someone takes over
✅ **Channel Info** - Displays owner address and current price
✅ **Takeover Button** - Shows current price to take control
✅ **Wallet Auto-Connect** - In Farcaster client, wallet connects automatically
✅ **Price Updates** - Price ticks down every 5 seconds

## Common Issues

### "Cannot find module"
**Solution**: Run `npm install` again

### "Invalid contract address"
**Solution**: Update `NEXT_PUBLIC_TELEVISION_ADDRESS` in `.env.local`

### "Wallet not connecting"
**Solution**: Make sure you're testing in Farcaster client, not regular browser

### "Port 3000 already in use"
**Solution**: Run `npm run dev -- -p 3001` to use port 3001 instead

## Next Steps

Once your local dev environment is working:

1. **Create Images**
   - Create `public/logo.png` (200x200px)
   - Create `public/og-image.png` (1200x630px)

2. **Test Takeover Flow**
   - Connect wallet
   - Enter a YouTube URL
   - Execute a takeover
   - Watch the static transition!

3. **Deploy**
   - Follow the [DEPLOYMENT.md](DEPLOYMENT.md) guide
   - Deploy to Vercel
   - Sign your manifest
   - Launch on Farcaster!

## Project Structure

```
takeover-tv-minapp/
├── app/
│   ├── page.tsx              # Main app page
│   └── api/manifest/         # Farcaster manifest
├── components/
│   ├── VideoPlayer.tsx       # YouTube player
│   ├── ChannelInfo.tsx       # Owner/price display
│   └── TakeoverForm.tsx      # Takeover interface
├── hooks/
│   └── useTelevision.ts      # Smart contract hooks
├── contracts/
│   └── television-abi.ts     # Contract ABIs
└── .env.local                # Your configuration
```

## Help & Resources

- 📖 Full README: [README.md](README.md)
- 🚀 Deployment Guide: [DEPLOYMENT.md](DEPLOYMENT.md)
- ✅ Setup Checklist: [SETUP-CHECKLIST.md](SETUP-CHECKLIST.md)
- 📚 Farcaster Docs: [miniapps.farcaster.xyz](https://miniapps.farcaster.xyz)

## Troubleshooting

Run the setup checker to diagnose issues:

```bash
npm run check
```

Need more help? Check:
- [Farcaster Mini Apps Docs](https://miniapps.farcaster.xyz)
- [Troubleshooting Guide](https://miniapps.farcaster.xyz/docs/guides/agents-checklist)
- [Wagmi Documentation](https://wagmi.sh)

---

**Ready to build?** Run `npm run dev` and start hacking! 🚀
