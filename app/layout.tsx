import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { env } from '@/utils/env';

export const metadata: Metadata = {
  title: 'TakeoverTV - Decentralized Community Television',
  description: 'A single, shared screen for the Farcaster community. Take control by paying a continuously decaying price.',
  openGraph: {
    title: 'TakeoverTV',
    description: 'Take control of the channel',
    images: ['/og-image.png'],
  },
  other: {
    'fc:miniapp': JSON.stringify({
      version: '1',
      imageUrl: `https://${env.appDomain}/og-image.png`,
      button: {
        title: '📺 Watch Now',
        action: {
          type: 'launch_miniapp',
          name: env.appName,
          url: `https://${env.appDomain}`,
          splashImageUrl: `https://${env.appDomain}/logo.png`,
          splashBackgroundColor: '#000000',
        },
      },
    }),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
