# TakeoverTV Setup Checklist

Use this checklist to ensure your TakeoverTV Mini App is properly configured.

## ✅ Pre-Development

- [ ] Node.js 22.11.0+ installed (`node --version`)
- [ ] Farcaster account created
- [ ] Developer mode enabled on Farcaster
- [ ] Television smart contract deployed on Base/Base Sepolia
- [ ] Contract address obtained
- [ ] Domain name selected (can be localhost:3000 for dev)

## ✅ Environment Configuration

- [ ] `.env.local` file created from `.env.local.example`
- [ ] `NEXT_PUBLIC_TELEVISION_ADDRESS` set to your contract
- [ ] `NEXT_PUBLIC_CHAIN_ID` set (8453 for Base, 84532 for Base Sepolia)
- [ ] `NEXT_PUBLIC_RPC_URL` configured
- [ ] `NEXT_PUBLIC_APP_DOMAIN` set correctly
- [ ] `NEXT_PUBLIC_APP_NAME` set to "TakeoverTV"

## ✅ Dependencies

- [ ] Run `npm install` successfully
- [ ] No critical errors in npm audit
- [ ] All required packages installed:
  - [ ] @farcaster/miniapp-sdk
  - [ ] @farcaster/miniapp-wagmi-connector
  - [ ] wagmi
  - [ ] viem
  - [ ] @tanstack/react-query
  - [ ] next
  - [ ] react
  - [ ] tailwindcss

## ✅ Smart Contract Verification

- [ ] Contract deployed and verified on block explorer
- [ ] `getSlot0()` function callable
- [ ] `getPrice()` function returns a value
- [ ] `quoteToken()` returns correct token address
- [ ] Takeover events are being emitted
- [ ] Contract has an active price (someone has taken over)

## ✅ Local Development

- [ ] `npm run dev` starts without errors
- [ ] App opens at `http://localhost:3000`
- [ ] Page loads with black background
- [ ] TakeoverTV header visible
- [ ] Video player area displays (may show STANDBY)
- [ ] Channel info section shows
- [ ] Takeover button appears
- [ ] No console errors in browser dev tools

## ✅ Farcaster Integration

- [ ] SDK initializes (`sdk.actions.ready()` called)
- [ ] Splash screen functionality tested
- [ ] Wallet connector configured
- [ ] Auto-connect works in Farcaster client
- [ ] Meta tags present in page source (`fc:miniapp`)

## ✅ Components

- [ ] VideoPlayer renders correctly
- [ ] Static transition effect works
- [ ] STANDBY mode displays when no URI
- [ ] YouTube videos load when URI is valid
- [ ] ChannelInfo displays owner address
- [ ] ChannelInfo shows current price
- [ ] Price updates every 5 seconds
- [ ] TakeoverForm opens when button clicked
- [ ] YouTube URL validation works (green check / red X)
- [ ] Form shows approve/takeover steps

## ✅ Wallet & Transactions

- [ ] Wallet connects in Farcaster client
- [ ] Connected state shows green indicator
- [ ] Address is accessible via `useAccount()`
- [ ] Quote token (USDC) address retrieved
- [ ] Allowance check works
- [ ] Approve transaction can be sent
- [ ] Takeover transaction can be sent
- [ ] Transaction receipts are received
- [ ] Success state displays after completion

## ✅ Real-Time Updates

- [ ] Price decays every 5 seconds
- [ ] Takeover events are detected
- [ ] Channel info updates after takeover
- [ ] Video switches with static transition
- [ ] No memory leaks from polling

## ✅ Images & Assets

- [ ] `public/logo.png` created (200x200px)
- [ ] `public/og-image.png` created (1200x630px, 3:2 ratio)
- [ ] `public/screenshot1.png` created
- [ ] Images are optimized (<1MB each)
- [ ] Images display correctly when linked

## ✅ Manifest

