# Farcaster Mini App Authentication - Explained

## ✅ Your App is Now Correctly Configured!

Your TakeoverTV Mini App now uses the **proper authentication approach** for Farcaster Mini Apps.

## What Changed

### Files Updated:

1. **`lib/wagmi.ts`** - Removed unnecessary wallet connectors
   - ❌ Removed: `injected()`, `metaMask()`, `coinbaseWallet()`
   - ✅ Kept only: `farcasterMiniApp()` connector
   - This is the ONLY connector needed for Farcaster Mini Apps

2. **`app/page.tsx`** - Improved auto-connection
   - Auto-connects to Farcaster wallet on mount
   - Displays user's Ethereum address in header
   - Calls `sdk.actions.ready()` after initialization

## Understanding Farcaster Mini App Authentication

### What You DON'T Need (for now)

**❌ Quick Auth** - Only needed if you have a backend that needs to verify Farcaster identity
**❌ SIWF (Sign In with Farcaster)** - Only needed for server-side authentication
**❌ API Keys** - Not needed for blockchain transactions
**❌ Backend auth service** - Not needed unless you store user data

### What You DO Have (already working)

**✅ `farcasterMiniApp()` connector** - Automatically provides:
- User's Ethereum address
- Transaction signing capability
- Auto-connection in Farcaster client
- No setup required!

## How Authentication Works in Your App

### 1. When App Opens in Farcaster

```javascript
// app/page.tsx (already implemented)

// Step 1: Component mounts
useEffect(() => {
  setMounted(true);
}, []);

// Step 2: Auto-connect to Farcaster wallet
useEffect(() => {
  if (!mounted) return;

  const farcasterConnector = connectors[0]; // farcasterMiniApp
  await connect({ connector: farcasterConnector });

  // Step 3: Tell Farcaster we're ready (hides splash screen)
  await sdk.actions.ready();
}, [mounted, isConnected, connect, connectors]);
```

### 2. User Information Available

```javascript
// Get user's Ethereum address
const { address, isConnected } = useAccount();

// Get Farcaster user info from SDK
const context = sdk.context;
console.log(context.user); // { fid: 123, username: 'alice' }
console.log(context.client); // { platformType: 'ios' }
```

### 3. Signing Transactions

```javascript
// components/TakeoverForm.tsx (already working)

// Approve USDC
const { writeContract: approve } = useWriteContract();
approve({
  address: usdcAddress,
  abi: erc20ABI,
  functionName: 'approve',
  args: [televisionAddress, amount],
});
// ↑ User gets prompt in Farcaster to sign this transaction

// Execute takeover
takeover({
  address: televisionAddress,
  abi: televisionABI,
  functionName: 'takeover',
  args: [youtubeUrl, address, epochId, deadline, maxPayment],
});
// ↑ User gets another prompt to sign
```

## Testing Your Authentication

### Testing Locally (Outside Farcaster)

When you run `npm run dev` and open http://localhost:3000:

```
❌ Won't auto-connect (you're not in Farcaster client)
✅ Shows "Connecting..." in header
✅ No errors or crashes
```

**This is EXPECTED** - the connector only works inside Farcaster.

### Testing in Farcaster (Production)

When your app runs inside a Farcaster client:

```
✅ Auto-connects on load
✅ Shows "Connected" with user's address
✅ User can sign transactions
✅ No manual wallet connection needed
```

## How to Test in Farcaster

### Option 1: Deploy to Production

1. Deploy your app to Vercel/hosting
2. Get a production domain (e.g., takeovertv.xyz)
3. Create and sign manifest at https://farcaster.xyz/~/developers
4. Share your Mini App URL in a Farcaster cast
5. Users open it → auto-connects → works!

### Option 2: Use ngrok for Testing

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Expose with ngrok
ngrok http 3000

# Update .env.local with ngrok URL
NEXT_PUBLIC_APP_DOMAIN=abc123.ngrok.io

