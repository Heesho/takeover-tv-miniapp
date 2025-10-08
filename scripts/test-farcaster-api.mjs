#!/usr/bin/env node

/**
 * Test script to verify Farcaster profile fetching is working
 *
 * Usage:
 *   node scripts/test-farcaster-api.mjs <ethereum_address>
 *
 * Example:
 *   node scripts/test-farcaster-api.mjs 0x849151d7D0bF1F34b70d5caD5149D28CC2308bf1
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Load .env.local manually (no dotenv dependency needed)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Simple .env.local parser
function loadEnvFile(path) {
  try {
    const content = readFileSync(path, 'utf-8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          process.env[key.trim()] = value;
        }
      }
    });
  } catch (error) {
    // .env.local might not exist yet
  }
}

loadEnvFile(join(projectRoot, '.env.local'));

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

// Test addresses (known Farcaster users)
const TEST_ADDRESSES = {
  'jessepollak.eth': '0x849151d7D0bF1F34b70d5caD5149D28CC2308bf1',
  'dwr.eth': '0x6B0bFDdF5C6A9E9B1E3d8B8a3A3c7d8a3A3c7d8a',
  'vitalik.eth': '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
};

async function testFarcasterAPI(address) {
  console.log('\n🧪 Testing Farcaster Profile API\n');
  console.log('━'.repeat(50));

  // Check API key
  if (!NEYNAR_API_KEY) {
    console.error('❌ NEYNAR_API_KEY not found in .env.local');
    console.error('\nPlease:');
    console.error('1. Create a .env.local file in project root');
    console.error('2. Add: NEYNAR_API_KEY=your_key_here');
    console.error('3. Get a key at: https://dev.neynar.com/\n');
    process.exit(1);
  }

  console.log('✅ API Key found');
  console.log(`🔍 Testing address: ${address}\n`);

  try {
    // Make request to Neynar
    const normalizedAddress = address.toLowerCase();
    const url = `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${normalizedAddress}`;

    console.log('📡 Fetching from Neynar API...');

    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
        api_key: NEYNAR_API_KEY,
      },
    });

    console.log(`📥 Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error Response: ${errorText}`);

      if (response.status === 404) {
        console.log('⚠️  No Farcaster profile found for this address');
        console.log('   This is normal if the address has no Farcaster account\n');
        return;
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`📦 Raw API Response:`, JSON.stringify(data, null, 2));

    // Response is an object with addresses as keys
    const users = data[normalizedAddress];

    if (!users || users.length === 0) {
      console.log('⚠️  No Farcaster profile found for this address');
      console.log('   The address might not have a verified Farcaster account\n');
      return;
    }

    const user = users[0];

    console.log('✅ Profile found!\n');
    console.log('Profile Details:');
    console.log('━'.repeat(50));
    console.log(`👤 Display Name: ${user.display_name}`);
    console.log(`🏷️  Username: @${user.username}`);
    console.log(`🆔 FID: ${user.fid}`);
    console.log(`🖼️  Profile Picture: ${user.pfp_url}`);

    if (user.verified_addresses?.eth_addresses) {
      console.log(`\n✅ Verified Addresses (${user.verified_addresses.eth_addresses.length}):`);
      user.verified_addresses.eth_addresses.forEach((addr, i) => {
        console.log(`   ${i + 1}. ${addr}`);
      });
    }

    console.log('\n' + '━'.repeat(50));
    console.log('✅ Test successful! The API is working correctly.\n');

  } catch (error) {
    console.error('\n❌ Error testing API:');
    console.error(`   ${error.message}\n`);

    if (error.message.includes('401')) {
      console.error('💡 Hint: Your API key might be invalid');
      console.error('   Check your key at: https://dev.neynar.com/\n');
    }

    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: node scripts/test-farcaster-api.mjs <ethereum_address>');
  console.log('\nTest with known Farcaster users:');
  Object.entries(TEST_ADDRESSES).forEach(([name, addr]) => {
    console.log(`  ${name}: ${addr}`);
  });
  console.log('\nExample:');
  console.log('  node scripts/test-farcaster-api.mjs 0x849151d7D0bF1F34b70d5caD5149D28CC2308bf1\n');
  process.exit(1);
}

const testAddress = args[0];

// Validate Ethereum address format
if (!/^0x[a-fA-F0-9]{40}$/.test(testAddress)) {
  console.error('❌ Invalid Ethereum address format');
  console.error('   Address should be: 0x followed by 40 hexadecimal characters\n');
  process.exit(1);
}

testFarcasterAPI(testAddress);
