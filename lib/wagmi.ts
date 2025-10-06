import { http, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { env } from '@/utils/env';

// Select chain based on environment
const isMainnet = env.chainId === 8453;

// Create separate configs for each environment to ensure proper typing
export const config = isMainnet
  ? createConfig({
      chains: [base],
      transports: {
        [base.id]: http(env.rpcUrl),
      },
      connectors: [farcasterMiniApp()],
      multiInjectedProviderDiscovery: false,
    })
  : createConfig({
      chains: [baseSepolia],
      transports: {
        [baseSepolia.id]: http(env.rpcUrl),
      },
      connectors: [farcasterMiniApp()],
      multiInjectedProviderDiscovery: false,
    });
