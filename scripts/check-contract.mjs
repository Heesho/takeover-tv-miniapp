import { createPublicClient, http, getAddress } from 'viem';
import { baseSepolia } from 'viem/chains';

const TELEVISION_ADDRESS = '0x46Fcd75Dd8cB75e678D078353e8C3fd32671f215';
const RPC_URL = 'https://sepolia.base.org';

const televisionABI = [
  {
    type: 'function',
    name: 'getSlot0',
    inputs: [],
    outputs: [
      { name: '', type: 'tuple', components: [
        { name: 'locked', type: 'uint8' },
        { name: 'epochId', type: 'uint16' },
        { name: 'initPrice', type: 'uint192' },
        { name: 'startTime', type: 'uint40' },
        { name: 'owner', type: 'address' },
        { name: 'uri', type: 'string' },
      ]},
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getPrice',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'quote',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'takeover',
    inputs: [
      { name: 'uri', type: 'string' },
      { name: 'channelOwner', type: 'address' },
      { name: 'epochId', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
      { name: 'maxPaymentAmount', type: 'uint256' },
    ],
    outputs: [{ name: 'paymentAmount', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
];

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(RPC_URL),
});

async function checkContract() {
  console.log('🔍 Checking Television Contract...');
  console.log('Address:', TELEVISION_ADDRESS);
  console.log('Network: Base Sepolia (Chain ID: 84532)');
  console.log('RPC:', RPC_URL);
  console.log('');

  try {
    // Check if contract exists
    const code = await client.getBytecode({ address: TELEVISION_ADDRESS });
    if (!code || code === '0x') {
      console.error('❌ ERROR: No contract found at this address!');
      return;
    }
    console.log('✅ Contract exists (bytecode found)');
    console.log('');

    // Get slot0 data
    console.log('📊 Reading getSlot0()...');
    const slot0 = await client.readContract({
      address: TELEVISION_ADDRESS,
      abi: televisionABI,
      functionName: 'getSlot0',
    });

    console.log('Slot0 Data:');
    console.log('  - locked:', slot0.locked);
    console.log('  - epochId:', slot0.epochId.toString());
    console.log('  - initPrice:', slot0.initPrice.toString());
    console.log('  - startTime:', slot0.startTime.toString(), '(', new Date(Number(slot0.startTime) * 1000).toISOString(), ')');
    console.log('  - owner:', slot0.owner);
    console.log('  - uri:', slot0.uri);
    console.log('');

    // Get current price
    console.log('💰 Reading getPrice()...');
    const price = await client.readContract({
      address: TELEVISION_ADDRESS,
      abi: televisionABI,
      functionName: 'getPrice',
    });
    console.log('Current Price:', price.toString());
    console.log('Price (formatted):', (Number(price) / 1e6).toFixed(2), 'USDC');
    console.log('');

    // Get quote token
    console.log('🪙 Reading quote()...');
    const quoteToken = await client.readContract({
      address: TELEVISION_ADDRESS,
      abi: televisionABI,
      functionName: 'quote',
    });
    console.log('Quote Token:', quoteToken);
    console.log('');

    // Test simulating a takeover (without actually sending)
    console.log('🧪 Simulating takeover call...');
    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const testAddress = getAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0');
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 300); // 5 minutes from now
    const maxPayment = price > 0n ? price + (price * 5n) / 100n : 0n;

    console.log('Test Parameters:');
    console.log('  - url:', testUrl);
    console.log('  - recipient:', testAddress);
    console.log('  - epochId:', slot0.epochId.toString());
    console.log('  - deadline:', deadline.toString());
    console.log('  - maxPayment:', maxPayment.toString());
    console.log('');

    try {
      await client.simulateContract({
        address: TELEVISION_ADDRESS,
        abi: televisionABI,
        functionName: 'takeover',
        args: [testUrl, testAddress, slot0.epochId, deadline, maxPayment],
        account: testAddress,
      });
      console.log('✅ Takeover simulation successful (no obvious errors)');
    } catch (error) {
      console.log('❌ Takeover simulation failed:');
      console.log('Error:', error.message);
      if (error.cause) {
        console.log('Cause:', error.cause);
      }
      if (error.data) {
        console.log('Data:', error.data);
      }
    }

  } catch (error) {
    console.error('❌ Error checking contract:', error);
  }
}

checkContract();
