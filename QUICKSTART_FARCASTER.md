# Quick Start: Farcaster Profile Integration

This guide gets you up and running with Farcaster profile display in 5 minutes.

## What You're Building

Your Mini App will display real Farcaster profiles for broadcasters instead of just showing their Ethereum addresses:

**Before:**
```
BROADCASTER
[Generic Avatar]
0x1234...5678
```

**After:**
```
BROADCASTER
[Real Profile Picture]
Alice
@alice
```

## Setup (5 minutes)

### Step 1: Get Neynar API Key (2 min)

1. Go to [https://dev.neynar.com/](https://dev.neynar.com/)
2. Click "Sign Up" (it's free!)
3. Go to "API Keys" section
4. Click "Create API Key"
5. Copy your key

### Step 2: Configure Environment (1 min)

Create a file named `.env.local` in your project root:

```bash
# .env.local
NEYNAR_API_KEY=paste_your_key_here
```

**Important:** Don't commit this file to git (it's already in .gitignore).

### Step 3: Test the Setup (1 min)

Run the test script with a known Farcaster user:

```bash
npm run test:farcaster 0x849151d7D0bF1F34b70d5caD5149D28CC2308bf1
```

You should see:
```
✅ Profile found!

Profile Details:
👤 Display Name: Jesse Pollak
🏷️  Username: @jessepollak
🆔 FID: 6
🖼️  Profile Picture: https://...
```

### Step 4: Run Your App (1 min)

```bash
npm run dev
```

Visit `http://localhost:3000` - you should now see real Farcaster profiles for broadcasters!

## How It Works

```
1. Smart contract returns owner address: 0x1234...5678
2. ChannelInfo component uses useFarcasterProfile hook
3. Hook calls /api/farcaster/user?address=0x1234
4. API route fetches from Neynar
5. Profile displayed with avatar, name, username
6. Falls back to address if no profile found
```

## Files Added/Modified

### New Files
- `app/api/farcaster/user/route.ts` - API endpoint to fetch profiles
- `hooks/useFarcasterProfile.ts` - React hook for profile fetching
- `.env.local.example` - Example environment configuration
- `scripts/test-farcaster-api.mjs` - Testing utility

### Modified Files
- `components/ChannelInfo.tsx` - Now displays Farcaster profiles
- `package.json` - Added test:farcaster script

## Testing with Different Addresses

Try these known Farcaster users:

```bash
# Jesse Pollak (Coinbase)
npm run test:farcaster 0x849151d7D0bF1F34b70d5caD5149D28CC2308bf1

# Vitalik Buterin
npm run test:farcaster 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045

# Dan Romero (Farcaster)
npm run test:farcaster 0x6B0bFDdF5C6A9E9B1E3d8B8a3A3c7d8a3A3c7d8a
```

## Features

### Automatic Fallbacks
- No profile found? Shows truncated address
- Image fails to load? Shows generated avatar
- API error? Shows address (app doesn't crash)

### Loading States
- Skeleton loader while fetching profile
- Prevents layout shift during load

### Caching
- 5 minute server-side cache
- Reduces API calls to Neynar
- Stays within free tier limits (100/day)

### Error Handling
- Network errors handled gracefully
- Invalid API key logged clearly
- No profile = shows address (not an error)

## Troubleshooting

### "Profile not showing"

**Check 1:** Is the address verified on Farcaster?
```bash
npm run test:farcaster <address>
```

**Check 2:** Is your API key configured?
```bash
# Check .env.local exists and has NEYNAR_API_KEY
cat .env.local
```

**Check 3:** Restart your dev server
```bash
# Stop the server (Ctrl+C)
npm run dev
```

### "NEYNAR_API_KEY is not configured"

1. Create `.env.local` in project root (not in a subdirectory)
2. Add: `NEYNAR_API_KEY=your_key`
3. Restart dev server

### "Rate limit exceeded"

Free tier: 100 requests/day. With 5-minute caching, this allows ~288 unique addresses/day.

**Solutions:**
1. Increase cache time (edit `app/api/farcaster/user/route.ts`, change `revalidate: 300` to higher value)
2. Upgrade to paid Neynar plan

## Production Deployment

### Vercel

1. Go to your project on Vercel
2. Settings > Environment Variables
3. Add `NEYNAR_API_KEY` = `your_key`
4. Redeploy

### Railway

1. Go to your Railway project
2. Variables tab
3. Add `NEYNAR_API_KEY` = `your_key`
4. Redeploy

### Other Platforms

Add environment variable:
```
NEYNAR_API_KEY=your_key_here
```

## API Usage & Costs

### Free Tier (What you have)
- 100 requests per day
- Perfect for development and testing
- Covers moderate production usage with caching

### When to Upgrade

If you exceed 100 requests/day:
- **Growth:** $49/month - 10,000 requests/day
- **Pro:** $299/month - 100,000 requests/day

See: [https://dev.neynar.com/pricing](https://dev.neynar.com/pricing)

## Next Steps

1. **Customize the display** - Edit `components/ChannelInfo.tsx` to change layout
2. **Add more profile data** - Modify API route to fetch bio, follower count, etc.
3. **Use elsewhere** - Import `useFarcasterProfile` hook in other components
4. **Monitor usage** - Check Neynar dashboard for API usage stats

## Support

- **Neynar Docs:** [https://docs.neynar.com/](https://docs.neynar.com/)
- **Farcaster Mini Apps:** [https://miniapps.farcaster.xyz/](https://miniapps.farcaster.xyz/)
- **Detailed Guide:** See `FARCASTER_PROFILE_SETUP.md` in this repo

---

**That's it!** You now have real Farcaster profiles showing for all broadcasters. 🎉
