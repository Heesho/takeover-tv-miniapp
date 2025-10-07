import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Take0ver TV',
  description: 'Community Controlled Television - Take control and broadcast your stream',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="fc:miniapp" content='{"version":"1","imageUrl":"https://take0ver-tv.vercel.app/og-image.svg","button":{"title":"Watch & Take0ver","action":{"type":"launch_miniapp","name":"Take0ver TV","splashImageUrl":"https://take0ver-tv.vercel.app/icon.png","splashBackgroundColor":"#000000"}}}' />
        <meta name="fc:frame" content='{"version":"1","imageUrl":"https://take0ver-tv.vercel.app/og-image.svg","button":{"title":"Watch & Take0ver","action":{"type":"launch_frame","name":"Take0ver TV","splashImageUrl":"https://take0ver-tv.vercel.app/icon.png","splashBackgroundColor":"#000000"}}}' />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
