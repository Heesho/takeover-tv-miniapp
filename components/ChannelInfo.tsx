'use client';

import { formatUnits } from 'viem';

interface ChannelInfoProps {
  ownerAddress: string;
  ownerDisplayName?: string;
  ownerUsername?: string;
  ownerPfpUrl?: string;
  currentPrice: bigint;
}

export function ChannelInfo({
  ownerAddress,
  ownerDisplayName,
  ownerUsername,
  ownerPfpUrl,
  currentPrice,
}: ChannelInfoProps) {
  const formattedPrice = formatUnits(currentPrice, 6); // USDC has 6 decimals

  return (
    <div className="grid grid-cols-2 gap-3 px-4 flex-shrink-0">
      {/* Broadcaster */}
      <div className="border border-gray-800 p-3 rounded-lg bg-black/20 flex flex-col justify-between">
        <p className="text-xs text-gray-400 mb-1">BROADCASTER</p>
        <div className="flex items-center space-x-2">
          <img
            src={ownerPfpUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${ownerAddress}`}
            alt="Owner"
            className="w-8 h-8 rounded-full bg-gray-800"
          />
          <div className="text-sm overflow-hidden">
            <p className="truncate font-bold">
              {ownerDisplayName || `${ownerAddress.slice(0, 6)}...${ownerAddress.slice(-4)}`}
            </p>
            {ownerUsername && (
              <p className="truncate text-gray-400">@{ownerUsername}</p>
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
