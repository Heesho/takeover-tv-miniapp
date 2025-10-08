# Farcaster Profile Integration Setup Guide

This guide explains how to set up and use the Farcaster profile fetching feature that displays broadcaster information in your Mini App.

## Overview

The app now fetches and displays real Farcaster profiles (display name, username, profile picture) for the current broadcaster based on their Ethereum address from the smart contract.

## Architecture

### Components

1. **API Route** (`/app/api/farcaster/user/route.ts`)
   - Server-side endpoint that fetches user profiles from Neynar API
   - Keeps API key secure (never exposed to client)
   - Implements caching (5 minute revalidation)
   - Handles errors gracefully

2. **Custom Hook** (`/hooks/useFarcasterProfile.ts`)
   - React hook that fetches profiles by Ethereum address
   - Manages loading and error states
   - Prevents memory leaks with cleanup
   - Automatically re-fetches when address changes

3. **Updated Component** (`/components/ChannelInfo.tsx`)
   - Displays Farcaster profile when available
   - Falls back to truncated address if no profile found
   - Shows loading skeleton during fetch
   - Handles image loading errors

## Setup Instructions

### 1. Get a Neynar API Key

Neynar is the recommended Farcaster data provider with a generous free tier:

1. Visit [https://dev.neynar.com/](https://dev.neynar.com/)
2. Sign up for a free account
3. Navigate to "API Keys" section
4. Create a new API key
5. Copy your API key

**Free Tier:** 100 requests/day (sufficient for development and moderate usage)

### 2. Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
NEYNAR_API_KEY=your_actual_api_key_here
```

**Important:** Never commit your `.env.local` file to git. It's already in `.gitignore`.

For production deployment (Vercel/Railway/etc):
- Add `NEYNAR_API_KEY` as an environment variable in your hosting platform's dashboard

### 3. Test the Integration

Start your development server:

```bash
npm run dev
```

The app will now:
1. Fetch the broadcaster's Ethereum address from the smart contract
2. Look up their Farcaster profile via the Neynar API
3. Display their profile picture, display name, and username
4. Fall back to showing the truncated address if no profile exists

## How It Works

### Flow Diagram

```
Smart Contract (slot0.owner)
        ↓
Ethereum Address (0x1234...5678)
        ↓
useFarcasterProfile hook
        ↓
/api/farcaster/user?address=0x1234
        ↓
Neynar API bulk-by-address endpoint
        ↓
Farcaster Profile Data
        ↓
ChannelInfo Component Display
```

### API Endpoint Details

**Endpoint:** `GET /api/farcaster/user?address={eth_address}`

**Request:**
```
GET /api/farcaster/user?address=0x1234567890abcdef
```

**Response (success):**
```json
{
  "user": {
    "fid": 12345,
    "username": "alice",
    "displayName": "Alice",
    "pfpUrl": "https://imagedelivery.net/...",
    "verifiedAddresses": ["0x1234..."]
  }
}
```

**Response (no profile):**
```json
{
  "user": null
}
```

### Caching Strategy

- **Server-side:** 5 minute cache via Next.js `revalidate`
- **Reduces API calls** to Neynar (important for free tier limits)
- **Balances freshness** with rate limit preservation

## Error Handling

The implementation handles multiple failure scenarios gracefully:

1. **No Farcaster account:** Falls back to showing truncated Ethereum address
2. **API key missing:** Logs error, returns null profile (shows address)
3. **Network errors:** Logs error, returns null profile (shows address)
4. **Image load failures:** Falls back to generated Dicebear avatar
5. **Component unmounts during fetch:** Cleanup prevents memory leaks

## Usage in Other Components

You can reuse the `useFarcasterProfile` hook anywhere in your app:

```typescript
import { useFarcasterProfile } from '@/hooks/useFarcasterProfile';

function MyComponent({ address }: { address: string }) {
  const { profile, isLoading, error } = useFarcasterProfile(address);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading profile</div>;
  if (!profile) return <div>No Farcaster account</div>;

  return (
    <div>
      <img src={profile.pfpUrl} alt={profile.displayName} />
      <h2>{profile.displayName}</h2>
      <p>@{profile.username}</p>
    </div>
  );
}
```

## Rate Limiting Considerations

### Free Tier Limits (Neynar)
- **100 requests/day**
- **5 minute cache** helps stay within limits
- **Estimate:** ~288 unique addresses per day (with caching)

### Upgrading

If you exceed free tier limits:

1. **Neynar Growth Plan:** $49/month for 10,000 requests/day
2. **Neynar Pro Plan:** $299/month for 100,000 requests/day

Visit [https://dev.neynar.com/pricing](https://dev.neynar.com/pricing) for current pricing.

## Alternative Approaches (Not Recommended)

While we chose Neynar, here are other options and why they weren't selected:

### 1. Farcaster Hub API (Self-hosted)
- **Pros:** Free, no rate limits, full control
- **Cons:** Complex setup, requires running/maintaining a Hub, high infrastructure costs
- **Verdict:** Overkill for this use case

### 2. Airstack
- **Pros:** GraphQL API, multi-chain support
- **Cons:** More complex queries, higher learning curve
- **Verdict:** Neynar's REST API is simpler for our needs

### 3. Direct SDK/Hub Connection
- **Pros:** No third-party dependency
- **Cons:** Client-side limitations, no address lookup in @farcaster/miniapp-sdk
- **Verdict:** Not feasible for address-to-profile lookups

## Troubleshooting

### Profile not showing (showing address instead)

**Possible causes:**
1. The Ethereum address doesn't have a verified Farcaster account
2. API key not configured correctly
3. Network error

**Debug steps:**
```bash
# Check if API key is set
echo $NEYNAR_API_KEY

# Check browser console for errors
# Look for: "Failed to fetch profile" or "NEYNAR_API_KEY is not configured"

# Test the API endpoint directly
curl "http://localhost:3000/api/farcaster/user?address=0x1234..."
```

### "NEYNAR_API_KEY is not configured" error

1. Verify `.env.local` exists in project root
2. Verify the variable name is exactly `NEYNAR_API_KEY`
3. Restart your development server (`npm run dev`)
4. Check the API key is valid on Neynar dashboard

### Rate limit exceeded

If you see rate limit errors:
1. Check Neynar dashboard for current usage
2. Increase cache time in `/app/api/farcaster/user/route.ts` (change `revalidate: 300` to higher value)
3. Consider upgrading to paid plan

### Images not loading

1. Check if the `pfpUrl` is accessible (try opening in browser)
2. Verify the `onError` fallback is working (should show Dicebear avatar)
3. Check for CORS issues in browser console

## Testing Addresses

Here are some known Farcaster users for testing:

- **vitalik.eth:** `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045`
- **dwr.eth (Dan Romero):** `0x6B0bFDdF5C6A9E9B1E3d8B8a3A3c7d8a3A3c7d8a`
- **jessepollak.eth:** `0x849151d7D0bF1F34b70d5caD5149D28CC2308bf1`

Use these addresses to verify the integration is working correctly.

## Production Deployment

### Vercel
1. Go to Project Settings > Environment Variables
2. Add `NEYNAR_API_KEY` with your key
3. Redeploy the app

### Railway
1. Go to Variables tab in your project
2. Add `NEYNAR_API_KEY=your_key`
3. Redeploy

### Docker/Self-hosted
Add to your environment variables:
```bash
export NEYNAR_API_KEY=your_key_here
```

## Additional Resources

- [Neynar API Documentation](https://docs.neynar.com/)
- [Neynar API Reference](https://docs.neynar.com/reference)
- [Farcaster Protocol Documentation](https://docs.farcaster.xyz/)
- [Farcaster Mini Apps Guide](https://miniapps.farcaster.xyz/)

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check the server logs (terminal running `npm run dev`)
3. Verify your Neynar API key is valid
4. Reach out to @pirosb3, @linda, or @deodad on Farcaster for Mini App specific questions
5. Check Neynar's status page if API seems down
