import { http, createConfig } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { env } from '@/utils/env';

// Create Wagmi config for Base Sepolia
export const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(env.rpcUrl),
  },
  connectors: [farcasterMiniApp()],
});
