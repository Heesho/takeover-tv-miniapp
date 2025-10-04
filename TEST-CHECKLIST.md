# TakeoverTV Testing Checklist

## 🎯 Pre-Testing Setup

- [x] Contracts deployed to Base Sepolia
  - Television: `0x7136763c7951F923b1861774CF9ef12095cb21DD`
  - USDC: `0x6c268B147FeB6d50a165F2357cE2eC57EF17d5B7`
- [x] `.env.local` configured with correct addresses
- [ ] SVG images converted to PNG
- [ ] Dependencies installed (`npm install`)

## 🚀 Local Testing

### Step 1: Start the App
```bash
npm run dev
```
Expected: Server starts at http://localhost:3000

- [ ] App loads without errors
- [ ] No console errors in browser
- [ ] UI displays correctly on mobile viewport

### Step 2: Wallet Connection

- [ ] "Connect Wallet" button appears
- [ ] Click to connect wallet
- [ ] Wallet prompts to switch to Base Sepolia (84532)
- [ ] "Connected" indicator appears with green dot

### Step 3: Check Contract Data Loading

Open browser console and look for:
- [ ] "Farcaster context:" log with user info
- [ ] Current owner address displayed
- [ ] Current price displayed (should show USDC amount)
- [ ] Video player shows STANDBY or current video

### Step 4: Get Test Tokens

**Option A - Check for faucet/mint function:**
1. Go to https://sepolia.basescan.org/address/0x6c268B147FeB6d50a165F2357cE2eC57EF17d5B7#writeContract
2. Look for `mint()` or `faucet()` function
3. Call it to get test USDC

**Option B - Contact deployer:**
- Ask for test USDC tokens
- Need at least 2-3 USDC for testing

**Check balance:**
```
# Add USDC to MetaMask:
Token Address: 0x6c268B147FeB6d50a165F2357cE2eC57EF17d5B7
Token Symbol: USDC
Decimals: 6
```

- [ ] Have Sepolia ETH for gas (get from faucet)
- [ ] Have test USDC tokens (at least 2 USDC)

## 🧪 Functional Testing

### Test 1: First Takeover (Initial State)

1. **Prepare:**
   - [ ] Wallet connected and on Base Sepolia
   - [ ] Have USDC and ETH

2. **Execute:**
   - [ ] Click "Takeover for $X.XX USDC" button
   - [ ] Form slides up
   - [ ] Paste YouTube URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - [ ] Green checkmark appears ✓
   - [ ] Click "Confirm" button

3. **Transaction 1 - Approve:**
   - [ ] MetaMask pops up for USDC approval
   - [ ] Confirm approval transaction
   - [ ] "Approving USDC..." message shows
   - [ ] Approval transaction confirms

4. **Transaction 2 - Takeover:**
   - [ ] MetaMask pops up for takeover
   - [ ] Confirm takeover transaction
   - [ ] "Processing takeover..." message shows
   - [ ] Transaction confirms

5. **Success:**
   - [ ] ✓ Success message appears
   - [ ] Haptic feedback (if on mobile)
   - [ ] "Share on Farcaster" button appears
   - [ ] Form closes after 3 seconds
   - [ ] TV static effect plays (1-2 seconds)
   - [ ] Your video loads and plays
   - [ ] Channel info shows your address
   - [ ] New price is displayed (2x what you paid)

### Test 2: Batch Transaction (If Supported)

1. **Clear approval:**
   - Go to https://sepolia.basescan.org/address/0x6c268B147FeB6d50a165F2357cE2eC57EF17d5B7#writeContract
   - Call `approve(0x7136763c7951F923b1861774CF9ef12095cb21DD, 0)` to reset

2. **Try takeover:**
   - [ ] Submit new YouTube URL
   - [ ] Check console for "wallet_sendCalls" message
   - [ ] If supported: Single transaction for approve + takeover
   - [ ] If not supported: Falls back to two transactions (expected)

### Test 3: Price Decay

1. **Observe real-time updates:**
   - [ ] Watch the price in the button
   - [ ] It should decrease every 5 seconds
   - [ ] Price decays linearly

2. **Calculate decay rate:**
   ```
   Starting Price: (what you paid) * 2
   Ending Price: 0
   Time Period: 24 hours

   Decay per second = Starting Price / 86400
   Decay per 5 seconds = (Starting Price / 86400) * 5
   ```
   - [ ] Price decrease matches calculation

### Test 4: Second Takeover

1. **Wait for price to decay** (or use different wallet)
2. **Execute takeover with different video**
3. **Verify:**
   - [ ] Transaction succeeds
   - [ ] Previous owner receives 90% of payment
   - [ ] Treasury receives 10% (if treasury is set)
   - [ ] New video loads after static transition
   - [ ] EpochId incremented
   - [ ] New price is 2x settlement price

### Test 5: Edge Cases

