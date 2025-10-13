function mustGet(name: string): string {
  const val = process.env[name];
  if (!val) {
    const msg = `Missing required environment variable: ${name}`;
    if (process.env.NODE_ENV === 'production') throw new Error(msg);
    console.warn(msg);
  }
  return val || '';
}

const raw = {
  NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID || '8453',
  NEXT_PUBLIC_TELEVISION_CONTRACT: process.env.NEXT_PUBLIC_TELEVISION_CONTRACT || '',
  NEXT_PUBLIC_USDC_CONTRACT: process.env.NEXT_PUBLIC_USDC_CONTRACT || '',
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || '',
  NEXT_PUBLIC_DEFAULT_CHANNEL: process.env.NEXT_PUBLIC_DEFAULT_CHANNEL || 'gamesdonequick',
  NEXT_PUBLIC_ALCHEMY_RPC_URL: process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || '',
};

// In production, enforce required vars are set explicitly.
if (process.env.NODE_ENV === 'production') {
  mustGet('NEXT_PUBLIC_CHAIN_ID');
  mustGet('NEXT_PUBLIC_TELEVISION_CONTRACT');
  mustGet('NEXT_PUBLIC_USDC_CONTRACT');
  mustGet('NEXT_PUBLIC_APP_URL');
}

export const env = {
  chainId: parseInt(raw.NEXT_PUBLIC_CHAIN_ID || '8453', 10),
  televisionContract: (raw.NEXT_PUBLIC_TELEVISION_CONTRACT || '0x0000000000000000000000000000000000000000') as `0x${string}`,
  usdcContract: (raw.NEXT_PUBLIC_USDC_CONTRACT || '0x0000000000000000000000000000000000000000') as `0x${string}`,
  appUrl: raw.NEXT_PUBLIC_APP_URL,
  defaultChannel: raw.NEXT_PUBLIC_DEFAULT_CHANNEL,
  // Optional RPC. When empty, wagmi will use default/public.
  alchemyRpcUrl: raw.NEXT_PUBLIC_ALCHEMY_RPC_URL,
} as const;

export function getAppHostname(): string | null {
  const url = env.appUrl;
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.hostname;
  } catch {
    return null;
  }
}
