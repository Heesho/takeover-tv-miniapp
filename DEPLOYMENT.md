# TakeoverTV Deployment Guide

This guide walks you through deploying TakeoverTV as a Farcaster Mini App.

## Prerequisites

✅ Deployed Television smart contract on Base (or Base Sepolia for testing)
✅ Contract address and chain ID
✅ Domain name for your app
✅ Farcaster account

## Step-by-Step Deployment

### 1. Deploy Smart Contract

First, ensure your Television.sol contract is deployed and you have:
- Contract address
- Quote token address (e.g., USDC)
- Chain ID (8453 for Base, 84532 for Base Sepolia)

### 2. Prepare Your Environment

Create a `.env.local` file:

```env
# Smart Contract Configuration
NEXT_PUBLIC_TELEVISION_ADDRESS=0xYourContractAddress
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org

# App Configuration
NEXT_PUBLIC_APP_DOMAIN=your-domain.com
NEXT_PUBLIC_APP_NAME=TakeoverTV
```

### 3. Create Required Images

Create these images in your `public/` directory:

#### logo.png (200x200px)
- Square icon for the app
- Used in splash screen
- PNG format recommended
- Black background with white/colored icon works well

#### og-image.png (1200x630px)
- Social sharing image
- Must be 3:2 aspect ratio
- Shows preview when sharing in feeds
- Should be visually striking

#### screenshot1.png
- Screenshot of your app in action
- Used in app store listings
- Mobile screen dimensions recommended
- Show the key features

### 4. Deploy to Vercel

1. **Connect GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial TakeoverTV deployment"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   Add all variables from `.env.local` in Vercel dashboard:
   - Settings → Environment Variables
   - Add each variable
   - Make sure to select all environments (Production, Preview, Development)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Note your production URL

### 5. Update Domain Configuration

After deployment:

1. **Update Environment Variables**
   ```env
   NEXT_PUBLIC_APP_DOMAIN=your-vercel-app.vercel.app
   ```
   Or use your custom domain if configured.

2. **Redeploy**
   Push the change to trigger a new deployment.

### 6. Sign Your Farcaster Manifest

This is **required** for your app to be discoverable and addable:

