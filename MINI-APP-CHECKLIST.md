# TakeoverTV Mini App Launch Checklist

## Pre-Deployment

### Environment Setup
- [ ] Node.js 22.11.0+ installed ✅ (v22.14.0)
- [ ] All dependencies installed ✅
- [ ] Environment variables configured
  - [ ] `NEXT_PUBLIC_TELEVISION_ADDRESS`
  - [ ] `NEXT_PUBLIC_CHAIN_ID`
  - [ ] `NEXT_PUBLIC_RPC_URL`
  - [ ] `NEXT_PUBLIC_APP_DOMAIN` (set to production domain)
  - [ ] `NEXT_PUBLIC_APP_NAME`

### Images
- [ ] Create `public/logo.png` (200x200px, app icon)
- [ ] Create `public/og-image.png` (1200x630px, 3:2 ratio)
- [ ] Create `public/screenshot1.png` (app screenshot)
- [ ] Verify images are PNG format (not SVG)
- [ ] Test images are publicly accessible
- [ ] Confirm proper Content-Type headers

## Deployment

### Initial Deploy
- [ ] Deploy to production hosting (Vercel/Netlify/etc.)
- [ ] Verify app loads at production domain
- [ ] Confirm `/.well-known/farcaster.json` returns manifest
- [ ] Test wallet connection works
- [ ] Verify contract interactions work
- [ ] Check price updates are polling

### Manifest Signing
- [ ] Go to https://farcaster.xyz/~/developers
- [ ] Enable "Developer Mode" in settings
- [ ] Click "Register Mini App"
- [ ] Enter production domain
- [ ] Sign the account association
- [ ] Copy signed `accountAssociation` values
- [ ] Update `app/api/manifest/route.ts` with signed values
- [ ] Redeploy with signed manifest
- [ ] Verify signature at `/.well-known/farcaster.json`

## Testing

### Core Functionality
- [ ] App loads without infinite splash screen
- [ ] `sdk.actions.ready()` is called
- [ ] Wallet auto-connects
- [ ] Current channel displays correctly
- [ ] Price updates every 5 seconds
- [ ] YouTube URL validation works
- [ ] Approve + takeover flow completes
- [ ] Batch transactions work (or fallback to sequential)
- [ ] TV static transition plays on takeover
- [ ] New video loads after successful takeover

### SDK Features
- [ ] `sdk.context.user` returns Farcaster user data
- [ ] `sdk.context.client` returns platform type
- [ ] `sdk.context.features` shows available features
- [ ] Embed meta tag renders correctly
- [ ] Manifest is valid and accessible

### Cross-Client Testing
- [ ] Test on Warpcast mobile (iOS)
- [ ] Test on Warpcast mobile (Android)
- [ ] Test on Warpcast web
- [ ] Test share functionality (composeCast)
- [ ] Test "Add to Home" button

## Post-Launch

### Monitoring
- [ ] Check console for errors
- [ ] Monitor transaction success rate
- [ ] Track wallet connection issues
- [ ] Watch for manifest validation errors

### Discoverability
- [ ] Share app in Farcaster cast
- [ ] Test embed preview looks good
- [ ] Verify app appears in Farcaster app store
- [ ] Check images display correctly in listings

### Optional Enhancements
- [ ] Add share button after successful takeover
- [ ] Show user's Farcaster name in UI
- [ ] Implement haptic feedback
- [ ] Add back navigation handling
- [ ] Set up notification webhook

## Troubleshooting

If you encounter issues:

### Infinite Splash Screen
- Check: Is `sdk.actions.ready()` being called?
- Location: `app/page.tsx`, line 37

### Manifest Errors
- Check: Is manifest at `/.well-known/farcaster.json`?
- Verify: `next.config.ts` has rewrite (not redirect)

### Image Loading Failures
- Verify: PNG format (not SVG)
- Check: 3:2 aspect ratio for og-image
- Test: Images return correct Content-Type headers

### Wallet Connection Issues
- Confirm: Using `farcasterMiniApp()` connector
- Check: Wagmi config is correct
- Verify: Chain ID matches deployment network

### Transaction Failures
- Check: User has sufficient USDC balance
- Verify: Television contract address is correct
- Confirm: Network is correct (Base/Base Sepolia)

### Batch Transactions Not Working
- Normal: Not all wallets support EIP-5792
- Solution: App automatically falls back to sequential
- No action needed: This is expected behavior

## Critical Files to Review

1. **`app/api/manifest/route.ts`** - Update accountAssociation after signing
2. **`next.config.ts`** - Verify rewrite is configured
3. **`app/layout.tsx`** - Check embed meta tag
4. **`.env.local`** - Ensure production domain is set
5. **`public/`** - Confirm all images are present

## Support Resources

- [Farcaster Mini Apps Docs](https://docs.farcaster.xyz/developers/guides/apps/mini-apps)
- [Developer Tools](https://farcaster.xyz/~/developers)
- [SDK Documentation](https://github.com/farcasterxyz/miniapp-sdk)
- [Full Integration Guide](./FARCASTER-INTEGRATION.md)
- [Architecture Overview](./ARCHITECTURE.md)

---

**Last Updated:** Based on current implementation
**Status:** Ready for deployment after manifest signing
