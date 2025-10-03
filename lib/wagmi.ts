import { http, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { env } from '@/utils/env';

// Select chain based on environment
const isMainnet = env.chainId === 8453;

export const config = isMainnet
  ? createConfig({
      chains: [base],
      transports: {
        [base.id]: http(env.rpcUrl),
      },
      connectors: [
        // Farcaster Mini App connector - automatically connects when app runs in Farcaster
        // Provides access to user's Ethereum address and transaction signing
        farcasterMiniApp(),
      ],
    })
  : createConfig({
      chains: [baseSepolia],
      transports: {
        [baseSepolia.id]: http(env.rpcUrl),
      },
      connectors: [
        // Farcaster Mini App connector - automatically connects when app runs in Farcaster
        // Provides access to user's Ethereum address and transaction signing
        farcasterMiniApp(),
      ],
    });
