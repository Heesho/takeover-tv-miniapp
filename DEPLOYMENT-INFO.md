# TakeoverTV Deployment Information

## Base Sepolia Testnet Deployment

### Contract Addresses

**Television Contract**
- Address: `0x7136763c7951F923b1861774CF9ef12095cb21DD`
- Network: Base Sepolia (Chain ID: 84532)
- Explorer: https://sepolia.basescan.org/address/0x7136763c7951F923b1861774CF9ef12095cb21DD

**USDC (Quote Token)**
- Address: `0x6c268B147FeB6d50a165F2357cE2eC57EF17d5B7`
- Network: Base Sepolia (Chain ID: 84532)
- Explorer: https://sepolia.basescan.org/address/0x6c268B147FeB6d50a165F2357cE2eC57EF17d5B7

### Network Information

**Base Sepolia Testnet**
- Chain ID: 84532
- RPC URL: https://sepolia.base.org
- Block Explorer: https://sepolia.basescan.org
- Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

### Getting Test Tokens

1. **Get Sepolia ETH** (for gas):
   - Visit: https://sepoliafaucet.com
   - Or: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
   - Bridge to Base Sepolia: https://bridge.base.org/deposit

2. **Get Test USDC**:
   - The USDC contract at `0x6c268B147FeB6d50a165F2357cE2eC57EF17d5B7` is likely a test token
   - Check if it has a `mint()` or `faucet()` function on BaseScan
   - Or contact the deployer for test tokens

### Testing the App

1. **Install dependencies** (if not done):
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   ```
   http://localhost:3000
   ```

4. **Connect wallet**:
   - Make sure your wallet is on Base Sepolia network
   - Click "Connect Wallet" in the app
   - Approve the connection

5. **Get test tokens**:
   - Ensure you have Sepolia ETH in your wallet (for gas)
   - Get test USDC tokens from the token contract

6. **Test takeover**:
   - Paste a YouTube URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)
   - Click the Takeover button
   - Approve USDC spending
   - Confirm the takeover transaction
   - Wait for confirmation

### Contract State

**Initial State** (from constructor):
- Owner: Contract deployer address
- Initial Price: 1 USDC (1e6)
- Epoch ID: 0
- Start Time: Block timestamp of deployment
- URI: Empty string

**First Takeover**:
- Price: Should be at or near MIN_INIT_PRICE (1 USDC)
- Sets new owner to your address
- Sets your YouTube URL
- Increments epoch to 1

**Subsequent Takeovers**:
- Starting price: 2x previous settlement price
- Price decays linearly to 0 over 24 hours
- 10% fee goes to treasury (if set)
- 90% goes to previous channel owner

### Verifying Transactions

**View Contract State**:
```javascript
// In browser console after connecting wallet:

// Get current slot0 (owner, uri, etc.)
// The app already does this - check the UI

// Get current price
// Displayed in the Takeover button
```

**On BaseScan**:
1. Go to: https://sepolia.basescan.org/address/0x7136763c7951F923b1861774CF9ef12095cb21DD
2. Click "Contract" → "Read Contract"
3. Call `getSlot0()` to see current state
4. Call `getPrice()` to see current price

### Useful Commands

**Check contract on BaseScan**:
```bash
# Television Contract
open https://sepolia.basescan.org/address/0x7136763c7951F923b1861774CF9ef12095cb21DD

# USDC Token
open https://sepolia.basescan.org/address/0x6c268B147FeB6d50a165F2357cE2eC57EF17d5B7
```

**Add network to MetaMask**:
- Network Name: Base Sepolia
- RPC URL: https://sepolia.base.org
- Chain ID: 84532
- Currency Symbol: ETH
- Block Explorer: https://sepolia.basescan.org

### Testing with Farcaster

To test the Mini App in Farcaster:

1. **Expose local server with ngrok**:
   ```bash
   ngrok http 3000
   ```

2. **Update .env.local**:
   ```env
   NEXT_PUBLIC_APP_DOMAIN=your-id.ngrok.io
   ```

3. **Restart dev server**:
   ```bash
   npm run dev
   ```

4. **Test in Farcaster preview tool**:
   - Go to: https://farcaster.xyz/~/developers/mini-apps/preview
   - Enter your ngrok URL
   - Test the Mini App flow

### Troubleshooting

**"Insufficient allowance" error**:
- Make sure you approved enough USDC
- Try approving a larger amount

**"EpochIdMismatch" error**:
- Someone took over while you were preparing your transaction
- Refresh the page and try again with the new epoch

**"MaxPaymentAmountExceeded" error**:
- Price increased (someone took over)
- Or you waited too long and slippage was exceeded
- Refresh and try again

**"Expired" error**:
- Your transaction took longer than 5 minutes
- Try again with a new transaction

**Wallet not connecting**:
- Make sure you're on Base Sepolia network
- Check that your wallet supports the network
- Try refreshing the page

### Environment Variables Summary

Your `.env.local` file should contain:

```env
NEXT_PUBLIC_TELEVISION_ADDRESS=0x7136763c7951F923b1861774CF9ef12095cb21DD
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_APP_DOMAIN=localhost:3000
NEXT_PUBLIC_APP_NAME=TakeoverTV
```

### Next Steps

1. ✅ Environment configured (.env.local created)
2. ⏳ Convert SVG images to PNG (see `public/CONVERT-TO-PNG.md`)
3. ⏳ Run `npm run dev`
4. ⏳ Get test USDC tokens
5. ⏳ Test first takeover
6. ⏳ Test with ngrok + Farcaster preview
7. ⏳ Deploy to production when ready

---

**Your app is configured and ready to test on Base Sepolia! 🚀**

Run `npm run dev` to start testing.
