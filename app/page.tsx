'use client';

import { useEffect, useState } from 'react';
import { useAccount, useReconnect } from 'wagmi';
import { sdk } from '@farcaster/miniapp-sdk';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ChannelInfo } from '@/components/ChannelInfo';
import { TakeoverForm } from '@/components/TakeoverForm';
import { useCurrentChannel, useCurrentPrice, useQuoteToken, useTakeoverEvents } from '@/hooks/useTelevision';

type FarcasterContext = Awaited<typeof sdk.context>;

export default function Home() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const { reconnect } = useReconnect();
  const [farcasterUser, setFarcasterUser] = useState<FarcasterContext['user'] | null>(null);
  const { owner, uri, isLoading: isChannelLoading, refetch: refetchChannel } = useCurrentChannel();
  const { price, isLoading: isPriceLoading } = useCurrentPrice();
  const quoteToken = useQuoteToken();

  // Listen for takeover events
  useTakeoverEvents((channelOwner, paymentAmount) => {
    console.log('Takeover detected:', { channelOwner, paymentAmount });
    refetchChannel();
  });

  // Set mounted state on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize SDK and auto-connect to Farcaster wallet
  useEffect(() => {
    if (!mounted) return;

    const init = async () => {
      try {
        // Get SDK context - contains Farcaster user info (it's a Promise)
        const context = await sdk.context;
        console.log('Farcaster context:', {
          user: context.user,
          client: context.client,
          location: context.location,
        });

        // Store Farcaster user info for display
        setFarcasterUser(context.user);

        // Auto-reconnect to Farcaster wallet using wagmi's reconnect
        // This works with the farcasterMiniApp connector automatically
        if (!isConnected) {
          try {
            await reconnect();
            console.log('Reconnected to Farcaster wallet');
          } catch (error) {
            console.error('Failed to reconnect to Farcaster wallet:', error);
          }
        }

        // Call ready() to hide splash screen - MUST be called after initialization
        await sdk.actions.ready();
      } catch (error) {
        console.error('Initialization error:', error);
        // Still call ready() even if there's an error to prevent infinite splash
        try {
          await sdk.actions.ready();
        } catch (e) {
          console.error('Failed to call ready:', e);
        }
      }
    };

    init();
  }, [mounted, isConnected, reconnect]);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header - TV Style */}
      <header className="bg-gradient-to-b from-gray-900 to-black border-b-4 border-gray-700 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <h1 className="text-white text-xl md:text-2xl font-bold tracking-wider uppercase">
              TakeoverTV
            </h1>
          </div>
          {!mounted ? (
            <div className="text-gray-400 text-sm">Loading...</div>
          ) : farcasterUser ? (
            <div className="flex items-center gap-2">
              {farcasterUser.pfpUrl && (
                <img
                  src={farcasterUser.pfpUrl}
                  alt={farcasterUser.displayName || farcasterUser.username || 'User'}
                  className="w-8 h-8 rounded-full border-2 border-gray-600"
                />
              )}
              <div className="flex flex-col items-start">
                <div className="text-white text-sm font-medium">
                  {farcasterUser.displayName || farcasterUser.username || 'Anonymous'}
                </div>
                {farcasterUser.username && (
                  <div className="text-gray-400 text-xs">
                    @{farcasterUser.username}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-sm">Connecting...</div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Video Player - TV Frame */}
        <div className="w-full bg-black p-2 md:p-3">
          <div className="max-w-4xl mx-auto">
            <div className="border-4 border-gray-800 rounded overflow-hidden bg-black">
              <VideoPlayer uri={uri} isLoading={isChannelLoading} />
            </div>
          </div>
        </div>

        {/* Channel Information */}
        <ChannelInfo owner={owner} price={price} quoteTokenDecimals={6} />

        {/* Takeover Form */}
        <TakeoverForm
          currentPrice={price}
          quoteToken={quoteToken}
          onSuccess={refetchChannel}
        />
      </main>
    </div>
  );
}
