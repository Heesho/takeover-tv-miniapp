export const env = {
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '8453'), // Base mainnet
  televisionContract: (process.env.NEXT_PUBLIC_TELEVISION_CONTRACT || '0x9C751E6825EDAa55007160b99933846f6ECeEc9B') as `0x${string}`,
  usdcContract: (process.env.NEXT_PUBLIC_USDC_CONTRACT || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913') as `0x${string}`, // Base mainnet USDC
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://take0ver-tv.vercel.app',
  defaultChannel: process.env.NEXT_PUBLIC_DEFAULT_CHANNEL || 'gamesdonequick',
  alchemyRpcUrl: process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || 'https://base-mainnet.g.alchemy.com/v2/maEamUgoT5NkZA3J9bXV9',
} as const;
