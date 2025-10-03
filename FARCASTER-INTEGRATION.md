# Farcaster Mini App Integration Guide for TakeoverTV

## Overview

This guide covers the complete Farcaster Mini App integration for TakeoverTV, including manifest setup, authentication, wallet integration, and advanced SDK features.

---

## 1. Manifest & Embed Configuration

### Current Setup

✅ **Manifest Endpoint**: `/api/manifest` served at `/.well-known/farcaster.json` (via rewrite in `next.config.ts`)
✅ **Embed Meta Tag**: Configured in `app/layout.tsx`

### Critical Requirements

#### Manifest Structure
Your manifest at `/.well-known/farcaster.json` MUST include:
- `accountAssociation` - **Required for verification** (currently placeholder)
- `miniapp` - App metadata and configuration

#### Account Association Setup

**Steps to Sign Your Manifest:**

1. **Deploy to Production Domain First**
   - Vercel, Netlify, or your hosting provider
   - Must be a real domain (not localhost, not ngrok)

2. **Visit Farcaster Developer Tools**
   - Go to: https://farcaster.xyz/~/developers
   - Enable "Developer Mode" in settings first

3. **Register Your Manifest**
   - Click "Register Mini App"
   - Enter your domain (e.g., `takeoverv.app`)
   - The tool will fetch your manifest from `https://yourdomain.com/.well-known/farcaster.json`
   - Sign the association with your Farcaster account

4. **Update Manifest with Signed Values**
   - Copy the `accountAssociation` object from the developer tool
   - Update `app/api/manifest/route.ts`:

```typescript
accountAssociation: {
  header: 'eip155:1:0x...',  // Your actual signed header
  payload: 'domain=...',      // Your actual payload
  signature: '0x...',         // Your actual signature
},
```

#### Image Requirements

All images must:
- Be **PNG format** (not SVG) for production
- Use **3:2 aspect ratio** for `imageUrl` and `heroImageUrl`
- Be **publicly accessible** (correct CORS headers)
- Return proper `Content-Type` headers

**Required Images:**
```
/logo.png - 200x200px (app icon, splash screen)
/og-image.png - 1200x630px (social sharing, 3:2 ratio)
/screenshot1.png - App screenshot for discovery
```

### Embed vs Manifest - When to Use What

| Feature | Embed Meta Tag | Manifest |
|---------|---------------|----------|
| **Purpose** | Make individual pages shareable | Identify entire Mini App |
| **Required** | Yes (for social sharing) | Yes (for app registration) |
| **Location** | Each shareable page | `/.well-known/farcaster.json` |
| **Contains** | Launch button config | Full app metadata |

**Your Configuration:**

✅ **Embed** (`app/layout.tsx`):
- Enables sharing your app in casts
- Button says "📺 Watch Now"
- Launches your Mini App when clicked

✅ **Manifest** (`app/api/manifest/route.ts`):
- Registers TakeoverTV as a Mini App
- Enables discovery in app store
- Required for `sdk.actions.addMiniApp()`

---

## 2. Authentication Strategy

### Recommendation: No Auth Needed ✅

**Your Current Approach:** Wallet-only integration using `farcasterMiniApp()` connector

**Why This Works:**
- You only need wallet signatures for transactions
- No backend user sessions required
- No authentication token needed
- Simpler, faster, better UX

### When to Add Quick Auth

Only add authentication if you need to:
1. Store user data in your backend
2. Implement user sessions
3. Associate Farcaster users with app-specific profiles

**Quick Auth Implementation (if needed later):**

```typescript
import { sdk } from '@farcaster/miniapp-sdk';

// Request authentication
const { token, fid } = await sdk.auth.quickAuth({
  clientName: 'TakeoverTV',
});

// Verify on backend
const response = await fetch('/api/auth/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token, fid }),
});

const { session } = await response.json();
```

**Backend Verification:**

