export const env = {
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '84532'),
  televisionContract: (process.env.NEXT_PUBLIC_TELEVISION_CONTRACT || '0x46Fcd75Dd8cB75e678D078353e8C3fd32671f215') as `0x${string}`,
  usdcContract: (process.env.NEXT_PUBLIC_USDC_CONTRACT || '0x6c268B147FeB6d50a165F2357cE2eC57EF17d5B7') as `0x${string}`,
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  defaultChannel: process.env.NEXT_PUBLIC_DEFAULT_CHANNEL || 'gamesdonequick',
} as const;
