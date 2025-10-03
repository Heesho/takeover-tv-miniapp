'use client';

import { useState, useEffect } from 'react';
import { formatEther } from 'viem';
import type { Address } from 'viem';

interface ChannelInfoProps {
  owner: Address | undefined;
  price: bigint | undefined;
  quoteTokenDecimals?: number;
}

interface FarcasterProfile {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
}

export function ChannelInfo({ owner, price, quoteTokenDecimals = 6 }: ChannelInfoProps) {
  const [ownerProfile, setOwnerProfile] = useState<FarcasterProfile | null>(null);
  const formatPrice = (priceInWei: bigint | undefined) => {
    if (!priceInWei) return '0.00';

    // Convert based on token decimals (USDC typically has 6 decimals)
    const divisor = BigInt(10 ** quoteTokenDecimals);
    const integerPart = priceInWei / divisor;
    const fractionalPart = priceInWei % divisor;

    const fractionalStr = fractionalPart.toString().padStart(quoteTokenDecimals, '0');
    const displayFractional = fractionalStr.slice(0, 2);

    return `${integerPart}.${displayFractional}`;
  };

  const shortenAddress = (address: Address | undefined) => {
    if (!address) return '...';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  useEffect(() => {
    async function fetchOwnerProfile() {
      if (!owner) return;

      try {
        const response = await fetch(
          `https://api.warpcast.com/v2/verifications?address=${owner.toLowerCase()}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.result?.fid) {
            const userResponse = await fetch(
              `https://api.warpcast.com/v2/user-by-fid?fid=${data.result.fid}`
            );
            if (userResponse.ok) {
              const userData = await userResponse.json();
              setOwnerProfile({
                fid: userData.result.user.fid,
                username: userData.result.user.username,
                displayName: userData.result.user.displayName,
                pfpUrl: userData.result.user.pfp.url,
              });
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch owner profile:', error);
      }
    }

    fetchOwnerProfile();
  }, [owner]);

  return (
    <div className="w-full bg-gray-900 px-4 py-6 md:px-6 md:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {/* Current Owner */}
          <div>
            <div className="text-gray-400 text-xs md:text-sm mb-2 uppercase tracking-wide">
              Current Owner
            </div>
            {ownerProfile ? (
              <div className="flex items-center gap-2">
                <img
                  src={ownerProfile.pfpUrl}
                  alt={ownerProfile.displayName}
                  className="w-8 h-8 rounded-full border-2 border-gray-600"
                />
                <div className="flex flex-col">
                  <div className="text-white text-sm md:text-base font-medium">
                    {ownerProfile.displayName}
                  </div>
                  <div className="text-gray-400 text-xs">
                    @{ownerProfile.username}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-white text-sm md:text-base font-mono">
                {owner ? shortenAddress(owner) : '—'}
              </div>
            )}
          </div>

          {/* Current Price */}
          <div className="text-right">
            <div className="text-gray-400 text-xs md:text-sm mb-2 uppercase tracking-wide">
              Takeover Price
            </div>
            <div className="text-white text-lg md:text-2xl font-bold">
              {price !== undefined ? `$${formatPrice(price)}` : '—'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
