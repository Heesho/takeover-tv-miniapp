'use client';

import { useEffect, useState } from 'react';
import { useAccount, useReconnect } from 'wagmi';
import { sdk } from '@farcaster/miniapp-sdk';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ChannelInfo } from '@/components/ChannelInfo';
import { TakeoverForm } from '@/components/TakeoverForm';
import { StartOverlay } from '@/components/StartOverlay';
import { useCurrentChannel, useCurrentPrice, useQuoteToken, useTakeoverEvents } from '@/hooks/useTelevision';

type FarcasterContext = Awaited<typeof sdk.context>;

export default function Home() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
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

  // Show start overlay until user clicks
  if (!hasStarted) {
    return <StartOverlay onStart={() => setHasStarted(true)} />;
  }

  return (
    <div className="h-screen bg-black flex flex-col app-fade-in overflow-hidden">
      {/* Header - Enhanced TV Style */}
      <header className="relative bg-black px-3 py-2 border-b border-gray-800 flex-shrink-0">
        <div className="absolute inset-0 scanlines opacity-10 pointer-events-none" />
        <div className="max-w-6xl mx-auto flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            {/* Broadcast indicator */}
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
              <div className="text-red-500 text-[8px] font-bold uppercase tracking-wider">Live</div>
            </div>

            {/* Logo */}
            <h1 className="text-white text-lg md:text-xl font-bold tracking-wider uppercase leading-none">
              TAKEOVER<span className="text-red-500">TV</span>
            </h1>
          </div>

          {/* User Profile */}
          {!mounted ? (
            <div className="flex items-center gap-2 bg-gray-800/50 px-2 py-1 rounded border border-gray-700">
              <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-pulse" />
              <div className="text-gray-400 text-xs">Connecting...</div>
            </div>
          ) : farcasterUser ? (
            <div className="flex items-center gap-2 bg-gray-800/50 px-2 py-1 rounded border border-gray-700">
              {farcasterUser.pfpUrl && (
                <img
                  src={farcasterUser.pfpUrl}
                  alt={farcasterUser.displayName || farcasterUser.username || 'User'}
                  className="w-6 h-6 rounded-full border border-gray-600"
                />
              )}
              <div className="flex flex-col items-start">
                <div className="text-white text-xs font-semibold leading-tight">
                  {farcasterUser.displayName || farcasterUser.username || 'Anonymous'}
                </div>
                {farcasterUser.username && (
                  <div className="text-gray-500 text-[10px] leading-tight">
                    @{farcasterUser.username}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-gray-800/50 px-2 py-1 rounded border border-gray-700">
              <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-pulse" />
              <div className="text-gray-400 text-xs">Connecting...</div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0">
        {/* Video Player - Full Width with frame effect */}
        <div className="w-full bg-black relative flex-shrink-0">
          <div className="absolute inset-0 pointer-events-none border-2 border-gray-900 z-10" />
          <VideoPlayer uri={uri} isLoading={isChannelLoading} />
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-black overflow-y-auto min-h-0">
          {/* Channel Information */}
          <ChannelInfo owner={owner} price={price} quoteTokenDecimals={6} />

          {/* Takeover Form */}
          <TakeoverForm
            currentPrice={price}
            quoteToken={quoteToken}
            onSuccess={refetchChannel}
          />
        </div>

        {/* Footer */}
        <footer className="relative bg-black px-3 py-2 border-t border-gray-800 flex-shrink-0">
          <div className="absolute inset-0 scanlines opacity-5 pointer-events-none" />
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">
              Community Controlled Television
            </p>
            <p className="text-gray-600 text-[9px] mt-0.5">
              Price doubles on takeover then drops to $0 over 24 hours
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
