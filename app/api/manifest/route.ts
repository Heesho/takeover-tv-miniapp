import { NextResponse } from 'next/server';
import { env } from '@/utils/env';

export async function GET() {
  // Hardcoded account association per your provided values
  const manifest = {
    accountAssociation: {
      header:
        'eyJmaWQiOjI3MjEwOSwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDQ5REI1QTFjOWZlRjBFMkY5OTVCNDZiMEI3MWJFQmJEOTEyQkYwZTMifQ',
      payload: 'eyJkb21haW4iOiJ0YWtlMHZlci10di52ZXJjZWwuYXBwIn0',
      signature:
        '9GQ+axk6y2AiY+MzlpFjcfBRqfOqY5bVIEVIY4tu/J9/AuXazWYdkhPZ/n6onkQMfo9/ghIyYr2RR5RhRIBa3hs=',
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
