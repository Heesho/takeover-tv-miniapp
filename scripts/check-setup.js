#!/usr/bin/env node

/**
 * TakeoverTV Setup Validation Script
 * Run with: node scripts/check-setup.js
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const { green, red, yellow, blue, reset } = colors;

function log(message, color = reset) {
  console.log(`${color}${message}${reset}`);
}

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  if (exists) {
    log(`✓ ${description}`, green);
    return true;
  } else {
    log(`✗ ${description} - File not found: ${filePath}`, red);
    return false;
  }
}

function checkEnvVar(varName) {
  // Try to read from .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    log(`✗ .env.local file not found`, red);
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasVar = envContent.includes(`${varName}=`);

  if (hasVar && !envContent.includes(`${varName}=0x0`) && !envContent.includes(`${varName}=localhost`)) {
    log(`✓ ${varName} is configured`, green);
    return true;
  } else {
    log(`✗ ${varName} needs to be configured`, yellow);
    return false;
  }
}

function checkPackageJson() {
  const packagePath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packagePath)) {
    log(`✗ package.json not found`, red);
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const requiredDeps = [
    '@farcaster/miniapp-sdk',
    '@farcaster/miniapp-wagmi-connector',
    'wagmi',
    'viem',
    '@tanstack/react-query',
    'next',
    'react',
  ];

  let allPresent = true;
  for (const dep of requiredDeps) {
    if (packageJson.dependencies?.[dep]) {
      log(`✓ ${dep} installed`, green);
    } else {
      log(`✗ ${dep} not found in dependencies`, red);
      allPresent = false;
    }
  }

  return allPresent;
}

async function main() {
  log('\n🎬 TakeoverTV Setup Validation\n', blue);

  log('Checking Project Structure...', blue);
  const structureChecks = [
    checkFile('app/page.tsx', 'Main page'),
    checkFile('app/layout.tsx', 'Root layout'),
    checkFile('app/globals.css', 'Global styles'),
    checkFile('app/api/manifest/route.ts', 'Manifest API route'),
    checkFile('components/VideoPlayer.tsx', 'VideoPlayer component'),
    checkFile('components/ChannelInfo.tsx', 'ChannelInfo component'),
    checkFile('components/TakeoverForm.tsx', 'TakeoverForm component'),
    checkFile('components/Providers.tsx', 'Providers component'),
    checkFile('hooks/useTelevision.ts', 'Television hooks'),
    checkFile('contracts/television-abi.ts', 'Contract ABIs'),
    checkFile('lib/wagmi.ts', 'Wagmi config'),
    checkFile('utils/youtube.ts', 'YouTube utilities'),
    checkFile('utils/env.ts', 'Environment utilities'),
    checkFile('tailwind.config.ts', 'Tailwind config'),
    checkFile('next.config.ts', 'Next.js config'),
  ];

  log('\nChecking Dependencies...', blue);
  const depsOk = checkPackageJson();

  log('\nChecking Environment Variables...', blue);
  const envChecks = [
    checkEnvVar('NEXT_PUBLIC_TELEVISION_ADDRESS'),
    checkEnvVar('NEXT_PUBLIC_CHAIN_ID'),
    checkEnvVar('NEXT_PUBLIC_RPC_URL'),
    checkEnvVar('NEXT_PUBLIC_APP_DOMAIN'),
  ];

  log('\nChecking Required Images...', blue);
  const imageChecks = [
    fs.existsSync('public/logo.png') ? log('✓ logo.png present', green) || true : log('✗ logo.png missing (create 200x200px icon)', yellow) || false,
    fs.existsSync('public/og-image.png') ? log('✓ og-image.png present', green) || true : log('✗ og-image.png missing (create 1200x630px image)', yellow) || false,
    fs.existsSync('public/screenshot1.png') ? log('✓ screenshot1.png present', green) || true : log('✗ screenshot1.png missing (optional for now)', yellow) || false,
  ];

  const allStructureOk = structureChecks.every(Boolean);
  const allEnvOk = envChecks.every(Boolean);
  const criticalImagesOk = imageChecks.slice(0, 2).every(Boolean);

  log('\n' + '='.repeat(50), blue);
  log('Summary:', blue);
  log('='.repeat(50) + '\n', blue);

  if (allStructureOk) {
    log('✓ Project structure is complete', green);
  } else {
    log('✗ Some files are missing', red);
  }

  if (depsOk) {
    log('✓ All dependencies are installed', green);
  } else {
    log('✗ Some dependencies are missing - run npm install', red);
  }

  if (allEnvOk) {
    log('✓ Environment variables are configured', green);
  } else {
    log('✗ Environment variables need configuration', yellow);
    log('  Copy .env.local.example to .env.local and configure', yellow);
  }

  if (criticalImagesOk) {
    log('✓ Required images are present', green);
  } else {
    log('✗ Some required images are missing', yellow);
    log('  Create logo.png (200x200) and og-image.png (1200x630)', yellow);
  }

  log('');

  if (allStructureOk && depsOk && allEnvOk) {
    log('🎉 Setup looks good! Ready to run npm run dev', green);
    log('');
    log('Next steps:', blue);
    log('1. Create required images (logo.png, og-image.png)', blue);
    log('2. Run: npm run dev', blue);
    log('3. Test at http://localhost:3000', blue);
    log('4. Use ngrok to test in Farcaster', blue);
    log('');
  } else {
    log('⚠️  Setup incomplete. Please fix the issues above.', yellow);
    log('');
    log('Common fixes:', blue);
    log('• Run: npm install', blue);
    log('• Copy: .env.local.example to .env.local', blue);
    log('• Configure your contract address and chain ID', blue);
    log('');
  }
}

main().catch(console.error);
