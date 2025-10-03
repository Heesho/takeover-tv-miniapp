'use client';

import { formatEther } from 'viem';
import type { Address } from 'viem';

interface ChannelInfoProps {
  owner: Address | undefined;
  price: bigint | undefined;
  quoteTokenDecimals?: number;
}

export function ChannelInfo({ owner, price, quoteTokenDecimals = 6 }: ChannelInfoProps) {
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

  return (
    <div className="w-full bg-gray-900 px-4 py-6 md:px-6 md:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {/* Current Owner */}
          <div>
            <div className="text-gray-400 text-xs md:text-sm mb-2 uppercase tracking-wide">
              Current Owner
            </div>
            <div className="text-white text-sm md:text-base font-mono">
              {owner ? shortenAddress(owner) : '—'}
            </div>
          </div>

          {/* Current Price */}
          <div className="text-right">
            <div className="text-gray-400 text-xs md:text-sm mb-2 uppercase tracking-wide">
              Takeover Price
            </div>
            <div className="text-white text-lg md:text-2xl font-bold">
              {price !== undefined ? (
                <>
                  ${formatPrice(price)}
                  <span className="text-sm md:text-base text-gray-400 ml-1">USDC</span>
                </>
              ) : (
                '—'
              )}
            </div>
          </div>
        </div>

        {/* Price Decay Indicator */}
        {price !== undefined && price > 0n && (
          <div className="mt-4 flex items-center text-xs md:text-sm text-gray-400">
            <svg
              className="w-4 h-4 mr-2 animate-pulse"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
            Price is continuously decaying
          </div>
        )}
      </div>
    </div>
  );
}
