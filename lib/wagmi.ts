import { http, createConfig } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { env } from '@/utils/env';

// Create Wagmi config for Base Sepolia
// Using explicit configuration to ensure proper chain targeting
export const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(env.rpcUrl, {
      batch: {
        wait: 100, // Batch RPC calls for better performance
      },
      timeout: 30_000, // 30 second timeout for better reliability
    }),
  },
  connectors: [farcasterMiniApp()],
  multiInjectedProviderDiscovery: false,
  ssr: false, // Disable SSR to prevent hydration issues
});
