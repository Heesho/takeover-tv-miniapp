'use client';

import { useState, useEffect } from 'react';
import { formatEther } from 'viem';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import type { Address } from 'viem';
import { env } from '@/utils/env';

const MOCK_USDC_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'mint',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;

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
  const { address } = useAccount();

  // Get USDC balance
  const { data: usdcBalance, refetch: refetchBalance } = useReadContract({
    address: env.usdcAddress as Address,
    abi: MOCK_USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Mint USDC
  const { writeContract: mintUsdc, data: mintHash } = useWriteContract();
  const { isSuccess: isMintSuccess } = useWaitForTransactionReceipt({ hash: mintHash });

  useEffect(() => {
    if (isMintSuccess) {
      refetchBalance();
    }
  }, [isMintSuccess, refetchBalance]);

  const handleMintUsdc = () => {
    if (!address) return;
    mintUsdc({
      address: env.usdcAddress as Address,
      abi: MOCK_USDC_ABI,
      functionName: 'mint',
      args: [BigInt(1000 * 10 ** quoteTokenDecimals)], // Mint 1000 USDC
    });
  };
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
    <div className="w-full px-3 py-2">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 gap-3">
          {/* Current Owner */}
          <div className="bg-gray-900/50 rounded px-3 py-2 border border-gray-800">
            <div className="flex items-center gap-1.5 mb-1.5">
              <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <div className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">
                Channel Owner
              </div>
            </div>
            {ownerProfile ? (
              <div className="flex items-center gap-2">
                <img
                  src={ownerProfile.pfpUrl}
                  alt={ownerProfile.displayName}
                  className="w-7 h-7 rounded-full border border-gray-700"
                />
                <div className="flex flex-col">
                  <div className="text-white text-xs font-semibold leading-tight">
                    {ownerProfile.displayName}
                  </div>
                  <div className="text-gray-500 text-[10px] leading-tight">
                    @{ownerProfile.username}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-white text-xs font-mono">
                {owner ? shortenAddress(owner) : '—'}
              </div>
            )}
          </div>

          {/* Current Price */}
          <div className="bg-gray-900/50 rounded px-3 py-2 border border-gray-800">
            <div className="flex items-center gap-1.5 mb-1.5">
              <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
              <div className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">
                Takeover Price
              </div>
            </div>
            <div className="text-white text-2xl font-bold">
              {price !== undefined ? `$${formatPrice(price)}` : '—'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
