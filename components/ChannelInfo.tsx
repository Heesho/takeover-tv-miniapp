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
    <div className="w-full bg-gray-900 px-4 py-3">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-3 gap-3">
          {/* Current Owner */}
          <div>
            <div className="text-gray-400 text-xs mb-1 uppercase tracking-wide">
              Owner
            </div>
            {ownerProfile ? (
              <div className="flex items-center gap-2">
                <img
                  src={ownerProfile.pfpUrl}
                  alt={ownerProfile.displayName}
                  className="w-6 h-6 rounded-full border border-gray-600"
                />
                <div className="flex flex-col">
                  <div className="text-white text-xs font-medium">
                    {ownerProfile.displayName}
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
          <div className="text-center">
            <div className="text-gray-400 text-xs mb-1 uppercase tracking-wide">
              Price
            </div>
            <div className="text-white text-base font-bold">
              {price !== undefined ? `$${formatPrice(price)}` : '—'}
            </div>
          </div>

          {/* USDC Balance & Mint */}
          <div className="text-right">
            <div className="text-gray-400 text-xs mb-1 uppercase tracking-wide">
              Balance
            </div>
            <div className="flex items-center justify-end gap-2">
              <div className="text-white text-xs font-mono">
                ${usdcBalance ? formatPrice(usdcBalance) : '0.00'}
              </div>
              <button
                onClick={handleMintUsdc}
                disabled={!address}
                className="text-xs bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 px-2 py-0.5 rounded text-white transition-colors"
              >
                Mint
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
