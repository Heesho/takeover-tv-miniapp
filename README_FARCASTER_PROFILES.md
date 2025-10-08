# Farcaster Profile Integration

## What This Does

Your Takeover TV Mini App now displays real Farcaster profiles for broadcasters instead of just showing truncated Ethereum addresses.

**Before:**
```
BROADCASTER
[Generated Avatar]
0x8491...0bf1
```

**After:**
```
BROADCASTER
[Real Profile Picture]
Jesse Pollak
@jessepollak
```

## Quick Setup (2 steps)

### 1. Get API Key

1. Visit [https://dev.neynar.com/](https://dev.neynar.com/)
2. Sign up (free)
3. Get your API key from dashboard

### 2. Configure

Create `.env.local` in project root:

```bash
NEYNAR_API_KEY=your_api_key_here
```

That's it! Run `npm run dev` and profiles will show automatically.

## How to Use

### In Components

The `ChannelInfo` component automatically fetches and displays profiles:

```typescript
import { ChannelInfo } from '@/components/ChannelInfo';

<ChannelInfo
  ownerAddress={slot0.owner}  // From smart contract
  currentPrice={currentPrice}
/>
```

### Reuse the Hook

Use `useFarcasterProfile` anywhere in your app:

```typescript
import { useFarcasterProfile } from '@/hooks/useFarcasterProfile';

function MyComponent({ address }: { address: string }) {
  const { profile, isLoading, error } = useFarcasterProfile(address);

  if (isLoading) return <Skeleton />;
  if (!profile) return <div>{address}</div>;

  return (
    <div>
      <img src={profile.pfpUrl} alt={profile.displayName} />
      <h2>{profile.displayName}</h2>
      <p>@{profile.username}</p>
    </div>
  );
}
```

## Testing

Test with known Farcaster users:

```bash
# Jesse Pollak (Coinbase)
npm run test:farcaster 0x849151d7D0bF1F34b70d5caD5149D28CC2308bf1

# Should output:
# ✅ Profile found!
# 👤 Display Name: Jesse Pollak
# 🏷️  Username: @jessepollak
```

## Features

- **Automatic fallback:** Shows address if no profile exists
- **Loading states:** Skeleton loader during fetch
- **Error handling:** Graceful degradation on failures
- **Caching:** 5-minute server-side cache
- **Secure:** API key never exposed to client
- **Free tier:** 100 requests/day (enough for most apps)

## Architecture

```
ChannelInfo Component
        ↓
useFarcasterProfile Hook (client)
        ↓
/api/farcaster/user (server)
        ↓
Neynar API
        ↓
Returns Profile Data
```

## Files

**New Files:**
- `app/api/farcaster/user/route.ts` - API endpoint
- `hooks/useFarcasterProfile.ts` - React hook
- `scripts/test-farcaster-api.mjs` - Testing utility

**Modified Files:**
- `components/ChannelInfo.tsx` - Shows profiles
- `package.json` - Added test script

## Troubleshooting

### Profile not showing

1. Check if address has Farcaster account:
   ```bash
   npm run test:farcaster <address>
   ```

2. Verify API key configured:
   ```bash
   cat .env.local
   ```

3. Restart dev server:
   ```bash
   npm run dev
   ```

### Common Issues

**"NEYNAR_API_KEY is not configured"**
- Create `.env.local` in project root
- Add: `NEYNAR_API_KEY=your_key`
- Restart server

**Rate limit exceeded**
- Free tier: 100 requests/day
- Solution: Increase cache time or upgrade plan

**Build error**
- Run: `npm run build`
- Check for TypeScript errors
- All tests passing ✅

## Documentation

- **Quick Start:** `QUICKSTART_FARCASTER.md` - 5-minute setup guide
- **Full Guide:** `FARCASTER_PROFILE_SETUP.md` - Complete documentation
- **Implementation Details:** `IMPLEMENTATION_SUMMARY.md` - Architecture deep dive

## Production Deployment

### Vercel
```
Settings > Environment Variables
Add: NEYNAR_API_KEY = your_key
```

### Railway
```
Variables tab
Add: NEYNAR_API_KEY = your_key
```

## API Limits

**Free Tier:**
- 100 requests/day
- With caching: ~288 unique addresses/day

**Paid Tiers:**
- Growth: $49/month - 10,000 requests/day
- Pro: $299/month - 100,000 requests/day

## Support

- [Neynar Docs](https://docs.neynar.com/)
- [Farcaster Mini Apps](https://miniapps.farcaster.xyz/)
- Reach out: @pirosb3, @linda, @deodad on Farcaster

---

**Status:** ✅ Production Ready

All features implemented, tested, and documented.
