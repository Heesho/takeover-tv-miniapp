# Transaction Debugging Guide

## Console Logging for Transaction Flow

If you need to debug transaction issues further, add these console logs:

### In TakeoverForm.tsx

```typescript
// At the top of the component
useEffect(() => {
  console.log('[TakeoverForm] State:', {
    step,
    hasApproveError: !!approveError,
    hasTakeoverError: !!takeoverError,
    hasStatusMessage: !!statusMessage,
    isConnected,
    approveHash,
    takeoverHash,
  });
}, [step, approveError, takeoverError, statusMessage, isConnected, approveHash, takeoverHash]);

// In error useEffect
useEffect(() => {
  if ((approveError || takeoverError) && step !== 'input') {
    console.log('[Error Handler] Triggered:', {
      approveError: approveError?.message,
      takeoverError: takeoverError?.message,
      currentStep: step,
    });
    // ... rest of code
  }
}, [approveError, takeoverError, step]);

// In handleSubmit
const handleSubmit = async () => {
  console.log('[handleSubmit] Starting:', {
    isConnected,
    isValidUrl,
    currentPrice,
    quoteToken,
    allowance,
  });
  // ... rest of code
};

// In handleApprove
const handleApprove = async () => {
  console.log('[handleApprove] Starting:', {
    quoteToken,
    currentPrice,
    televisionAddress: env.televisionAddress,
  });
  // ... rest of code
};

// In handleTakeover
const handleTakeover = async () => {
  console.log('[handleTakeover] Starting:', {
    youtubeUrl,
    address,
    currentPrice,
    epochId,
  });
  // ... rest of code
};
```

## Common Issues & Solutions

### Issue: Wallet doesn't open at all
**Check:**
- Is the app running in Farcaster client? (wagmi connector requires Farcaster context)
- Console errors about missing provider?
- Network connection?

**Solution:**
```typescript
// Add to handleApprove/handleTakeover before writeContract call:
if (!walletClient) {
  console.error('No wallet client available');
  return;
}
```

### Issue: Transaction submits but never confirms
**Check:**
- Transaction hash in console
- Block explorer (basescan.org for Base Sepolia)
- Gas settings
- RPC connection

**Debug:**
```typescript
useEffect(() => {
  console.log('[Transaction Receipt]', {
    approveHash,
    isApproveLoading,
    isApproveSuccess,
    takeoverHash,
    isTakeoverLoading,
    isTakeoverSuccess,
  });
}, [approveHash, isApproveLoading, isApproveSuccess, takeoverHash, isTakeoverLoading, isTakeoverSuccess]);
```

### Issue: "Transaction Failed" still showing immediately
**Check:**
- Are you on the latest code?
- Any console errors?
- Step state in console

**Verify fix:**
```typescript
// Add to error useEffect (line 152)
useEffect(() => {
  console.log('[Error Check]', {
    hasError: !!(approveError || takeoverError),
    step,
    willTrigger: !!(approveError || takeoverError) && step !== 'input',
  });

  if ((approveError || takeoverError) && step !== 'input') {
    // ... error handling
  }
}, [approveError, takeoverError, step]);
```

### Issue: Allowance check not working
**Check:**
- QuoteToken address is correct
- User has USDC balance
- Allowance contract call successful

**Debug:**
```typescript
useEffect(() => {
  console.log('[Allowance Check]', {
    quoteToken,
    allowance,
    currentPrice,
    needsApproval: !allowance || allowance < currentPrice,
  });
}, [allowance, currentPrice, quoteToken]);
```

## Farcaster Mini App Specific Checks

### Wallet Connection
```typescript
// In component
useEffect(() => {
  console.log('[Wallet State]', {
    address,
    isConnected,
    chainId: walletClient?.chain?.id,
    expectedChainId: env.chainId,
  });
}, [address, isConnected, walletClient]);
```

### SDK Ready State
```typescript
// In app layout or root component
import { sdk } from '@farcaster/miniapp-sdk';

useEffect(() => {
  console.log('[Farcaster SDK]', {
    isReady: sdk.isReady,
    context: sdk.context,
  });
}, []);
```

### Chain Mismatch
```typescript
// Before writeContract calls
if (walletClient?.chain?.id !== env.chainId) {
  console.error('[Chain Mismatch]', {
    walletChain: walletClient?.chain?.id,
    expectedChain: env.chainId,
  });
  // Optionally request chain switch
}
```

## Environment Verification

```bash
# Check environment variables
cat .env.local

# Should have:
# NEXT_PUBLIC_TELEVISION_ADDRESS=0x...
# NEXT_PUBLIC_CHAIN_ID=84532
# NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
# NEXT_PUBLIC_USDC_ADDRESS=0x...
```

## Network Requests

Check Network tab in browser DevTools:
- RPC calls to Base Sepolia
- Transaction submissions
- Contract reads (allowance, balance, etc.)

## Best Practices for Farcaster Mini Apps

1. **Always check wallet connection before transactions**
2. **Use chainId parameter in writeContract calls** (you're already doing this)
3. **Implement proper error handling with user-friendly messages**
4. **Clear previous errors before new attempts** (fixed in this update)
5. **Test in actual Farcaster client, not just browser**
6. **Handle transaction rejections gracefully**
7. **Provide visual feedback for all states** (pending, success, error)

## Still Having Issues?

1. Clear browser cache and localStorage
2. Disconnect and reconnect wallet in Farcaster
3. Check Farcaster client version is up to date
4. Test with a different Farcaster account
5. Verify contract addresses in block explorer
6. Check contract is deployed on correct network (Base Sepolia vs Base Mainnet)
