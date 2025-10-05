'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, usePublicClient, useWalletClient } from 'wagmi';
import { parseUnits, type Address, encodeFunctionData } from 'viem';
import { isValidYouTubeUrl } from '@/utils/youtube';
import { televisionABI, erc20ABI } from '@/contracts/television-abi';
import { env } from '@/utils/env';
import { useCurrentChannel } from '@/hooks/useTelevision';
import { shareOnFarcaster, triggerHaptic } from '@/utils/farcaster';

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
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_amount', type: 'uint256' }
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;

interface TakeoverFormProps {
  currentPrice: bigint | undefined;
  quoteToken: Address | undefined;
  onSuccess?: () => void;
}

export function TakeoverForm({ currentPrice, quoteToken, onSuccess }: TakeoverFormProps) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState<boolean | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState<'input' | 'approve' | 'takeover' | 'success'>('input');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  const { address, isConnected } = useAccount();

  // Get USDC balance with automatic refetch
  const { data: usdcBalance, refetch: refetchBalance } = useReadContract({
    address: env.usdcAddress as Address,
    abi: MOCK_USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      refetchInterval: 3000, // Refetch every 3 seconds
    },
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
    console.log('Mint button clicked, address:', address);
    if (!address) {
      console.log('No address, returning');
      return;
    }
    console.log('Calling mintUsdc with:', {
      address: env.usdcAddress,
      args: [address, BigInt(1000 * 10 ** 6)]
    });
    mintUsdc({
      address: env.usdcAddress as Address,
      abi: MOCK_USDC_ABI,
      functionName: 'mint',
      args: [address, BigInt(1000 * 10 ** 6)], // Mint 1000 USDC to user's address
    });
  };
  const { epochId } = useCurrentChannel();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { writeContract: approve, data: approveHash, isPending: isApprovePending, error: approveError, reset: resetApprove } = useWriteContract();
  const { writeContract: takeover, data: takeoverHash, isPending: isTakeoverPending, error: takeoverError, reset: resetTakeover } = useWriteContract();
  const [batchTxHash, setBatchTxHash] = useState<`0x${string}` | undefined>(undefined);

  const { isLoading: isApproveLoading, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const { isLoading: isTakeoverLoading, isSuccess: isTakeoverSuccess } = useWaitForTransactionReceipt({
    hash: takeoverHash,
  });

  const { isLoading: isBatchLoading, isSuccess: isBatchSuccess } = useWaitForTransactionReceipt({
    hash: batchTxHash,
  });

  // Check current allowance
  const { data: allowance } = useReadContract({
    address: quoteToken,
    abi: erc20ABI,
    functionName: 'allowance',
    args: address && quoteToken ? [address, env.televisionAddress] : undefined,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (youtubeUrl) {
      const valid = isValidYouTubeUrl(youtubeUrl);
      setIsValidUrl(valid);
    } else {
      setIsValidUrl(null);
    }
  }, [youtubeUrl]);

  useEffect(() => {
    if (isApproveSuccess && step === 'approve') {
      setStep('takeover');
      handleTakeover();
    }
  }, [isApproveSuccess, step]);

  useEffect(() => {
    if (isTakeoverSuccess || isBatchSuccess) {
      setStep('input');
      setYoutubeUrl('');
      refetchBalance(); // Refresh balance after takeover
      triggerHaptic('heavy'); // Celebrate with haptic feedback
      setStatusMessage({ type: 'success', text: 'Successful Takeover!' });

      // Clear message after 4 seconds
      setTimeout(() => {
        setStatusMessage(null);
        onSuccess?.();
      }, 4000);
    }
  }, [isTakeoverSuccess, isBatchSuccess, onSuccess, refetchBalance]);

  // Handle transaction errors
  useEffect(() => {
    if (approveError || takeoverError) {
      setStep('input');
      const errorMessage = (approveError || takeoverError)?.message || '';
      const isUserRejection = errorMessage.includes('User rejected') || errorMessage.includes('user rejected');

      setStatusMessage({
        type: 'error',
        text: isUserRejection ? 'Transaction Rejected' : 'Transaction Failed'
      });

      setTimeout(() => {
        setStatusMessage(null);
      }, 4000);
    }
  }, [approveError, takeoverError]);

  const handleApprove = async () => {
    if (!quoteToken || !currentPrice) return;

    setStep('approve');
    approve({
      address: quoteToken,
      abi: erc20ABI,
      functionName: 'approve',
      args: [env.televisionAddress, currentPrice],
    });
  };

  const handleTakeover = async () => {
    if (!isValidUrl || !youtubeUrl || !address || !currentPrice || epochId === undefined) return;

    if (step === 'input') {
      setStep('takeover');
    }

    // Calculate deadline (5 minutes from now)
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 300);
    // Add 5% slippage to current price
    const maxPaymentAmount = currentPrice + (currentPrice * BigInt(5)) / BigInt(100);

    takeover({
      address: env.televisionAddress,
      abi: televisionABI,
      functionName: 'takeover',
      args: [youtubeUrl, address, BigInt(epochId), deadline, maxPaymentAmount],
    });
  };

  const handleSubmit = async () => {
    if (!isConnected || !isValidUrl || !currentPrice || !quoteToken) return;

    // Reset any previous errors
    resetApprove();
    resetTakeover();

    // Check if approval is needed
    const needsApproval = !allowance || allowance < currentPrice;

    if (needsApproval) {
      handleApprove();
    } else {
      handleTakeover();
    }
  };

  const formatPrice = (price: bigint | undefined) => {
    if (!price) return '0.00';
    const divisor = BigInt(10 ** 6); // USDC decimals
    const integerPart = price / divisor;
    const fractionalPart = price % divisor;
    const fractionalStr = fractionalPart.toString().padStart(6, '0');
    return `${integerPart}.${fractionalStr.slice(0, 2)}`;
  };

  return (
    <div className="w-full px-3 py-3">
      <div className="max-w-6xl mx-auto">
        {/* Status Message - Replaces form when showing */}
        {statusMessage ? (
          <div className={`px-4 py-6 flex items-center justify-center gap-2 ${
            statusMessage.type === 'success' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {statusMessage.type === 'success' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-sm font-medium">{statusMessage.text}</span>
          </div>
        ) : (step === 'approve' || step === 'takeover') ? (
          <div className="text-center py-6">
            <div className="relative inline-flex mb-3">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-700 border-t-white" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
            </div>
            <p className="text-white text-sm font-bold mb-1">
              {step === 'approve' && (isApprovePending || isApproveLoading)
                ? 'Approving USDC...'
                : isBatchLoading
                ? 'Processing Batch...'
                : 'Processing Takeover...'}
            </p>
            <p className="text-gray-500 text-[10px]">
              Confirm in your wallet
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Section Header with inline validation */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                <h3 className="text-white text-xs font-bold uppercase tracking-wide">
                  Broadcast Your Video
                </h3>
              </div>

              {/* Validation indicator inline with header */}
              <div className="flex items-center gap-1.5">
                {isValidUrl !== null && (
                  <>
                    {isValidUrl ? (
                      <>
                        <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-green-500 text-[10px] font-medium">Valid URL</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="text-red-500 text-[10px] font-medium">Invalid URL</span>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            <input
              id="youtube-url"
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3 py-2 bg-gray-800/50 text-white text-xs rounded border border-gray-700 focus:border-gray-500 focus:outline-none placeholder-gray-600"
            />

            <button
              onClick={handleSubmit}
              disabled={!isValidUrl || !currentPrice || !isConnected}
              className="w-full bg-white hover:bg-gray-100 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-500 text-black font-bold py-2 px-4 rounded text-xs transition-colors uppercase tracking-wide"
              style={{ color: !isValidUrl || !currentPrice || !isConnected ? undefined : '#000000' }}
            >
              {!mounted
                ? 'Loading...'
                : !isConnected
                ? 'Connect Wallet First'
                : currentPrice
                ? 'Takeover'
                : 'Loading...'}
            </button>

            {/* USDC Balance & Mint */}
            <div className="flex items-center justify-between text-[10px] pt-1">
              <span className="text-gray-500">Balance: ${usdcBalance ? formatPrice(usdcBalance) : '0.00'}</span>
              <button
                onClick={handleMintUsdc}
                className="bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded text-gray-400 hover:text-white transition-colors"
              >
                Mint $1000
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
