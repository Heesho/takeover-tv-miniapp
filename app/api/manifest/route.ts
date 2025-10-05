import { NextResponse } from 'next/server';
import { env } from '@/utils/env';

export async function GET() {
  const manifest = {
    // Account association MUST be signed using the Farcaster manifest tool
    // Visit: https://farcaster.xyz/~/developers/mini-apps/manifest
    // Enter your domain and sign with your Farcaster account
    accountAssociation: {
      header: 'REPLACE_WITH_YOUR_SIGNED_HEADER',
      payload: 'REPLACE_WITH_YOUR_SIGNED_PAYLOAD',
      signature: 'REPLACE_WITH_YOUR_SIGNED_SIGNATURE',
    },
    miniapp: {
      version: '1',
      name: env.appName,
      iconUrl: `https://${env.appDomain}/logo.png`,
      homeUrl: `https://${env.appDomain}`,
      imageUrl: `https://${env.appDomain}/og-image.png`,
      buttonTitle: '📺 Watch',
      splashImageUrl: `https://${env.appDomain}/logo.png`,
      splashBackgroundColor: '#000000',

      // Optional but recommended fields for app discovery
      subtitle: 'Community-controlled television',
      description: 'A decentralized, single-channel television network. Take control by paying a continuously decaying price.',
      screenshotUrls: [
        `https://${env.appDomain}/screenshot1.png`,
      ],
      primaryCategory: 'social',
      tags: ['television', 'video', 'community', 'auction'],

      // OpenGraph metadata for social sharing
      heroImageUrl: `https://${env.appDomain}/og-image.png`,
      tagline: 'Take control of the channel',
      ogTitle: 'TakeoverTV',
      ogDescription: 'A decentralized, community-controlled TV channel',
      ogImageUrl: `https://${env.appDomain}/og-image.png`,

      // Add webhookUrl when ready to enable notifications
      // webhookUrl: `https://${env.appDomain}/api/webhook`,

      // Specify required chains if your app needs specific blockchain support
      // requiredChains: ['eip155:8453'], // Base mainnet

      // Specify required capabilities if your app needs specific SDK features
      // requiredCapabilities: ['wallet.getEthereumProvider', 'actions.composeCast'],
    },
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
