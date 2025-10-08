'use client';

import { formatUnits } from 'viem';
import { useFarcasterProfile } from '@/hooks/useFarcasterProfile';

interface ChannelInfoProps {
  ownerAddress: string;
  currentPrice: bigint;
}

export function ChannelInfo({
  ownerAddress,
  currentPrice,
}: ChannelInfoProps) {
  const formattedPrice = formatUnits(currentPrice, 6); // USDC has 6 decimals
  const { profile, isLoading } = useFarcasterProfile(ownerAddress);

  // Display profile data if available, otherwise fallback to address
  const displayName = profile?.displayName || `${ownerAddress.slice(0, 6)}...${ownerAddress.slice(-4)}`;
  const username = profile?.username;
  const avatarUrl = profile?.pfpUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${ownerAddress}`;

  return (
    <div className="grid grid-cols-2 gap-3 px-4 flex-shrink-0">
      {/* Broadcaster */}
      <div className="border border-gray-800 p-3 rounded-lg bg-black/20 flex flex-col justify-between">
        <p className="text-xs text-gray-400 mb-1">BROADCASTER</p>
        <div className="flex items-center space-x-2">
          <img
            src={avatarUrl}
            alt="Broadcaster"
            className="w-8 h-8 rounded-full bg-gray-800"
            onError={(e) => {
              // Fallback to generated avatar if profile image fails to load
              const target = e.target as HTMLImageElement;
              target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=${ownerAddress}`;
            }}
          />
          <div className="text-sm overflow-hidden">
            {isLoading ? (
              <div className="h-5 w-24 bg-gray-700 rounded animate-pulse" />
            ) : (
              <>
                <p className="truncate font-bold">{displayName}</p>
                {username && (
                  <p className="truncate text-xs text-gray-400">@{username}</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Takeover Price */}
      <div className="border border-gray-800 p-3 rounded-lg bg-black/20 flex flex-col justify-between">
        <p className="text-xs text-gray-400 mb-1">TAKE0VER PRICE</p>
        <p
          className="text-retro-pink text-4xl font-bold"
          style={{ textShadow: '0 0 5px var(--accent-color)' }}
        >
          ${parseFloat(formattedPrice).toFixed(2)}
        </p>
      </div>
    </div>
  );
}
