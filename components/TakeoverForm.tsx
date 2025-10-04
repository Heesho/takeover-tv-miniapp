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
  const [mounted, setMounted] = useState(false);

  const { address, isConnected } = useAccount();

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
  const { writeContract: approve, data: approveHash, isPending: isApprovePending } = useWriteContract();
  const { writeContract: takeover, data: takeoverHash, isPending: isTakeoverPending } = useWriteContract();
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
      setStep('success');
      triggerHaptic('heavy'); // Celebrate with haptic feedback
      setTimeout(() => {
        setShowForm(false);
        setStep('input');
        setYoutubeUrl('');
        onSuccess?.();
      }, 3000);
    }
  }, [isTakeoverSuccess, isBatchSuccess, onSuccess]);

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

  const handleBatchTransaction = async () => {
    if (!isConnected || !isValidUrl || !currentPrice || !quoteToken || !walletClient || !address || epochId === undefined) return;

    try {
      setStep('takeover');

      // Calculate deadline and max payment
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 300);
      const maxPaymentAmount = currentPrice + (currentPrice * BigInt(5)) / BigInt(100);

      // Check if wallet supports batch transactions (EIP-5792)
      const supportsBatch = walletClient.request && 'wallet_sendCalls' in walletClient.request;

      if (supportsBatch) {
        // Encode both approve and takeover calls
        const approveData = encodeFunctionData({
          abi: erc20ABI,
          functionName: 'approve',
          args: [env.televisionAddress, currentPrice],
        });

        const takeoverData = encodeFunctionData({
          abi: televisionABI,
          functionName: 'takeover',
          args: [youtubeUrl, address, BigInt(epochId), deadline, maxPaymentAmount],
        });

        // Send batch transaction
        const batchId = await walletClient.request({
          method: 'wallet_sendCalls',
          params: [{
            version: '1.0',
            chainId: `0x${walletClient.chain.id.toString(16)}`,
            from: address,
            calls: [
              {
                to: quoteToken,
                data: approveData,
                value: '0x0',
              },
              {
                to: env.televisionAddress,
                data: takeoverData,
                value: '0x0',
              },
            ],
          }],
        } as any);

        // Get transaction hash from batch
        const calls: any = await walletClient.request({
          method: 'wallet_getCallsStatus',
          params: [batchId],
        } as any);

        if (calls?.status === 'CONFIRMED' && calls.receipts?.[0]?.transactionHash) {
          setBatchTxHash(calls.receipts[0].transactionHash as `0x${string}`);
        }
      } else {
        // Fallback to sequential transactions
        const needsApproval = !allowance || allowance < currentPrice;
        if (needsApproval) {
          handleApprove();
        } else {
          handleTakeover();
        }
      }
    } catch (error) {
      console.error('Batch transaction error:', error);
      // Fallback to sequential
      const needsApproval = !allowance || allowance < currentPrice;
      if (needsApproval) {
        handleApprove();
      } else {
        handleTakeover();
      }
    }
  };

  const handleSubmit = async () => {
    if (!isConnected || !isValidUrl || !currentPrice || !quoteToken) return;

    // Check if approval is needed
    const needsApproval = !allowance || allowance < currentPrice;

    if (needsApproval) {
      // Try batch transaction first
      handleBatchTransaction();
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
    <div className="w-full px-4 py-3 bg-black">
      <div className="max-w-2xl mx-auto">
        {step === 'input' && (
          <div className="space-y-2">
            <div>
              {/* Validation indicator above input - always takes up space */}
              <div className="flex items-center gap-1 mb-1 text-xs h-4">
                {isValidUrl !== null && (
                  <>
                    {isValidUrl ? (
                      <>
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-400">Valid YouTube URL</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-500">Invalid URL</span>
                      </>
                    )}
                  </>
                )}
              </div>
              <div className="relative">
                <input
                  id="youtube-url"
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder={isValidUrl === false ? "Please enter a valid YouTube URL" : "https://www.youtube.com/watch?v=..."}
                  className="w-full px-3 py-2 bg-gray-800 text-white text-sm rounded border border-gray-700 focus:border-gray-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!isValidUrl || !currentPrice || !isConnected}
              className="w-full bg-white hover:bg-gray-200 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400 text-black font-bold py-2 px-4 rounded text-sm transition-colors"
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
            <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
              <span>Balance: ${usdcBalance ? formatPrice(usdcBalance) : '0.00'}</span>
              <button
                onClick={handleMintUsdc}
                disabled={!address}
                className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed cursor-pointer px-2 py-0.5 rounded text-white transition-colors"
              >
                Mint $1000
              </button>
            </div>
          </div>
        )}

        {(step === 'approve' || step === 'takeover') && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
            <p className="text-white text-lg">
              {step === 'approve' && (isApprovePending || isApproveLoading)
                ? 'Approving USDC...'
                : isBatchLoading
                ? 'Processing batch transaction...'
                : 'Processing takeover...'}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Please confirm the transaction in your wallet
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-white text-xl font-bold">Takeover Successful!</p>
            <p className="text-gray-400 text-sm mt-2">The channel is now yours</p>

            <button
              onClick={() => shareOnFarcaster(youtubeUrl)}
              className="mt-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              Share on Farcaster
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
