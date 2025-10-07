export const env = {
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '84532'),
  televisionContract: (process.env.NEXT_PUBLIC_TELEVISION_CONTRACT || '0x1D3311BbA327B89534238F696e643DBbAE79a612') as `0x${string}`,
  usdcContract: (process.env.NEXT_PUBLIC_USDC_CONTRACT || '0x6c268B147FeB6d50a165F2357cE2eC57EF17d5B7') as `0x${string}`,
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  defaultChannel: process.env.NEXT_PUBLIC_DEFAULT_CHANNEL || 'gamesdonequick',
  alchemyRpcUrl: process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || '',
} as const;
