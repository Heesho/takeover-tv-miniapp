import { NextResponse } from 'next/server';
import { env } from '@/utils/env';

export async function GET() {
  const manifest = {
    accountAssociation: {
      header:
        '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      payload: '0x0000000000000000000000000000000000000000000000000000000000000000',
      signature:
        '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    },
    miniapp: {
      version: '1',
      name: 'Take0ver TV',
      iconUrl: `${env.appUrl}/icon.png`,
      homeUrl: env.appUrl,
      splashImageUrl: `${env.appUrl}/icon.png`,
      splashBackgroundColor: '#000000',
    },
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
