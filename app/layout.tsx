import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Takeover TV',
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
        <meta name="fc:miniapp" content='{"version":"1","imageUrl":"https://placehold.co/600x400/000000/FF00FF?text=Takeover+TV","button":{"title":"Watch & Takeover","action":{"type":"launch_miniapp","name":"Takeover TV","splashImageUrl":"https://placehold.co/200x200/000000/FF00FF?text=TV","splashBackgroundColor":"#000000"}}}' />
        <meta name="fc:frame" content='{"version":"1","imageUrl":"https://placehold.co/600x400/000000/FF00FF?text=Takeover+TV","button":{"title":"Watch & Takeover","action":{"type":"launch_frame","name":"Takeover TV","splashImageUrl":"https://placehold.co/200x200/000000/FF00FF?text=TV","splashBackgroundColor":"#000000"}}}' />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
