#!/usr/bin/env node

/**
 * Validates that the project is properly configured
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_CHAIN_ID',
  'NEXT_PUBLIC_TELEVISION_CONTRACT',
  'NEXT_PUBLIC_USDC_CONTRACT',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_DEFAULT_CHANNEL',
];

const REQUIRED_FILES = [
  '.env.local',
  'package.json',
  'tsconfig.json',
  'next.config.ts',
  'tailwind.config.ts',
  'app/page.tsx',
  'app/layout.tsx',
  'app/globals.css',
  'public/logo.svg',
  'public/.well-known/farcaster.json',
];

console.log('🔍 Checking project setup...\n');

// Check required files
console.log('📁 Checking required files:');
let filesOk = true;
for (const file of REQUIRED_FILES) {
  const filePath = path.join(__dirname, '..', file);
  const exists = fs.existsSync(filePath);
  console.log(`  ${exists ? '✓' : '✗'} ${file}`);
  if (!exists) filesOk = false;
}

console.log();

// Check environment variables
console.log('🌍 Checking environment variables:');
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  let envOk = true;

  for (const envVar of REQUIRED_ENV_VARS) {
    const regex = new RegExp(`^${envVar}=.+`, 'm');
    const found = regex.test(envContent);
    console.log(`  ${found ? '✓' : '✗'} ${envVar}`);
    if (!found) envOk = false;
  }

  if (!envOk) {
    console.log('\n⚠️  Some environment variables are missing!');
    console.log('   Copy .env.local.example to .env.local and fill in the values.');
  }
} else {
  console.log('  ✗ .env.local file not found');
  console.log('\n⚠️  Create .env.local from .env.local.example');
  filesOk = false;
}

console.log();

// Final status
if (filesOk) {
  console.log('✅ Project setup is complete!\n');
  console.log('Next steps:');
  console.log('  1. Run "npm install" to install dependencies');
  console.log('  2. Run "npm run check:contract" to verify smart contract access');
  console.log('  3. Run "npm run dev" to start the development server');
  process.exit(0);
} else {
  console.log('❌ Project setup is incomplete. Please fix the issues above.\n');
  process.exit(1);
}
