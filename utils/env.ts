// Environment configuration
// You'll need to set these environment variables

export const env = {
  // The Television smart contract address
  televisionAddress: (process.env.NEXT_PUBLIC_TELEVISION_ADDRESS || '0x0') as `0x${string}`,

  // The chain ID (e.g., Base = 8453, Base Sepolia = 84532)
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '8453'),

  // RPC URL
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org',

  // App domain for manifest
  appDomain: process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3000',

  // App name
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'TakeoverTV',
} as const;
