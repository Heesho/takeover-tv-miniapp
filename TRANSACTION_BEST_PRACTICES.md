# Transaction State Management Best Practices for Farcaster Mini Apps

## Overview

This guide documents best practices for managing complex transaction flows in Farcaster Mini Apps, based on lessons learned from the TakeoverTV app.

## Key Principles

### 1. State Management in Multi-Step Transactions

**Problem:** wagmi's `reset()` function is asynchronous, so error states can persist briefly after calling reset.

**Solution:** Use step-based guards in error handling:

```typescript
// ❌ BAD - Will fire on stale errors
useEffect(() => {
  if (approveError || takeoverError) {
    setStatusMessage({ type: 'error', text: 'Failed' });
  }
}, [approveError, takeoverError]);

// ✅ GOOD - Only fires when actually in error state
useEffect(() => {
  if ((approveError || takeoverError) && step !== 'input') {
    setStep('input');
    setStatusMessage({ type: 'error', text: 'Failed' });
  }
}, [approveError, takeoverError, step]);
```

### 2. Clear State Before New Attempts

Always clear previous state before starting new transactions:

```typescript
const handleSubmit = async () => {
  // Clear UI messages
  setStatusMessage(null);

  // Reset wagmi hook errors
  resetApprove();
  resetTakeover();

  // Then proceed with transaction
  if (needsApproval) {
    handleApprove();
  } else {
    handleTakeover();
  }
};
```

### 3. Conditional Rendering Gotchas

**Problem:** Conditional rendering can hide transaction triggers or create race conditions.

**Current Pattern (WORKS):**
```typescript
{statusMessage ? (
  <div>Status: {statusMessage.text}</div>
) : step === 'input' ? (
  <form>...</form>
) : null}

{(step === 'approve' || step === 'takeover') && (
  <div>Processing...</div>
)}
```

**Why it works:**
- Status message temporarily replaces input form
- Processing state is separate from input/status
- No conflicting renders

### 4. Transaction Flow Architecture

**Recommended Pattern:**

```typescript
// 1. State declarations
const [step, setStep] = useState<'input' | 'approve' | 'takeover' | 'success'>('input');
const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

// 2. Wagmi hooks
const { writeContract: approve, error: approveError, reset: resetApprove } = useWriteContract();
const { writeContract: takeover, error: takeoverError, reset: resetTakeover } = useWriteContract();

// 3. Success handler (auto-advance)
useEffect(() => {
  if (isApproveSuccess && step === 'approve') {
    setStep('takeover');
    handleTakeover(); // Auto-trigger next step
  }
}, [isApproveSuccess, step]);

// 4. Error handler (with guard)
useEffect(() => {
  if ((approveError || takeoverError) && step !== 'input') {
    setStep('input');
    setStatusMessage({ type: 'error', text: 'Transaction Failed' });
  }
}, [approveError, takeoverError, step]);

// 5. Submit handler (clears state)
const handleSubmit = async () => {
  setStatusMessage(null);
  resetApprove();
  resetTakeover();

  if (needsApproval) {
    handleApprove();
  } else {
    handleTakeover();
  }
};
```

## Common Pitfalls & Solutions

### Pitfall 1: Forgetting chainId

**Problem:** Transactions fail silently or target wrong network.

```typescript
// ❌ BAD - Uses default chain
writeContract({
  address: contractAddress,
  abi: contractABI,
  functionName: 'transfer',
  args: [recipient, amount],
});

// ✅ GOOD - Explicit chain
writeContract({
  address: contractAddress,
  abi: contractABI,
  functionName: 'transfer',
  args: [recipient, amount],
  chainId: env.chainId, // Explicit!
});
```

### Pitfall 2: Not Checking Connection

```typescript
// ❌ BAD - Assumes connection
const handleSubmit = () => {
  approve({ ... });
};

// ✅ GOOD - Validates first
const handleSubmit = () => {
  if (!isConnected || !address) {
    console.error('Wallet not connected');
    return;
  }
  approve({ ... });
};
```

### Pitfall 3: Race Conditions in Auto-Advance

**Problem:** Second transaction triggers before first confirms.

```typescript
// ❌ BAD - Uses isPending
useEffect(() => {
  if (!isApprovePending) {
    handleTakeover(); // May trigger too early!
  }
}, [isApprovePending]);

// ✅ GOOD - Uses isSuccess
useEffect(() => {
  if (isApproveSuccess && step === 'approve') {
    setStep('takeover');
    handleTakeover(); // Only after confirmed
  }
}, [isApproveSuccess, step]);
```

### Pitfall 4: Not Handling User Rejections

```typescript
// ❌ BAD - Generic error
if (error) {
  alert('Transaction failed');
}

// ✅ GOOD - Distinguish rejection from failure
const errorMessage = error?.message || '';
const isUserRejection = errorMessage.includes('User rejected') ||
                        errorMessage.includes('user rejected');

setStatusMessage({
  type: 'error',
  text: isUserRejection ? 'Transaction Rejected' : 'Transaction Failed'
});
```