# Restart dev server
```

Then:
1. Go to https://farcaster.xyz/~/developers/mini-apps/preview
2. Enter your ngrok URL
3. Test the Mini App in the preview frame
4. Wallet should auto-connect!

## Current User Experience

### In Browser (localhost:3000)

```
Header shows: "Connecting..."
Button shows: "Loading..."
```

This is normal - you're not in a Farcaster client.

### In Farcaster Client

```
1. User opens TakeoverTV Mini App
2. Splash screen shows briefly
3. App calls sdk.actions.ready() → splash disappears
4. Wallet auto-connects
5. Header shows: "Connected" + "0x1234...5678"
6. Button shows: "Takeover for $X.XX USDC"
7. User clicks → enters YouTube URL → confirms
8. Gets transaction prompt in Farcaster wallet
9. Signs approve transaction
10. Signs takeover transaction
11. Done! Their video is on TakeoverTV
```

## When You WOULD Need Quick Auth or SIWF

Add authentication later if you want to:

### Quick Auth Use Cases

```javascript
// Example: Store user preferences server-side
const { token } = await sdk.actions.signIn({
  acceptAuthAddress: true,
});

// Send to your backend
await fetch('/api/save-preferences', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ preferences: { ... } }),
});
```

**When you'd need it:**
- Storing user data in a database
- Building user profiles
- Tracking user history server-side
- Rate limiting per Farcaster user
- Social features (following, likes, etc.)

### SIWF Use Cases

```javascript
// Example: Verify Farcaster identity on backend
app.post('/api/auth', async (req, res) => {
  const { message, signature } = req.body;

  // Verify the signature proves user owns this Farcaster account
  const fid = await verifySIWFSignature(message, signature);

  // Create session for this Farcaster user
  const session = await createSession(fid);
  res.json({ session });
});
```

**When you'd need it:**
- Custom nonce generation
- Advanced auth flows
- Integrating with existing SIWF infrastructure

## Your Current Setup is Perfect

For TakeoverTV, you only need:

✅ User's Ethereum address (for transactions)
✅ Transaction signing capability
✅ No backend authentication

The `farcasterMiniApp()` connector provides all of this automatically!

## Debugging Connection Issues

### "Shows 'Connected' but I never connected"

This happens when testing **outside** Farcaster:
- The connector tries to connect
- Fails silently (no Farcaster wallet available)
- Wagmi might show `isConnected: true` but no actual address
- **Solution:** Test inside Farcaster client or with ngrok

### "Address is undefined"

Check:
```javascript
const { address, isConnected } = useAccount();
console.log('Connected:', isConnected);
console.log('Address:', address);

// If isConnected is true but address is undefined:
// → You're not actually connected to a Farcaster wallet
// → Test in Farcaster client or with ngrok
```

### "Transactions don't prompt for signature"

This means:
- You're testing outside Farcaster
- No wallet is actually connected
- **Solution:** Deploy and test in Farcaster, or use ngrok

## Production Checklist

Before deploying to production:

- [ ] Deploy to production domain
- [ ] Update `NEXT_PUBLIC_APP_DOMAIN` in environment variables
- [ ] Create manifest at `/.well-known/farcaster.json`
- [ ] Sign manifest at https://farcaster.xyz/~/developers
- [ ] Update `app/api/manifest/route.ts` with signature
- [ ] Test in Farcaster desktop client
- [ ] Test in Farcaster mobile client (iOS/Android)
- [ ] Verify wallet auto-connects
- [ ] Test approve + takeover transaction flow
- [ ] Verify user receives payment from previous owner

## Summary

Your TakeoverTV Mini App now has the **correct authentication setup** for a Farcaster Mini App:

1. ✅ Uses `farcasterMiniApp()` connector only
2. ✅ Auto-connects when opened in Farcaster
3. ✅ Displays user's Ethereum address
4. ✅ Can sign transactions for approve + takeover
5. ✅ Calls `sdk.actions.ready()` to hide splash screen
6. ✅ No API keys or backend auth needed

**To test properly:** Deploy to production or use ngrok, then open in Farcaster client.

**For now:** Local testing won't show proper connection (and that's expected).
