// Test script to validate takeover parameters match exactly what the app sends

const youtubeUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
const address = '0x742D35CC6634c0532925A3b844BC9E7595F0BEb0';
const epochId = 0; // From getSlot0
const currentPrice = 985070n; // From getPrice
const DEADLINE_SECONDS = 300;
const SLIPPAGE_PERCENT = 5;

// Calculate deadline (same as TakeoverForm.tsx line 250)
const deadline = BigInt(Math.floor(Date.now() / 1000) + DEADLINE_SECONDS);

// Calculate maxPaymentAmount (same as TakeoverForm.tsx line 252)
const maxPaymentAmount = currentPrice === 0n ? 0n : currentPrice + (currentPrice * BigInt(SLIPPAGE_PERCENT)) / BigInt(100);

console.log('📋 Takeover Parameters (matching TakeoverForm.tsx):');
console.log('');
console.log('Parameters as JavaScript values:');
console.log('  youtubeUrl:', youtubeUrl);
console.log('  address:', address);
console.log('  epochId (before BigInt):', epochId, '(type:', typeof epochId, ')');
console.log('  epochId (after BigInt):', BigInt(epochId), '(type:', typeof BigInt(epochId), ')');
console.log('  deadline:', deadline.toString(), '(', new Date(Number(deadline) * 1000).toISOString(), ')');
console.log('  maxPaymentAmount:', maxPaymentAmount.toString(), '(', (Number(maxPaymentAmount) / 1e6).toFixed(6), 'USDC )');
console.log('');

console.log('Function call args array:');
console.log('[');
console.log('  "' + youtubeUrl + '",');
console.log('  "' + address + '",');
console.log('  ' + BigInt(epochId) + 'n,');
console.log('  ' + deadline + 'n,');
console.log('  ' + maxPaymentAmount + 'n');
console.log(']');
console.log('');

console.log('Validation checks:');
console.log('  ✓ URL is string:', typeof youtubeUrl === 'string');
console.log('  ✓ Address is string:', typeof address === 'string');
console.log('  ✓ EpochId converts to bigint:', typeof BigInt(epochId) === 'bigint');
console.log('  ✓ Deadline is bigint:', typeof deadline === 'bigint');
console.log('  ✓ MaxPayment is bigint:', typeof maxPaymentAmount === 'bigint');
console.log('  ✓ Address is 42 chars (0x + 40):', address.length === 42);
console.log('  ✓ Address starts with 0x:', address.startsWith('0x'));