1. **Enable Developer Mode**
   - Visit: [https://farcaster.xyz/~/settings/developer-tools](https://farcaster.xyz/~/settings/developer-tools)
   - Toggle on "Developer Mode"

2. **Sign Your Manifest**
   - Visit: [https://farcaster.xyz/~/developers/mini-apps/manifest](https://farcaster.xyz/~/developers/mini-apps/manifest)
   - Enter your exact domain (e.g., `your-app.vercel.app`)
   - Fill in app details
   - Click "Sign Manifest"
   - Copy the generated `accountAssociation` object

3. **Update Manifest Route**
   Edit `app/api/manifest/route.ts`:
   ```typescript
   accountAssociation: {
     header: "YOUR_SIGNED_HEADER_HERE",
     payload: "YOUR_SIGNED_PAYLOAD_HERE",
     signature: "YOUR_SIGNED_SIGNATURE_HERE",
   },
   ```

4. **Verify Manifest**
   Visit: `https://your-domain.com/.well-known/farcaster.json`

   You should see valid JSON with your signed account association.

### 7. Test Your Mini App

1. **Use Preview Tool**
   - Visit: [https://farcaster.xyz/~/developers/mini-apps/preview](https://farcaster.xyz/~/developers/mini-apps/preview)
   - Enter your app URL
   - Test all functionality:
     - Video player loads correctly
     - Price updates in real-time
     - Wallet connects automatically
     - Takeover form works
     - Transactions complete successfully

2. **Test in Feed**
   - Create a cast with your app URL
   - Verify the embed displays correctly
   - Click the button to launch the app
   - Confirm it works end-to-end

### 8. Publish to App Store

1. **Refresh Manifest**
   - Visit the Farcaster developers page
   - Find your app
   - Click "Refresh Manifest"
   - Verify all metadata appears correctly

2. **Add Required Metadata**
   Ensure your manifest includes:
   - ✅ `name`
   - ✅ `iconUrl`
   - ✅ `homeUrl`
   - ✅ `description`
   - ✅ `subtitle`
   - ✅ `tags`
   - ✅ `primaryCategory`
   - ✅ `screenshotUrls`

3. **Wait for Indexing**
   - Your app should appear in search within 24 hours
   - Must meet minimum usage requirements
   - Recent activity required to stay indexed

### 9. Launch!

1. **Create a Launch Cast**
   ```
   📺 Introducing TakeoverTV!

   The first community-controlled TV channel on Farcaster.

   - Take control by paying a decaying price
   - Share any YouTube video
   - Compete for the spotlight

   [Your App URL]
   ```

2. **Share in Channels**
   - Post in relevant Farcaster channels
   - Engage with users who try it
   - Share interesting takeovers

3. **Monitor Usage**
   - Watch for takeover events
   - Track engagement
   - Gather user feedback

## Post-Launch Checklist

- [ ] Monitor transaction volume
- [ ] Check for errors in logs
- [ ] Verify images load correctly
- [ ] Test on different devices
- [ ] Ensure wallet connections work
- [ ] Monitor contract for takeovers
- [ ] Engage with early users
- [ ] Iterate based on feedback

## Troubleshooting

### Manifest Not Loading

**Problem**: `/.well-known/farcaster.json` returns 404

**Solution**:
- Verify Next.js redirect is working
- Check `next.config.ts` has redirect
- Try accessing `/api/manifest` directly
- Redeploy after changes

### Images Not Displaying

**Problem**: Logo or og-image not showing

**Solution**:
- Verify images are in `public/` directory
- Check file names match exactly
- Ensure images meet size requirements
- Clear cache and test again

### Wallet Not Connecting

**Problem**: "Connect Wallet" doesn't work

**Solution**:
- Verify Wagmi configuration
- Check chain ID matches contract
- Ensure RPC URL is correct
- Test in Farcaster client, not browser

### Transactions Failing

**Problem**: Takeover transactions revert

**Solution**:
- Check contract address is correct
- Verify user has enough USDC
- Ensure approval amount is sufficient
- Check gas settings
- Test with smaller amounts first

### App Not in Search

**Problem**: Can't find app in Farcaster search

**Solution**:
- Verify manifest is signed correctly
- Ensure all required fields present
- Check domain matches exactly
- Generate some usage (opens/adds)
- Wait up to 24 hours for indexing

## Custom Domain Setup (Optional)

If you want a custom domain instead of vercel.app:

1. **Add Domain in Vercel**
   - Settings → Domains
   - Add your custom domain
   - Configure DNS as instructed

2. **Update Environment Variables**
   ```env
   NEXT_PUBLIC_APP_DOMAIN=your-custom-domain.com
   ```

3. **Re-sign Manifest**
   - Use Farcaster manifest tool with new domain
   - Update `app/api/manifest/route.ts`
   - Redeploy

4. **Test Everything Again**
   - Verify manifest loads at new domain
   - Test preview with new URL
   - Update any hardcoded references

## Support

If you run into issues:

1. Check the [Farcaster Mini Apps Docs](https://miniapps.farcaster.xyz)
2. Review [Troubleshooting Guide](https://miniapps.farcaster.xyz/docs/guides/agents-checklist)
3. Join the [Devs: Mini Apps](https://farcaster.xyz/~/group/X2P7HNc4PHTriCssYHNcmQ) group
4. Post in /farcaster-dev channel

## Success Metrics

Track these metrics after launch:

- 📊 Number of takeovers
- 👥 Unique users
- 💰 Total volume transacted
- ⏱️ Average hold time
- 🔁 Repeat takeovers
- 📈 Daily active users
- 💬 Social mentions

## Next Steps

After successful deployment:

1. **Monitor Performance**
   - Set up analytics
   - Track errors
   - Monitor gas usage

2. **Gather Feedback**
   - Talk to users
   - Identify pain points
   - Collect feature requests

3. **Iterate**
   - Fix bugs quickly
   - Add requested features
   - Improve UX based on usage

4. **Grow Community**
   - Share interesting moments
   - Highlight active users
   - Create content around usage

Good luck with your launch! 🚀
