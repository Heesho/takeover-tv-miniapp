'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, usePublicClient, useWalletClient } from 'wagmi';
import { parseUnits, type Address, encodeFunctionData } from 'viem';
import { isValidYouTubeUrl } from '@/utils/youtube';
import { televisionABI, erc20ABI } from '@/contracts/television-abi';
import { env } from '@/utils/env';
import { useCurrentChannel } from '@/hooks/useTelevision';
import { shareOnFarcaster, triggerHaptic } from '@/utils/farcaster';

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
        const calls = await walletClient.request({
          method: 'wallet_getCallsStatus',
          params: [batchId],
        } as any);

        if (calls.status === 'CONFIRMED' && calls.receipts?.[0]?.transactionHash) {
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

  if (!showForm) {
    return (
      <div className="w-full px-4 py-6 md:px-6 md:py-8">
        <button
          onClick={() => setShowForm(true)}
          disabled={!isConnected || !currentPrice}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 md:py-6 px-6 rounded-lg text-lg md:text-xl transition-colors duration-200 shadow-lg"
        >
          {!mounted
            ? 'Loading...'
            : !isConnected
            ? 'Connect Wallet First'
            : currentPrice
            ? `Takeover for $${formatPrice(currentPrice)} USDC`
            : 'Loading...'}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-6 md:px-6 md:py-8 bg-gray-900">
      <div className="max-w-2xl mx-auto">
        <h3 className="text-white text-xl md:text-2xl font-bold mb-4">
          Take Control of the Channel
        </h3>

        {step === 'input' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="youtube-url" className="block text-gray-300 text-sm mb-2">
                YouTube Video URL
              </label>
              <div className="relative">
                <input
                  id="youtube-url"
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                />
                {isValidUrl !== null && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isValidUrl ? (
                      <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                )}
              </div>
              {isValidUrl === false && (
                <p className="text-red-400 text-sm mt-2">
                  Please enter a valid YouTube URL
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!isValidUrl || !currentPrice}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Confirm - ${formatPrice(currentPrice)} USDC
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
            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-white text-xl font-bold">Takeover Successful!</p>
            <p className="text-gray-400 text-sm mt-2">The channel is now yours</p>

            <button
              onClick={() => shareOnFarcaster(youtubeUrl)}
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors inline-flex items-center gap-2"
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
