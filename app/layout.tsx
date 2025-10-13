import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import { MiniAppReady } from '@/components/MiniAppReady';
import { env } from '@/utils/env';
import './globals.css';

export const metadata: Metadata = {
  title: 'Take0ver TV',
  description: 'Community Controlled Television — take control and broadcast your stream',
  icons: {
    icon: '/icon.png',
  },
  openGraph: {
    images: ['/og-image.svg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {(() => {
          const appUrl = env.appUrl || '';
          const imageUrl = `${appUrl}/tv-embed.png`;
          const splashImageUrl = `${appUrl}/icon.png`;
          const miniapp = {
            version: '1',
            imageUrl,
            button: {
              title: 'Watch & Take0ver',
              action: {
                type: 'launch_miniapp',
                name: 'Take0ver TV',
                splashImageUrl,
                splashBackgroundColor: '#000000',
              },
            },
          };
          const frame = {
            version: '1',
            imageUrl,
            button: {
              title: 'Watch & Take0ver',
              action: {
                type: 'launch_frame',
                name: 'Take0ver TV',
                splashImageUrl,
                splashBackgroundColor: '#000000',
              },
            },
          };
          return (
            <>
              <meta name="fc:miniapp" content={JSON.stringify(miniapp)} />
              <meta name="fc:frame" content={JSON.stringify(frame)} />
            </>
          );
        })()}
        {/* Twitch Player API - loaded before user interaction */}
        <script src="https://player.twitch.tv/js/embed/v1.js" async></script>
      </head>
      <body>
        {/* Ensure Farcaster splash is dismissed promptly inside Mini App environments */}
        <MiniAppReady />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
