import { http, createConfig } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';

const ALCHEMY_RPC_URL = 'https://base-sepolia.g.alchemy.com/v2/maEamUgoT5NkZA3J9bXV9';

export const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(ALCHEMY_RPC_URL),
  },
  connectors: [farcasterMiniApp()],
});
