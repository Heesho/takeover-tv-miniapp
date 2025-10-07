import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { env } from '@/utils/env';

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(env.alchemyRpcUrl || undefined),
  },
  connectors: [farcasterMiniApp()],
});
