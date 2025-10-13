// Validate required envs without relying on dynamic process.env access on the client.
// Next.js inlines NEXT_PUBLIC_* at build time, but only for static property access.
// Dynamic reads like process.env[name] become undefined on the client. Avoid them.
function mustGetInline(val: string | undefined, name: string): string {
  if (!val) {
    const msg = `Missing required environment variable: ${name}`;
    // Only throw on the server to avoid breaking the Mini App splash dismissal
    // when a client bundle runs without inline envs for any reason.
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
      throw new Error(msg);
    }
    console.warn(msg);
    return '';
  }
  return val;
}

const raw = {
  NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID || '8453',
  NEXT_PUBLIC_TELEVISION_CONTRACT: process.env.NEXT_PUBLIC_TELEVISION_CONTRACT || '',
  NEXT_PUBLIC_USDC_CONTRACT: process.env.NEXT_PUBLIC_USDC_CONTRACT || '',
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || '',
  NEXT_PUBLIC_DEFAULT_CHANNEL: process.env.NEXT_PUBLIC_DEFAULT_CHANNEL || 'gamesdonequick',
  NEXT_PUBLIC_ALCHEMY_RPC_URL: process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || '',
};

// In production, enforce required vars are set explicitly (server-only throw, client warn).
const REQUIRED = {
  NEXT_PUBLIC_CHAIN_ID: mustGetInline(raw.NEXT_PUBLIC_CHAIN_ID, 'NEXT_PUBLIC_CHAIN_ID'),
  NEXT_PUBLIC_TELEVISION_CONTRACT: mustGetInline(raw.NEXT_PUBLIC_TELEVISION_CONTRACT, 'NEXT_PUBLIC_TELEVISION_CONTRACT'),
  NEXT_PUBLIC_USDC_CONTRACT: mustGetInline(raw.NEXT_PUBLIC_USDC_CONTRACT, 'NEXT_PUBLIC_USDC_CONTRACT'),
  NEXT_PUBLIC_APP_URL: mustGetInline(raw.NEXT_PUBLIC_APP_URL, 'NEXT_PUBLIC_APP_URL'),
};

export const env = {
  chainId: parseInt(REQUIRED.NEXT_PUBLIC_CHAIN_ID || '8453', 10),
  televisionContract: (REQUIRED.NEXT_PUBLIC_TELEVISION_CONTRACT || '0x0000000000000000000000000000000000000000') as `0x${string}`,
  usdcContract: (REQUIRED.NEXT_PUBLIC_USDC_CONTRACT || '0x0000000000000000000000000000000000000000') as `0x${string}`,
  appUrl: REQUIRED.NEXT_PUBLIC_APP_URL,
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
