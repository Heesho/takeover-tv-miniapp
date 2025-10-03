import { http, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { env } from '@/utils/env';

// Select chain based on environment
const chain = env.chainId === 8453 ? base : baseSepolia;

export const config = createConfig({
  chains: [chain],
  transports: {
    [chain.id]: http(env.rpcUrl),
  },
  connectors: [
    // Farcaster Mini App connector - automatically connects when app runs in Farcaster
    // Provides access to user's Ethereum address and transaction signing
    farcasterMiniApp(),
  ],
});