**Invalid YouTube URL:**
- [ ] Enter: `https://example.com`
- [ ] Red X appears
- [ ] "Please enter a valid YouTube URL" error
- [ ] Confirm button disabled

**Private/Unavailable Video:**
- [ ] Enter URL of private video
- [ ] Submit takeover
- [ ] After success, player shows "STANDBY" or error
- [ ] App doesn't crash

**Price Increased (Race Condition):**
- [ ] Open app in two browsers with same wallet
- [ ] Start takeover in browser 1
- [ ] Complete takeover in browser 2 first
- [ ] Browser 1 transaction fails with "EpochIdMismatch"
- [ ] Error handled gracefully

**Zero Price (After 24 Hours):**
- [ ] Wait 24 hours after last takeover
- [ ] Price shows $0.00
- [ ] Takeover is free (only gas fees)
- [ ] Transaction succeeds

## 📱 Farcaster Integration Testing

### Setup with ngrok

```bash
# Terminal 1
ngrok http 3000

# Terminal 2 - Update .env.local
NEXT_PUBLIC_APP_DOMAIN=abc123.ngrok.io

# Restart
npm run dev
```

### Test in Preview Tool

1. **Open preview:**
   - [ ] Go to https://farcaster.xyz/~/developers/mini-apps/preview
   - [ ] Enter ngrok URL
   - [ ] App loads in preview frame

2. **Test SDK features:**
   - [ ] Splash screen disappears (ready() works)
   - [ ] Wallet auto-connects
   - [ ] Context logs show user info

3. **Test takeover flow:**
   - [ ] Complete full takeover
   - [ ] Click "Share on Farcaster" button
   - [ ] Compose cast dialog opens
   - [ ] Cast includes app embed

### Test Manifest

- [ ] Visit: `https://your-ngrok-url.ngrok.io/.well-known/farcaster.json`
- [ ] Manifest loads as JSON
- [ ] All fields present
- [ ] Images URLs correct (but may 404 if not converted to PNG)

## 🎨 UI/UX Testing

### Mobile Viewport
- [ ] Switch to mobile view (390x844)
- [ ] All text readable
- [ ] Buttons easily tappable
- [ ] No horizontal scroll
- [ ] Video player fits correctly

### Desktop Viewport
- [ ] App looks good on desktop
- [ ] Centered content
- [ ] Reasonable max-width

### Loading States
- [ ] Spinner shows while fetching data
- [ ] Loading states for transactions
- [ ] Skeleton screens (if any)

### Error States
- [ ] Network errors handled
- [ ] Transaction errors shown
- [ ] Validation errors clear

## 🔍 Contract Verification

### On BaseScan

1. **Read current state:**
   - [ ] Go to contract Read tab
   - [ ] Call `getSlot0()`
   - [ ] Verify owner, uri, epochId match UI

2. **Check price:**
   - [ ] Call `getPrice()`
   - [ ] Compare with UI display
   - [ ] Should match (accounting for time delay)

3. **View events:**
   - [ ] Go to Events tab
   - [ ] See `Television__Takeover` events
   - [ ] Verify from, channelOwner, paymentAmount

4. **Check USDC balance:**
   - [ ] View previous owner's USDC balance
   - [ ] Should increase by 90% of payment
   - [ ] View treasury balance (if set)
   - [ ] Should increase by 10% of payment

## ✅ Success Criteria

**Core Functionality:**
- [x] Contract deployed correctly
- [ ] App connects to wallet
- [ ] App reads contract state
- [ ] Price updates in real-time
- [ ] YouTube URL validation works
- [ ] Approve transaction succeeds
- [ ] Takeover transaction succeeds
- [ ] Video changes after takeover
- [ ] Events trigger UI updates

**Farcaster Integration:**
- [ ] SDK initializes (ready() called)
- [ ] Wallet auto-connects in Farcaster
- [ ] Share feature works
- [ ] Manifest is accessible
- [ ] No infinite splash screen

**User Experience:**
- [ ] Clear transaction feedback
- [ ] Error messages helpful
- [ ] Mobile-friendly
- [ ] Smooth transitions
- [ ] No crashes or freezes

## 🐛 Known Issues to Watch For

- [ ] Images not loading (SVG vs PNG)
- [ ] Wallet connection issues on testnet
- [ ] Gas estimation failures
- [ ] USDC approval timing
- [ ] Price polling performance
- [ ] Video embed restrictions

## 📊 Test Results

| Test | Status | Notes |
|------|--------|-------|
| Local dev start | ⏳ | |
| Wallet connection | ⏳ | |
| Contract read | ⏳ | |
| Price display | ⏳ | |
| First takeover | ⏳ | |
| Video transition | ⏳ | |
| Share button | ⏳ | |
| Price decay | ⏳ | |
| Second takeover | ⏳ | |
| Farcaster preview | ⏳ | |
| Manifest load | ⏳ | |

---

**Start testing by running:** `npm run dev`

Then work through each section, checking off items as you go!
