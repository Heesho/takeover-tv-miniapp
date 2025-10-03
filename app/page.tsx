'use client';

import { useEffect, useState } from 'react';
import { useAccount, useReconnect } from 'wagmi';
import { sdk, type Context } from '@farcaster/miniapp-sdk';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ChannelInfo } from '@/components/ChannelInfo';
import { TakeoverForm } from '@/components/TakeoverForm';
import { useCurrentChannel, useCurrentPrice, useQuoteToken, useTakeoverEvents } from '@/hooks/useTelevision';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const { reconnect } = useReconnect();
  const [farcasterUser, setFarcasterUser] = useState<Context['user'] | null>(null);
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
      {/* Header */}
      <header className="bg-gray-950 border-b border-gray-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-white text-xl md:text-2xl font-bold tracking-tight">
            TakeoverTV
          </h1>
          {!mounted ? (
            <div className="text-gray-400 text-sm">Loading...</div>
          ) : farcasterUser ? (
            <div className="flex items-center gap-3">
              {/* Farcaster User Profile */}
              <div className="flex items-center gap-2">
                {farcasterUser.pfpUrl && (
                  <img
                    src={farcasterUser.pfpUrl}
                    alt={farcasterUser.displayName || farcasterUser.username || 'User'}
                    className="w-8 h-8 rounded-full border-2 border-purple-500"
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
              {/* Wallet Connection Status */}
              {isConnected && address && (
                <div className="flex flex-col items-end gap-1 ml-2 pl-2 border-l border-gray-700">
                  <div className="text-green-500 text-xs flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Wallet
                  </div>
                  <div className="text-gray-400 text-xs font-mono">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-400 text-sm">Connecting...</div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Video Player - Full width, 16:9 aspect ratio */}
        <div className="w-full bg-black">
          <VideoPlayer uri={uri} isLoading={isChannelLoading} />
        </div>

        {/* Channel Information */}
        <ChannelInfo owner={owner} price={price} quoteTokenDecimals={6} />

        {/* Takeover Form */}
        <TakeoverForm
          currentPrice={price}
          quoteToken={quoteToken}
          onSuccess={refetchChannel}
        />

        {/* Info Section */}
        <div className="px-4 py-6 md:px-6 md:py-8 bg-gray-950 mt-auto">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-gray-400 text-sm md:text-base">
              A decentralized, community-controlled TV channel.
            </p>
            <p className="text-gray-500 text-xs md:text-sm mt-2">
              Price decays continuously. Anyone can take control at any time.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
