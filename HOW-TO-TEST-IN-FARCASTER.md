# How to Test Your Mini App in Farcaster

Your app is showing "Connecting..." because the Farcaster wallet connector only works inside a Farcaster client, not in a regular browser.

## Quick Test Setup (5 minutes)

### Step 1: Install ngrok

**Option A - Download:**
```bash
# Visit: https://ngrok.com/download
# Download and install for Windows
```

**Option B - Using npm:**
```bash
npm install -g ngrok
```

**Option C - Using Chocolatey:**
```bash
choco install ngrok
```

### Step 2: Create ngrok Account (Free)

1. Go to: https://dashboard.ngrok.com/signup
2. Sign up (free account is fine)
3. Get your auth token from: https://dashboard.ngrok.com/get-started/your-authtoken
4. Run: `ngrok config add-authtoken YOUR_TOKEN_HERE`

### Step 3: Expose Your Local Server

**Terminal 1 - Keep your dev server running:**
```bash
npm run dev
# Should be running on http://localhost:3000
```

**Terminal 2 - Start ngrok:**
```bash
ngrok http 3000
```

You'll see output like:
```
Forwarding   https://abc123def.ngrok-free.app -> http://localhost:3000
```

**Copy that https URL!** (e.g., `abc123def.ngrok-free.app`)

### Step 4: Update Your Environment

Edit `.env.local`:
```env
NEXT_PUBLIC_APP_DOMAIN=abc123def.ngrok-free.app
```

**Important:** Don't include `https://`, just the domain!

### Step 5: Restart Dev Server

```bash
# Stop the dev server (Ctrl+C in Terminal 1)
# Then restart:
npm run dev
```

### Step 6: Test in Farcaster

**Option A - Use Farcaster Preview Tool:**
```
1. Go to: https://farcaster.xyz/~/developers/mini-apps/preview
2. Enter your ngrok URL: https://abc123def.ngrok-free.app
3. Click "Preview"
4. Your app will load in an iframe
5. Wallet should auto-connect!
```

**Option B - Share in a Cast (if you have Farcaster account):**
```
1. Open Warpcast or another Farcaster client
2. Create a new cast
3. Paste your ngrok URL
4. Post it
5. Click on your own cast
6. Open the Mini App
7. Wallet should auto-connect!
```

## What You Should See

### In Browser (localhost:3000) ❌
```
Header: "Connecting..."
Video: "STANDBY - No signal detected"
Button: "Loading..."
```
**This is normal** - no Farcaster wallet available

### In Farcaster Client (ngrok URL) ✅
```
Header: "Connected" + "0x1234...5678"
Video: Shows current channel owner's video
Current Owner: 0x039e...dfeE
Takeover Price: $7.18 USDC
Button: "Takeover for $7.18 USDC"
```
**This is what you want!**

## Testing the Full Flow

Once connected in Farcaster:

1. **Check Connection:**
   - Header should show "Connected" with your address
   - Current owner should display
   - Price should show in USDC

2. **Get Test Tokens:**
   - Need Sepolia ETH for gas
   - Need test USDC tokens
   - See below for how to get them

3. **Try a Takeover:**
   - Click "Takeover for $X.XX USDC" button
   - Enter YouTube URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - Click "Confirm"
   - You'll get prompted to sign transactions in Farcaster wallet

## Getting Test Tokens

### Sepolia ETH (for gas fees)

**Step 1: Get Sepolia ETH**
```
Visit: https://sepoliafaucet.com
Or: https://www.alchemy.com/faucets/ethereum-sepolia
Enter your wallet address
Claim testnet ETH
```

**Step 2: Bridge to Base Sepolia**
```
Visit: https://bridge.base.org/deposit
Connect wallet
Select "Ethereum Sepolia" → "Base Sepolia"
Bridge 0.1 ETH
Wait for confirmation
```

### Test USDC

**Check if USDC contract has a faucet:**
```
1. Go to: https://sepolia.basescan.org/address/0x6c268B147FeB6d50a165F2357cE2eC57EF17d5B7#writeContract
2. Look for functions like:
   - mint()
   - faucet()
   - drip()
3. If you find one, connect wallet and call it
```

**Add USDC to your wallet:**
```
Open MetaMask or Farcaster wallet
Click "Import tokens"
Paste address: 0x6c268B147FeB6d50a165F2357cE2eC57EF17d5B7
Symbol: USDC
Decimals: 6
```

## Troubleshooting

### "ngrok not found"
```bash
# Install globally
npm install -g ngrok

# Or download from https://ngrok.com/download
```

### "Invalid host header" error
This usually doesn't happen with Next.js, but if it does:
```bash
# In next.config.ts, you can add:
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
      ],
    },
  ];
}
```

### "Still showing Connecting..."
Make sure:
1. ✅ ngrok is running and URL is correct
2. ✅ Updated `NEXT_PUBLIC_APP_DOMAIN` in `.env.local`
3. ✅ Restarted dev server after updating env
4. ✅ Testing in Farcaster preview tool, not regular browser
5. ✅ Using the ngrok HTTPS URL, not localhost

### "Wallet not connecting in preview"
Try:
1. Refresh the preview page
2. Check browser console for errors (F12)
3. Make sure you're logged into Farcaster
4. Try in actual Farcaster app instead of preview

### ngrok URL keeps changing
Free ngrok URLs change each time you restart. Solutions:
1. Keep ngrok running (don't restart it)
2. Upgrade to ngrok paid plan for static domain
3. Use a different tunneling service with static URLs

## Alternative: Deploy to Production

If ngrok is giving you trouble, you can deploy to production:

```bash
# Deploy to Vercel
vercel --prod

# Or push to GitHub and connect to Vercel
git push origin main
# Then connect repo in Vercel dashboard
```

Then:
1. Get your production URL (e.g., takeovertv.vercel.app)
2. Update `NEXT_PUBLIC_APP_DOMAIN` to your production domain
3. Sign manifest at https://farcaster.xyz/~/developers
4. Test in Farcaster!

## Summary

**Why localhost doesn't work:**
- Farcaster Mini App connector only works in Farcaster clients
- Your browser has no Farcaster wallet
- Expected behavior: shows "Connecting..."

**How to test properly:**
1. Use ngrok to expose localhost
2. Update `NEXT_PUBLIC_APP_DOMAIN`
3. Restart dev server
4. Test in Farcaster preview tool
5. Wallet auto-connects ✅

**Next steps:**
1. Set up ngrok (see above)
2. Test in Farcaster
3. Get test tokens
4. Try your first takeover!

---

Your app is working correctly - it just needs to run in a Farcaster client! 🚀
