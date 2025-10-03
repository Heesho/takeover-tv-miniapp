# 🎬 START HERE - TakeoverTV Quick Start

## ✅ Setup Complete!

Your TakeoverTV Mini App is configured for **Base Sepolia testnet**:

- **Television Contract**: `0x56CB1908D5B927A8f710a0247c63B87dc578e5dA`
- **USDC Token**: `0x6c268B147FeB6d50a165F2357cE2eC57EF17d5B7`
- **Network**: Base Sepolia (Chain ID: 84532)

## 🚀 Three Steps to Launch

### 1. Convert Images (2 minutes)
```bash
# Quick option: Use online converter
# Go to: https://cloudconvert.com/svg-to-png

# Convert these files:
# public/logo.svg → public/logo.png (200x200px)
# public/og-image.svg → public/og-image.png (1200x630px)
```

### 2. Install & Run (30 seconds)
```bash
npm install
npm run dev
```

### 3. Open & Test
```
http://localhost:3000
```

## 💰 Get Test Tokens

**You'll need:**
1. **Sepolia ETH** (for gas)
   - Get from: https://sepoliafaucet.com
   - Bridge to Base Sepolia: https://bridge.base.org/deposit

2. **Test USDC** tokens
   - Check if the USDC contract has a mint/faucet function:
   - https://sepolia.basescan.org/address/0x6c268B147FeB6d50a165F2357cE2eC57EF17d5B7#writeContract

**Add USDC to MetaMask:**
```
Token Address: 0x6c268B147FeB6d50a165F2357cE2eC57EF17d5B7
Symbol: USDC
Decimals: 6
```

## 🧪 First Test

1. Open http://localhost:3000
2. Connect wallet (Base Sepolia network)
3. Click "Takeover" button
4. Paste YouTube URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
5. Confirm approve transaction
6. Confirm takeover transaction
7. 🎉 Your video is now on TakeoverTV!

## 📱 Test in Farcaster (Optional)

```bash
# Terminal 1: Expose local server
ngrok http 3000

# Terminal 2: Update .env.local with ngrok URL
# Then restart: npm run dev

# Test at: https://farcaster.xyz/~/developers/mini-apps/preview
```

## 📚 Documentation

- **`TEST-CHECKLIST.md`** - Complete testing guide
- **`DEPLOYMENT-INFO.md`** - Contract addresses & network info
- **`SETUP-COMPLETE.md`** - Full setup documentation
- **`QUICKSTART-FINAL.md`** - Quick reference
- **`CONTRACT-VERIFICATION.md`** - Contract integration verification

## 🔗 Useful Links

**Base Sepolia:**
- Block Explorer: https://sepolia.basescan.org
- Your Contract: https://sepolia.basescan.org/address/0x56CB1908D5B927A8f710a0247c63B87dc578e5dA
- USDC Token: https://sepolia.basescan.org/address/0x6c268B147FeB6d50a165F2357cE2eC57EF17d5B7

**Farcaster:**
- Developer Tools: https://farcaster.xyz/~/developers
- Mini App Preview: https://farcaster.xyz/~/developers/mini-apps/preview

## ⚡ Quick Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Check setup
npm run check

# View contract on BaseScan
start https://sepolia.basescan.org/address/0x56CB1908D5B927A8f710a0247c63B87dc578e5dA
```

## 🎯 What You'll See

1. **Initial State**: Empty channel or deployer's content
2. **First Takeover**: Price should be ~1 USDC (MIN_INIT_PRICE)
3. **After Takeover**: Your video plays, you're the owner
4. **Next Price**: 2x what you paid, decaying to 0 over 24h
5. **Anyone Can Take Over**: When they pay the current price

## ✅ Everything is Ready!

Your app has:
- ✅ Smart contract integration
- ✅ Batch transaction support
- ✅ Real-time price updates
- ✅ Share on Farcaster
- ✅ Haptic feedback
- ✅ Mobile-first design
- ✅ All Farcaster best practices

---

**🚀 Run `npm run dev` and start testing!**

Check `TEST-CHECKLIST.md` for comprehensive testing steps.
