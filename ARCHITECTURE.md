# TakeoverTV Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Farcaster Client                        │
│                    (Mobile/Desktop)                         │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │           TakeoverTV Mini App (iframe)                │ │
│  │                                                       │ │
│  │  ┌─────────────────────┐    ┌───────────────────┐   │ │
│  │  │   VideoPlayer       │    │   ChannelInfo     │   │ │
│  │  │  - YouTube embed    │    │  - Owner address  │   │ │
│  │  │  - Static transition│    │  - Current price  │   │ │
│  │  │  - STANDBY mode     │    │  - Decay indicator│   │ │
│  │  └─────────────────────┘    └───────────────────┘   │ │
│  │                                                       │ │
│  │  ┌────────────────────────────────────────────────┐  │ │
│  │  │          TakeoverForm                          │  │ │
│  │  │  - URL validation                              │  │ │
│  │  │  - Approve/Takeover flow                       │  │ │
│  │  └────────────────────────────────────────────────┘  │ │
│  │                                                       │ │
│  │  ┌────────────────────────────────────────────────┐  │ │
│  │  │            Providers                           │  │ │
│  │  │  - Wagmi (wallet connection)                   │  │ │
│  │  │  - React Query (caching)                       │  │ │
│  │  └────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────┘ │
│                           │                                 │
│                           │ Farcaster Mini App SDK          │
│                           ▼                                 │
│                  ┌─────────────────┐                        │
│                  │  Farcaster      │                        │
│                  │  Wallet         │                        │
│                  └─────────────────┘                        │
└───────────────────────┼─────────────────────────────────────┘
                        │
                        │ Viem/Wagmi (Ethereum interactions)
                        │
                        ▼
              ┌──────────────────┐
              │   Base Network   │
              │    (EVM Chain)   │
              └──────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
┌─────────────────┐          ┌──────────────────┐
│ Television.sol  │          │  USDC Contract   │
│  - getSlot0()   │          │   - approve()    │
│  - getPrice()   │          │   - transfer()   │
│  - takeover()   │          └──────────────────┘
│  - Events       │
└─────────────────┘
```

## Data Flow

### 1. Initial Load
```
User Opens App
     │
     ├─> SDK calls ready()
     │   └─> Hides splash screen
     │
     ├─> Wagmi auto-connects wallet
     │   └─> Gets user address
     │
     └─> useCurrentChannel()
         ├─> Calls getSlot0()
         │   └─> Returns (owner, uri)
         │
         └─> VideoPlayer renders
             ├─> Valid YouTube URI → Shows video
             └─> Invalid/empty URI → Shows STANDBY
```

### 2. Price Updates
```
Every 5 seconds:
     │
     └─> useCurrentPrice()
         ├─> Calls getPrice()
         │   └─> Returns current price (decaying)
         │
         └─> Updates UI
             └─> ChannelInfo re-renders
```

### 3. Takeover Flow
```
User clicks Takeover
     │
     ├─> TakeoverForm opens
     │
     └─> User enters YouTube URL
         │
         ├─> Validation runs
         │   ├─> Valid → Green checkmark
         │   └─> Invalid → Red X
         │
         └─> User clicks Confirm
             │
             ├─> Check allowance
             │   │
             │   ├─> Insufficient?
             │   │   └─> Send approve tx
             │   │       └─> Wait for confirmation
             │   │
             │   └─> Send takeover tx
             │       └─> Wait for confirmation
             │
             └─> Success!
                 ├─> Takeover event emitted
                 │
                 └─> UI updates
                     ├─> Static transition plays
                     └─> New video loads
```

### 4. Event Listening
```
Contract emits Takeover event
     │
     └─> useTakeoverEvents() detects it
         │
         ├─> Calls refetch on channel data
         │
         └─> Components re-render
             ├─> VideoPlayer shows static
             └─> After 1.5s, new video plays
```

## Component Hierarchy

```
App (page.tsx)
 │
 ├─> Providers
 │    ├─> WagmiProvider
 │    └─> QueryClientProvider
 │
 ├─> Header
 │    ├─> App Name
 │    └─> Connection Status
 │
 └─> Main
      ├─> VideoPlayer
      │    └─> YouTube iframe OR static screen
      │
      ├─> ChannelInfo
      │    ├─> Owner Address
      │    └─> Current Price (live)
      │
      ├─> TakeoverForm
      │    ├─> Button (collapsed)
      │    └─> Form (expanded)
      │         ├─> URL Input
      │         ├─> Validation Indicator
      │         └─> Confirm/Cancel Buttons
      │
      └─> Info Section
           └─> App Description