```typescript
// app/api/auth/verify/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { token, fid } = await request.json();

  // Verify token with Farcaster API
  const response = await fetch('https://api.farcaster.xyz/v2/verifications/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  const { valid, user } = await response.json();

  if (valid) {
    // Create session, store user
    return NextResponse.json({ session: { fid, user } });
  }

  return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
}
```

### SIWF (Sign In with Farcaster)

**Not recommended for your use case**, but here's when to use it:
- Custom nonce generation required
- Existing SIWF infrastructure
- Need compatibility with non-Farcaster clients

---

## 3. Wallet Integration - Batch Transactions

### Current Implementation: Enhanced ✅

**Updated in `components/TakeoverForm.tsx`:**

1. **Batch Transaction Support (EIP-5792)**
   - Combines approve + takeover into single user confirmation
   - Fallback to sequential transactions if not supported
   - Better UX with fewer clicks

2. **How It Works:**

```typescript
// Check wallet capability
const supportsBatch = walletClient.request && 'wallet_sendCalls' in walletClient.request;

if (supportsBatch) {
  // Send both transactions in one call
  const batchId = await walletClient.request({
    method: 'wallet_sendCalls',
    params: [{
      calls: [
        { to: usdcAddress, data: approveData },
        { to: televisionAddress, data: takeoverData },
      ],
    }],
  });
}
```

3. **Fallback Strategy:**
   - If batch not supported → sequential approve then takeover
   - Transparent to user
   - Works on all wallets

### Advanced Wallet Features

#### Check Wallet Connection Status

```typescript
import { sdk } from '@farcaster/miniapp-sdk';

const provider = sdk.wallet.getEthereumProvider();
const accounts = await provider.request({ method: 'eth_accounts' });
console.log('Connected accounts:', accounts);
```

#### Transaction Error Handling

```typescript
try {
  await walletClient.writeContract({ ... });
} catch (error) {
  if (error.code === 4001) {
    // User rejected
    console.log('User cancelled transaction');
  } else if (error.code === -32002) {
    // Request pending
    console.log('Previous request pending');
  } else {
    // Other error
    console.error('Transaction failed:', error);
  }
}
```

#### Gas Estimation

```typescript
import { usePublicClient } from 'wagmi';

const publicClient = usePublicClient();

const gasEstimate = await publicClient.estimateContractGas({
  address: env.televisionAddress,
  abi: televisionABI,
  functionName: 'takeover',
  args: [youtubeUrl],
  account: userAddress,
});

console.log('Estimated gas:', gasEstimate);
```

---

## 4. Real-Time Price Updates

### Current Implementation: Optimized ✅

**Enhanced in `hooks/useTelevision.ts`:**

1. **Visibility-Based Polling**
   - Polls every 5 seconds when app is visible
   - Pauses when app is in background
   - Saves battery and bandwidth

2. **Polling Interval Recommendations:**

| Update Frequency | Use Case | Interval |
|-----------------|----------|----------|
| Real-time critical | Trading apps | 1-2 seconds |
| Near real-time | Auction apps (you) | 5 seconds |
| Periodic updates | Dashboard apps | 30-60 seconds |

3. **Alternative: Client-Side Calculation**

If your contract uses a predictable decay formula:

```typescript
// Calculate price locally
function calculateDecayingPrice(
  startPrice: bigint,
  startTime: number,
  epochPeriod: number
): bigint {
  const elapsed = Date.now() / 1000 - startTime;
  const decayAmount = (startPrice * BigInt(Math.floor(elapsed))) / BigInt(epochPeriod);
  return startPrice - decayAmount;
}

// Only fetch from contract when takeover happens
useWatchContractEvent({
  eventName: 'Takeover',
  onLogs: () => {
    // Fetch new start price and timestamp
    refetchPrice();
  },
});
```

### Event Listening Best Practices

✅ **Current Setup:**
- Using `useWatchContractEvent` for Takeover events
- Auto-refetches channel data on takeover
- Real-time UI updates

**Advanced Event Filtering:**

