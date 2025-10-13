import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { env } from '@/utils/env';

export const config = createConfig({
  chains: [base],
  transports: {
    // Prefer explicit RPC if provided; otherwise use chain defaults/public RPC.
    [base.id]: env.alchemyRpcUrl ? http(env.alchemyRpcUrl) : http(),
  },
  connectors: [farcasterMiniApp()],
});
