# Bug Fix: Takeover Transaction Error

## Issue
Takeover button was failing with error:
```
TypeError: r.connector.getChainId is not a function
```

## Root Cause
The `@farcaster/miniapp-wagmi-connector` in wagmi v2 doesn't support the `chainId` parameter being explicitly passed to `writeContract` calls. The connector manages chain selection internally.

## Solution
Removed `chainId` parameter from both `approveWrite` and `takeoverWrite` calls:

### Before (Incorrect):
```typescript
approveWrite({
  address: quoteToken,
  abi: erc20ABI,
  functionName: 'approve',
  args: [env.televisionAddress, currentPrice],
  chainId,  // ❌ This causes the error
});

takeoverWrite({
  address: env.televisionAddress,
  abi: televisionABI,
  functionName: 'takeover',
  args: [youtubeUrl, address, BigInt(epochId), deadline, maxPaymentAmount],
  chainId,  // ❌ This causes the error
});
```

### After (Correct):
```typescript
approveWrite({
  address: quoteToken,
  abi: erc20ABI,
  functionName: 'approve',
  args: [env.televisionAddress, currentPrice],
  // ✅ Let the Farcaster connector handle chain selection
});

takeoverWrite({
  address: env.televisionAddress,
  abi: televisionABI,
  functionName: 'takeover',
  args: [youtubeUrl, address, BigInt(epochId), deadline, maxPaymentAmount],
  // ✅ Let the Farcaster connector handle chain selection
});
```

## Files Changed
- `components/TakeoverForm.tsx`

## Why This Happens
The Farcaster Mini App connector automatically manages the chain context based on your wagmi config. When you pass an explicit `chainId`, wagmi tries to call `connector.getChainId()` which doesn't exist on the Farcaster connector implementation.

## Best Practice
When using the Farcaster Mini App connector:
- ✅ **DO**: Let the connector manage chain selection automatically
- ✅ **DO**: Configure the correct chain in your wagmi config (`lib/wagmi.ts`)
- ❌ **DON'T**: Pass `chainId` to `writeContract` calls
- ❌ **DON'T**: Try to manually switch chains

## Testing
1. Ensure wallet is connected
2. Enter a valid YouTube URL
3. Click "Takeover" button
4. Transaction should now be sent to wallet for approval
5. No more `getChainId is not a function` error

## Related Documentation
- [Wagmi v2 writeContract](https://wagmi.sh/react/api/actions/writeContract)
- [Farcaster Mini App Connector](https://github.com/farcasterxyz/miniapps/tree/main/packages/miniapp-wagmi-connector)