```typescript
useWatchContractEvent({
  address: env.televisionAddress,
  abi: televisionABI,
  eventName: 'Takeover',
  args: {
    // Filter events by owner if needed
    owner: specificAddress,
  },
  onLogs: (logs) => {
    logs.forEach(log => {
      console.log('Takeover by:', log.args.owner);
      console.log('Price:', log.args.price);
      console.log('URI:', log.args.uri);
    });
  },
});
```

---

## 5. Essential SDK Actions & Context

### Critical SDK Calls

#### 1. **sdk.actions.ready()** ✅ (Already Implemented)
**Purpose:** Hides splash screen, makes app interactive

```typescript
await sdk.actions.ready();
```

**⚠️ Critical:** MUST be called once after initialization. If forgotten → infinite splash screen!

#### 2. **sdk.context** (Recommended to Use)
**Purpose:** Access user info, client details, location context

```typescript
const context = sdk.context;

// User information
console.log('FID:', context.user.fid);
console.log('Username:', context.user.username);
console.log('Display Name:', context.user.displayName);
console.log('Profile Image:', context.user.pfpUrl);

// Client information
console.log('Platform:', context.client.platformType); // ios | android | web
console.log('Safe Area:', context.client.safeAreaInsets);

// Location context
console.log('Opened from:', context.location.type); // cast | notification | app_store
```

**Use Case for TakeoverTV:**
- Show personalized greeting: "Welcome, @username"
- Track which casts drive most takeovers
- Adjust UI for safe areas on mobile

#### 3. **sdk.actions.close()** (Optional)
**Purpose:** Programmatically close Mini App

```typescript
// Close after successful takeover
await sdk.actions.close();
```

#### 4. **sdk.actions.addMiniApp()** (Important for Discovery)
**Purpose:** Let users add your app to their home screen

```typescript
// Add button to UI
<button onClick={async () => {
  try {
    await sdk.actions.addMiniApp({
      url: 'https://yourdomain.com',
      name: 'TakeoverTV',
    });
  } catch (error) {
    console.error('Failed to add Mini App:', error);
  }
}}>
  Add to Home Screen
</button>
```

**⚠️ Important:** Only works on **production domains**, not localhost or ngrok!

#### 5. **sdk.actions.openUrl()** (For External Links)
**Purpose:** Open URLs in external browser

```typescript
await sdk.actions.openUrl({ url: 'https://docs.takeoverv.app' });
```

#### 6. **sdk.actions.composeCast()** (Social Sharing)
**Purpose:** Let users share takeovers as casts

```typescript
// After successful takeover
await sdk.actions.composeCast({
  text: `I just took over the channel! Watch now 📺`,
  embeds: [`https://yourdomain.com`],
});
```

**Use Case:** Share when user successfully takes over

### Recommended SDK Integration for TakeoverTV

Create a share button in your UI:

```typescript
// Add to TakeoverForm.tsx after successful takeover
const shareOnFarcaster = async () => {
  try {
    await sdk.actions.composeCast({
      text: `Just took control of TakeoverTV! Come watch 📺`,
      embeds: [`https://${env.appDomain}`],
    });
  } catch (error) {
    console.error('Share failed:', error);
  }
};

// In success UI
<button onClick={shareOnFarcaster}>
  Share Your Takeover
