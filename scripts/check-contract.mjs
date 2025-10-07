#!/usr/bin/env node

/**
 * Validates that the Television smart contract is accessible and working
 */

import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

const televisionAbi = [
  {
    inputs: [],
    name: 'getSlot0',
    outputs: [
      {
        components: [
          { internalType: 'uint8', name: 'locked', type: 'uint8' },
          { internalType: 'uint16', name: 'epochId', type: 'uint16' },
          { internalType: 'uint192', name: 'initPrice', type: 'uint192' },
          { internalType: 'uint40', name: 'startTime', type: 'uint40' },
          { internalType: 'address', name: 'owner', type: 'address' },
          { internalType: 'string', name: 'uri', type: 'string' },
        ],
        internalType: 'struct Television.Slot0',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getPrice',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

const TELEVISION_CONTRACT = '0x46Fcd75Dd8cB75e678D078353e8C3fd32671f215';
const ALCHEMY_RPC_URL = 'https://base-sepolia.g.alchemy.com/v2/maEamUgoT5NkZA3J9bXV9';

console.log('🔍 Checking Television contract on Base Sepolia...\n');

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(ALCHEMY_RPC_URL),
});

try {
  // Check if contract exists
  const code = await client.getBytecode({ address: TELEVISION_CONTRACT });

  if (!code || code === '0x') {
    console.log('❌ Contract not found at address:', TELEVISION_CONTRACT);
    console.log('   Make sure you are using the correct contract address.');
    process.exit(1);
  }

  console.log('✓ Contract found at:', TELEVISION_CONTRACT);

  // Read slot0 (channel data)
  const slot0 = await client.readContract({
    address: TELEVISION_CONTRACT,
    abi: televisionAbi,
    functionName: 'getSlot0',
  });

  console.log('\n📺 Current Channel Info (Slot0):');
  console.log('  Locked:', slot0.locked);
  console.log('  Epoch ID:', slot0.epochId);
  console.log('  Init Price:', slot0.initPrice.toString(), 'USDC (smallest unit)');
  console.log('  Start Time:', new Date(Number(slot0.startTime) * 1000).toLocaleString());
  console.log('  Owner:', slot0.owner);
  console.log('  URI:', slot0.uri);

  // Get current price
  const currentPrice = await client.readContract({
    address: TELEVISION_CONTRACT,
    abi: televisionAbi,
    functionName: 'getPrice',
  });

  console.log('\n💰 Current Takeover Price:', currentPrice.toString(), 'USDC (smallest unit)');
  console.log('   (≈ $' + (Number(currentPrice) / 1_000_000).toFixed(6) + ')');

  console.log('\n✅ Contract is working correctly!\n');
  process.exit(0);
} catch (error) {
  console.error('❌ Error checking contract:', error.message);
  console.error('\nFull error:', error);
  process.exit(1);
}