```

## State Management

### React Query (via Wagmi)
- Contract reads (getSlot0, getPrice, quoteToken)
- Automatic caching and refetching
- Transaction state management

### React State
- `showForm`: Toggle form visibility
- `youtubeUrl`: Input value
- `isValidUrl`: Validation state
- `step`: Transaction step (input/approve/takeover/success)
- `currentVideoId`: Active video ID
- `showStatic`: Transition state

### Wagmi Hooks
- `useAccount()`: Wallet connection status
- `useReadContract()`: Read contract data
- `useWriteContract()`: Send transactions
- `useWaitForTransactionReceipt()`: Wait for confirmations
- `useWatchContractEvent()`: Listen for events
- `usePublicClient()`: Direct contract calls

## Network Communication

### RPC Calls
```
App → Viem → RPC Node
  │
  ├─> Read calls (no gas)
  │   ├─> getSlot0()
  │   ├─> getPrice()
  │   └─> quoteToken()
  │
  └─> Write calls (requires gas)
      ├─> approve(spender, amount)
      └─> takeover(uri)
```

### Event Subscriptions
```
RPC Node → Viem → Wagmi → Component
     │
     └─> Takeover events streamed
         └─> useWatchContractEvent() callback
             └─> State update
```

## File Dependency Graph

```
page.tsx
 │
 ├─→ Providers.tsx
 │    └─→ wagmi.ts (config)
 │         └─→ env.ts
 │
 ├─→ VideoPlayer.tsx
 │    └─→ youtube.ts (utils)
 │
 ├─→ ChannelInfo.tsx
 │
 ├─→ TakeoverForm.tsx
 │    ├─→ television-abi.ts
 │    ├─→ youtube.ts
 │    └─→ env.ts
 │
 └─→ useTelevision.ts (hooks)
      ├─→ television-abi.ts
      └─→ env.ts
```

## Smart Contract Integration

### Television.sol Interface
```solidity
interface ITelevision {
    // View functions
    function getSlot0() external view returns (address owner, string memory uri);
    function getPrice() external view returns (uint256);
    function quoteToken() external view returns (address);

    // State-changing function
    function takeover(string calldata uri) external;

    // Events
    event Takeover(address indexed owner, uint256 price, string uri);
}
```

### Price Decay Mechanics
```
Price(t) = StartPrice - (StartPrice × t / EPOCH_PERIOD)

Where:
- StartPrice = 2 × LastSettlementPrice
- EPOCH_PERIOD = 86400 seconds (24 hours)
- t = time since last takeover
- Price decays linearly to 0
```

### Payment Flow
```
User pays takeover price
     │
     ├─> 90% → Previous Owner
     │
     └─> 10% → Treasury
```

## Farcaster Integration Points

### 1. SDK Initialization
```typescript
sdk.actions.ready()
  └─> Hides splash screen
  └─> App becomes interactive
```

### 2. Wallet Connection
```typescript
farcasterMiniApp() connector
  └─> Auto-connects in Farcaster
  └─> Uses user's connected wallet
```

### 3. Context Access
```typescript
sdk.context
  ├─> user (fid, username, etc.)
  ├─> client (platformType, safeAreaInsets)
  └─> location (how app was opened)
```

### 4. Manifest System
```
GET /.well-known/farcaster.json
  └─> Returns manifest with:
      ├─> App metadata
      ├─> Account association
      └─> Display configuration
```

## Security Architecture

### Frontend Security
- URL validation before submission
- Transaction confirmation required
- No private keys stored
- Read-only operations don't require approval

### Smart Contract Security
- Access control on writes
- Price validation
- Reentrancy protection (assumed in contract)
- Event emission for transparency

### Wallet Security
- User controls signing
- Approval amounts explicit
- Transaction previews shown
- Can cancel at any time

## Performance Considerations

### Polling Strategy
```
Price Updates: Every 5 seconds
  └─> Balance between:
      ├─> Accuracy (more frequent = better)
      └─> Performance (less frequent = better)
```

### Event Listening
```
Takeover Events: Real-time via RPC
  └─> Immediate UI updates
  └─> No polling lag
```

### Caching
```
React Query caches:
  ├─> Contract reads (staleTime configurable)
  ├─> Transaction results
  └─> Automatic invalidation on events
```

## Deployment Architecture

```
GitHub
  │
  └─> Push to main
      │
      └─> Vercel
          │
          ├─> Build Next.js app
          │   └─> Static pages + API routes
          │
          ├─> Deploy to Edge Network
          │   └─> Global CDN
          │
          └─> Serve at custom domain
              │
              └─> HTTPS + HTTP/2
                  └─> Fast, secure delivery
```

## Error Handling Flow

```
User Action
  │
  ├─> Try
  │    └─> Success → Update UI
  │
  └─> Catch
       ├─> User Rejection → Show cancellation message
       ├─> Insufficient Balance → Show balance error
       ├─> Network Error → Show retry option
       ├─> Contract Revert → Show contract error
       └─> Unknown Error → Show generic error + log
```

---

This architecture provides:
- ✅ Real-time updates
- ✅ Type safety
- ✅ User-friendly interactions
- ✅ Efficient blockchain communication
- ✅ Scalable component structure
- ✅ Production-ready deployment