</button>
```

---

## 6. Advanced Features (Optional Enhancements)

### Haptic Feedback

```typescript
if (sdk.context.features.haptics) {
  await sdk.actions.haptics({
    type: 'impact',
    style: 'medium',
  });
}
```

**Use when:** User successfully takes over the channel

### Back Navigation

```typescript
// Listen for back button
sdk.on('primaryAction', () => {
  // Handle back navigation
  if (showForm) {
    setShowForm(false);
  } else {
    sdk.actions.close();
  }
});
```

### Notifications (Requires Webhook)

Set `webhookUrl` in your manifest to receive:
- New user installations
- Uninstallations
- Push notification permissions

```typescript
// In manifest
webhookUrl: 'https://yourdomain.com/api/webhooks/farcaster',
```

---

## 7. Testing & Debugging

### Local Development

1. **Use ngrok for testing:**
   ```bash
   ngrok http 3000
   ```

2. **Test in Preview Tool:**
   - https://farcaster.xyz/~/developers/frames
   - Enter your ngrok URL

3. **Check Console Logs:**
   ```typescript
   console.log('SDK Context:', sdk.context);
   console.log('Features:', sdk.context.features);
   ```

### Production Checklist

- [ ] Manifest accessible at `/.well-known/farcaster.json`
- [ ] Account association signed and added
- [ ] All images (logo, og-image, screenshots) uploaded
- [ ] Images are PNG, 3:2 ratio, publicly accessible
- [ ] `sdk.actions.ready()` called after initialization
- [ ] Production domain configured (no tunnel URLs)
- [ ] Test in multiple Farcaster clients (mobile, web)
- [ ] Error handling for all SDK actions
- [ ] Wallet connection working
- [ ] Batch transactions tested

### Common Pitfalls & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Infinite splash screen | Forgot `sdk.actions.ready()` | Call in useEffect after init |
| "Invalid manifest" | Not at `/.well-known/farcaster.json` | Check rewrite in `next.config.ts` |
| Images not loading | Wrong aspect ratio or format | Use PNG, 3:2 ratio |
| `addMiniApp()` fails | Using tunnel URL | Deploy to production domain |
| Batch transactions fail | Wallet doesn't support EIP-5792 | Fallback to sequential (already implemented) |
| Price not updating | Polling paused | Check visibility state handling |

---

## 8. Files Modified/Created

### Modified Files:
1. **`next.config.ts`** - Changed redirect to rewrite for manifest
2. **`components/TakeoverForm.tsx`** - Added batch transaction support
3. **`hooks/useTelevision.ts`** - Added visibility-based polling
4. **`app/page.tsx`** - Added context logging

### Created Files:
1. **`hooks/useFarcasterContext.ts`** - Helper hooks for SDK context
2. **`FARCASTER-INTEGRATION.md`** (this file) - Complete integration guide

---

## 9. Next Steps (Priority Order)

### Critical (Do Before Launch):
1. **Sign Manifest** - Get account association from Farcaster developer tools
2. **Create Images** - Upload logo.png, og-image.png, screenshot1.png
3. **Test on Production** - Deploy and test with real domain

### Recommended Enhancements:
1. **Add Share Button** - Let users share successful takeovers
2. **Show User Context** - Display Farcaster username in UI
3. **Add "Add to Home"** - Include `sdk.actions.addMiniApp()` button

### Optional Polish:
1. **Haptic Feedback** - Add tactile response to takeovers
2. **Back Navigation** - Handle back button in form
3. **Notifications** - Set up webhook for user engagement

---

## 10. Key Takeaways

✅ **Manifest + Embed Both Required:**
- Manifest = App registration
- Embed = Social sharing
- Must have both for full functionality

✅ **No Auth Needed for Your Use Case:**
- Wallet-only approach is perfect
- Quick Auth only if you need backend sessions

✅ **Batch Transactions = Better UX:**
- Single confirmation for approve + takeover
- Automatic fallback for unsupported wallets

✅ **Smart Polling Strategy:**
- 5-second interval for price updates
- Pause when app is hidden
- Consider client-side calculation

✅ **SDK Essentials:**
- `sdk.actions.ready()` - Must call!
- `sdk.context` - Rich user data
- `sdk.actions.composeCast()` - Social sharing

---

## Resources

- [Farcaster Mini Apps Docs](https://docs.farcaster.xyz/developers/guides/apps/mini-apps)
- [Mini App SDK Reference](https://github.com/farcasterxyz/miniapp-sdk)
- [Developer Tools](https://farcaster.xyz/~/developers)
- [Wagmi Documentation](https://wagmi.sh)
- [EIP-5792 Spec](https://eips.ethereum.org/EIPS/eip-5792)