- [ ] Manifest accessible at `/api/manifest`
- [ ] Manifest returns valid JSON
- [ ] All required fields present:
  - [ ] version
  - [ ] name
  - [ ] iconUrl
  - [ ] homeUrl
  - [ ] imageUrl
  - [ ] buttonTitle
  - [ ] splashImageUrl
  - [ ] splashBackgroundColor
  - [ ] subtitle
  - [ ] description
  - [ ] tags
  - [ ] primaryCategory
- [ ] accountAssociation signed (for production)

## ✅ Mobile Responsiveness

- [ ] Layout looks good on mobile (375px width)
- [ ] Video player is 16:9 aspect ratio
- [ ] Buttons are easily tappable (min 44px)
- [ ] Text is readable
- [ ] No horizontal scrolling
- [ ] Safe area insets considered (for notches)

## ✅ Testing in Farcaster

- [ ] App previewed using ngrok/tunnel
- [ ] Preview tool shows app correctly
- [ ] Wallet connects in mobile client
- [ ] Transactions work on mobile
- [ ] Video plays in mobile client
- [ ] Static transition works on mobile
- [ ] No performance issues

## ✅ Error Handling

- [ ] Invalid YouTube URLs show error message
- [ ] Failed transactions show error state
- [ ] Network errors are caught
- [ ] Loading states display during async operations
- [ ] User is never stuck in loading state

## ✅ Performance

- [ ] Initial load < 3 seconds
- [ ] `sdk.actions.ready()` called promptly
- [ ] No excessive re-renders
- [ ] Price polling doesn't cause UI lag
- [ ] Video transitions are smooth
- [ ] Lighthouse score > 80

## ✅ Pre-Deployment

- [ ] All environment variables set for production
- [ ] Images uploaded and accessible
- [ ] Contract tested on mainnet (or testnet)
- [ ] At least one test takeover completed
- [ ] Code pushed to GitHub
- [ ] README.md updated with your details

## ✅ Deployment

- [ ] App deployed to Vercel
- [ ] Production environment variables set
- [ ] Build completed successfully
- [ ] Production URL accessible
- [ ] Manifest accessible at `https://yourdomain.com/.well-known/farcaster.json`
- [ ] Images load from production URL

## ✅ Farcaster Publishing

- [ ] Manifest signed using Farcaster tool
- [ ] Signed values added to manifest route
- [ ] Manifest verified in Farcaster
- [ ] App tested with preview tool (production URL)
- [ ] App shared in a test cast
- [ ] Embed displays correctly in feed
- [ ] App launches from feed

## ✅ Post-Launch

- [ ] App appears in Farcaster search (may take 24h)
- [ ] Users can add app to their collection
- [ ] Takeover events monitored
- [ ] Analytics tracking (optional)
- [ ] Error monitoring set up (optional)
- [ ] Community feedback collected

## 🐛 Common Issues & Fixes

### Issue: "Cannot connect to wallet"
**Fix**: Ensure you're testing in Farcaster client, not regular browser

### Issue: "Invalid manifest"
**Fix**: Verify domain in manifest matches hosting domain exactly

### Issue: "Video won't play"
**Fix**: Check YouTube URL is public and embeddable, test manually

### Issue: "Price not updating"
**Fix**: Check RPC URL is correct and not rate-limited

### Issue: "Transaction fails"
**Fix**: Verify contract address, check user has USDC, ensure gas settings

### Issue: "Static transition doesn't show"
**Fix**: Check that URI change is being detected, verify CSS is loaded

### Issue: "App not in search"
**Fix**: Generate usage, wait 24h, ensure manifest is complete and signed

## 📝 Notes

Write notes here as you complete the checklist:

```
Date started: _______
Date completed: _______

Contract address: _______
Chain: _______
Domain: _______

Issues encountered:
1.
2.
3.

Solutions:
1.
2.
3.
```

## ✅ Ready to Launch?

If you've checked all the boxes above, you're ready to launch TakeoverTV! 🚀

Share your launch cast in /farcaster-dev and engage with the community!
