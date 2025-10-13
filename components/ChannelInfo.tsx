"use client";

import { formatUnits } from 'viem';
import { useFarcasterProfile } from '@/hooks/useFarcasterProfile';
import { sdk } from '@farcaster/miniapp-sdk';
import { env } from '@/utils/env';
import { useMiniAppCapabilities } from '@/hooks/useMiniAppCapabilities';

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
  const { capabilities } = useMiniAppCapabilities();
  const canSendToken = capabilities?.includes('actions.sendToken');
  const canSwapToken = capabilities?.includes('actions.swapToken');
  const canViewProfile = capabilities?.includes('actions.viewProfile');
  const canViewToken = capabilities?.includes('actions.viewToken');

  const handleSendToken = async () => {
    try {
      const token = `eip155:${env.chainId}/erc20:${env.usdcContract}`;
      // Default tip: 1 USDC (1e6)
      const amount = '1000000';
      const recipient = profile?.fid
        ? { recipientFid: profile.fid }
        : { recipientAddress: ownerAddress };

      const result = await (sdk as any)?.actions?.sendToken?.({
        token,
        amount,
        ...recipient,
      });

      if (result?.success) {
        console.log('Token sent. Tx:', result.send.transaction);
      } else if (result && result.success === false) {
        console.warn('Send failed:', result.reason, result.error);
      }
    } catch (e) {
      console.error('sendToken failed:', e);
    }
  };

  const handleSwapToken = async () => {
    try {
      const sellToken = `eip155:${env.chainId}/erc20:${env.usdcContract}`;
      const buyToken = `eip155:${env.chainId}/native`;
      const sellAmount = '1000000'; // 1 USDC (6 decimals)

      const details = await (sdk as any)?.actions?.swapToken?.({
        sellToken,
        buyToken,
        sellAmount,
      });

      if (details?.transactions) {
        console.log('Swap submitted. Tx sequence:', details.transactions);
      }
    } catch (e: any) {
      const name = e?.name || '';
      const msg = e?.shortMessage || e?.message || 'Swap failed';
      if (/RejectedByUser/i.test(name)) {
        console.log('User canceled swap');
      } else {
        console.warn('Swap failed:', msg);
      }
    }
  };

  const handleViewProfile = async () => {
    try {
      if (!profile?.fid) {
        console.warn('No Farcaster fid available for this broadcaster');
        return;
      }
      await (sdk as any)?.actions?.viewProfile?.({ fid: profile.fid });
    } catch (e) {
      console.error('viewProfile failed:', e);
    }
  };

  const handleViewToken = async () => {
    try {
      const token = `eip155:${env.chainId}/erc20:${env.usdcContract}`;
      await (sdk as any)?.actions?.viewToken?.({ token });
    } catch (e) {
      console.error('viewToken failed:', e);
    }
  };

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
        <div className="mt-3 flex flex-wrap gap-2">
          {(canSendToken || canSwapToken) && (
            <button
              onClick={canSendToken ? handleSendToken : handleSwapToken}
              className="text-xs px-2 py-1 border border-gray-700 rounded hover:bg-gray-800"
            >
              {canSendToken ? 'Send 1 USDC' : 'Swap 1 USDC -> ETH'}
            </button>
          )}
          {canViewProfile && profile?.fid && (
            <button
              onClick={handleViewProfile}
              className="text-xs px-2 py-1 border border-gray-700 rounded hover:bg-gray-800"
            >
              View Profile
            </button>
          )}
          {canViewToken && (
            <button
              onClick={handleViewToken}
              className="text-xs px-2 py-1 border border-gray-700 rounded hover:bg-gray-800"
            >
              View USDC
            </button>
          )}
        </div>
      </div>

      {/* TAKE0VER PRICE */}
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