## Farcaster Mini App Specifics

### Wallet Integration

```typescript
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';

export const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(env.rpcUrl),
  },
  connectors: [
    farcasterMiniApp(), // Auto-connects in Farcaster
  ],
});
```

**Key Points:**
- Connector auto-connects when app runs in Farcaster client
- No manual connection button needed (though you can add one for web)
- Always check `isConnected` before transactions
- Wallet client is available via `useWalletClient()`

### Haptic Feedback

```typescript
import { triggerHaptic } from '@/utils/farcaster';

// On success
useEffect(() => {
  if (isTakeoverSuccess) {
    triggerHaptic('heavy'); // Celebrate!
    setStatusMessage({ type: 'success', text: 'Success!' });
  }
}, [isTakeoverSuccess]);
```

### Testing in Development

**Important:** Farcaster Mini App connector only works in Farcaster client, not regular browser.

```typescript
// For local testing, you might want to add a fallback connector:
import { injected } from '@wagmi/connectors';

connectors: [
  farcasterMiniApp(),
  // Fallback for local development
  ...(process.env.NODE_ENV === 'development' ? [injected()] : []),
],
```

## Transaction Lifecycle

```
User Action
    ↓
handleSubmit()
    ↓
Clear statusMessage ← IMPORTANT!
    ↓
Reset previous errors ← IMPORTANT!
    ↓
Check approval needed?
    ↓
    ├─→ Yes → handleApprove()
    │           ↓
    │       setStep('approve')
    │           ↓
    │       approve() wagmi call
    │           ↓
    │       Wallet opens
    │           ↓
    │       User confirms/rejects
    │           ↓
    │       ├─→ Success → isApproveSuccess
    │       │               ↓
    │       │           Auto-trigger handleTakeover()
    │       │
    │       └─→ Error → approveError
    │                       ↓
    │                   (step !== 'input' guard prevents stale triggers)
    │                       ↓
    │                   setStep('input')
    │                       ↓
    │                   Show error message
    │
    └─→ No → handleTakeover()
                ↓
            setStep('takeover')
                ↓
            takeover() wagmi call
                ↓
            Wallet opens
                ↓
            User confirms/rejects
                ↓
            ├─→ Success → isTakeoverSuccess
            │               ↓
            │           Show success message
            │               ↓
            │           Reset to 'input'
            │
            └─→ Error → takeoverError
                            ↓
                        (step !== 'input' guard)
                            ↓
                        setStep('input')
                            ↓
                        Show error message
```

## Debugging Checklist

When transactions fail:

- [ ] Check console for error messages
- [ ] Verify wallet is connected (`isConnected === true`)
- [ ] Confirm correct chainId (`env.chainId === walletClient.chain.id`)
- [ ] Ensure contract addresses are correct
- [ ] Verify user has sufficient balance
- [ ] Check if approval is needed and sufficient
- [ ] Look for step state inconsistencies
- [ ] Confirm no stale errors triggering error handler
- [ ] Test in actual Farcaster client (not just browser)
- [ ] Check RPC endpoint is responding

## Performance Considerations

### Auto-refetching Balance

```typescript
const { data: balance, refetch } = useReadContract({
  address: tokenAddress,
  abi: erc20ABI,
  functionName: 'balanceOf',
  args: [userAddress],
  query: {
    refetchInterval: 3000, // Every 3 seconds
  },
});

// Also manually refetch after transactions
useEffect(() => {
  if (isTakeoverSuccess) {
    refetch();
  }
}, [isTakeoverSuccess, refetch]);
```

### Optimistic UI Updates

Consider showing optimistic updates before confirmation:

```typescript
const [optimisticBalance, setOptimisticBalance] = useState<bigint>();

const handleTakeover = async () => {
  // Optimistically reduce balance
  if (balance && currentPrice) {
    setOptimisticBalance(balance - currentPrice);
  }

  takeover({ ... });
};

// Revert on error
useEffect(() => {
  if (takeoverError) {
    setOptimisticBalance(undefined);
  }
}, [takeoverError]);

// Clear on success
useEffect(() => {
  if (isTakeoverSuccess) {
    setOptimisticBalance(undefined);
    refetch(); // Get real balance
  }
}, [isTakeoverSuccess, refetch]);
```

## Summary

**Golden Rules:**

1. **Always clear state before new attempts** (statusMessage, reset hooks)
2. **Use step guards in error handlers** (prevents stale error triggers)
3. **Specify chainId explicitly** in all writeContract calls
4. **Distinguish user rejection from failures** (better UX)
5. **Auto-advance with isSuccess, not isPending** (wait for confirmation)
6. **Test in actual Farcaster client** (connector behavior differs)
7. **Provide clear visual feedback** for all states
8. **Handle edge cases gracefully** (no connection, wrong network, etc.)

Following these patterns will prevent the majority of transaction issues in Farcaster Mini Apps!
