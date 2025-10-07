'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { sdk } from '@farcaster/miniapp-sdk';
import { StartOverlay } from '@/components/StartOverlay';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ChannelInfo } from '@/components/ChannelInfo';
import { TakeoverForm } from '@/components/TakeoverForm';
import { useFarcasterContext } from '@/hooks/useFarcasterContext';
import { useTelevision } from '@/hooks/useTelevision';
import { env } from '@/utils/env';

export default function Home() {
  const [isPoweredOn, setIsPoweredOn] = useState(false);
  const { address } = useAccount();
  const { user, isLoading: isUserLoading } = useFarcasterContext();
  const {
    slot0,
    currentPrice,
    isLoading: isChannelLoading,
    userBalance,
    userAllowance,
    takeover,
    approve,
    isTakeoverPending,
    isApprovePending,
  } = useTelevision();

  // Log channel changes for debugging
  useEffect(() => {
    if (slot0) {
      console.log('📺 Channel updated from contract:', {
        owner: slot0.owner,
        uri: slot0.uri,
        price: currentPrice.toString(),
      });
    }
  }, [slot0?.uri, slot0?.owner, currentPrice]);

  // Call sdk.actions.ready() as soon as the app finishes loading
  useEffect(() => {
    // Only call ready() after initial data loading is complete
    if (!isUserLoading && !isChannelLoading) {
      sdk.actions.ready()
        .then(() => {
          console.log('Mini App ready called successfully');
        })
        .catch((error) => {
          console.error('Failed to call sdk.actions.ready():', error);
        });
    }
  }, [isUserLoading, isChannelLoading]);

  const handlePowerOn = async () => {
    setIsPoweredOn(true);
  };

  const handlePowerOff = () => {
    setIsPoweredOn(false);
  };

  const handleTakeover = async (url: string) => {
    await takeover(url);
  };

  const handleApprove = async (amount: bigint) => {
    await approve(amount);
  };

  // Show loading state
  if (isUserLoading || isChannelLoading) {
    return (
      <div className="bg-black text-white flex items-center justify-center min-h-screen">
        <p className="text-2xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-black text-white flex items-center justify-center min-h-screen p-2">
      <div className="w-full max-w-md mx-auto h-auto aspect-[9/19.5] max-h-[95vh] flex flex-col">
        {/* Power On Screen */}
        {!isPoweredOn ? (
          <div className="flex flex-col items-center justify-around h-full tv-border p-4 text-center">
            <StartOverlay onStart={handlePowerOn} />
          </div>
        ) : (
          /* Main App Screen */
          <div className="flex flex-col h-full space-y-3 py-3 tv-border">
            {/* Header */}
            <div className="flex items-center justify-between px-3 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePowerOff}
                  className="p-1 text-retro-pink hover:opacity-80 transition-opacity"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.636 5.636a9 9 0 1012.728 0M12 3v9"
                    />
                  </svg>
                </button>
                <h1 className="text-xl tracking-wider">TAKEOVER TV</h1>
              </div>

              {/* User Profile */}
              <div className="flex items-center space-x-2 text-sm">
                <img
                  src={user?.pfpUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${address}`}
                  alt="User"
                  className="w-9 h-9 rounded-full border-2 border-gray-700 bg-gray-800"
                />
                <div className="text-left">
                  <p className="font-bold">{user?.displayName || 'Guest'}</p>
                  {user?.username && <p className="text-gray-400">@{user.username}</p>}
                </div>
              </div>
            </div>

            {/* TV Screen (16:9 aspect ratio) */}
            <div className="aspect-video relative overflow-hidden flex-shrink-0">
              <VideoPlayer
                url={slot0?.uri || `https://twitch.tv/${env.defaultChannel}`}
                isActive={isPoweredOn}
              />
            </div>

            {/* Channel Info */}
            {slot0 && (
              <ChannelInfo
                ownerAddress={slot0.owner}
                ownerDisplayName={user?.displayName}
                ownerUsername={user?.username}
                ownerPfpUrl={user?.pfpUrl}
                currentPrice={currentPrice}
              />
            )}

            {/* Takeover Form */}
            <TakeoverForm
              currentPrice={currentPrice}
              userBalance={userBalance}
              userAllowance={userAllowance}
              onTakeover={handleTakeover}
              onApprove={handleApprove}
              isPending={isTakeoverPending}
              isApprovePending={isApprovePending}
            />
          </div>
        )}
      </div>
    </div>
  );
}
