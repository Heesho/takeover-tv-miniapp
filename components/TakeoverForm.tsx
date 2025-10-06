'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWaitForTransactionReceipt, useReadContract, useWriteContract } from 'wagmi';
import type { Address } from 'viem';
import { isValidYouTubeUrl } from '@/utils/youtube';
import { televisionABI, erc20ABI } from '@/contracts/television-abi';
import { env } from '@/utils/env';
import { useCurrentChannel } from '@/hooks/useTelevision';
import { triggerHaptic } from '@/utils/farcaster';

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

const USDC_DECIMALS = 6;
const MINT_AMOUNT = 1000;
const SLIPPAGE_PERCENT = 5;
const DEADLINE_SECONDS = 300; // 5 minutes

type TransactionStep = 'idle' | 'approving' | 'taking-over' | 'success' | 'error';

interface StatusMessage {
  type: 'success' | 'error';
  text: string;
}

interface TakeoverFormProps {
  currentPrice: bigint | undefined;
  quoteToken: Address | undefined;
  onSuccess?: () => void;
}

export function TakeoverForm({ currentPrice, quoteToken, onSuccess }: TakeoverFormProps) {
  // Form state
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState<boolean | null>(null);
  const [transactionStep, setTransactionStep] = useState<TransactionStep>('idle');
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);

  // Log environment on mount
  useEffect(() => {
    console.log('🌍 ENVIRONMENT CONFIGURATION:');
    console.log('  Television Address:', env.televisionAddress);
    console.log('  USDC Address:', env.usdcAddress);
    console.log('  Chain ID:', env.chainId);
    console.log('  RPC URL:', env.rpcUrl);
    console.log('  App Domain:', env.appDomain);
  }, []);

  // Debug: Log state changes
  useEffect(() => {
    console.log('📊 State:', { transactionStep, statusMessage, youtubeUrl, isValidUrl });
  }, [transactionStep, statusMessage, youtubeUrl, isValidUrl]);

  // Account and chain
  const { address, isConnected, chainId } = useAccount();
  const { epochId } = useCurrentChannel();

  // Log chain info for debugging
  useEffect(() => {
    if (chainId) {
      console.log('🔗 Connected chain:', {
        chainId,
        expected: env.chainId,
        match: chainId === env.chainId,
      });

      if (chainId !== env.chainId) {
        console.warn('⚠️ WARNING: Connected to wrong chain!', {
          connected: chainId,
          expected: env.chainId,
        });
      }
    }
  }, [chainId]);

  // Log chain and account info
  useEffect(() => {
    console.log('🔗 Account & Chain:', { address, isConnected, chainId: env.chainId });
  }, [address, isConnected]);

  // USDC Balance
  const { data: usdcBalance, refetch: refetchBalance } = useReadContract({
    address: env.usdcAddress,
    abi: MOCK_USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address, // Only query when address is available
      refetchInterval: 3000,
    },
  });

  // Allowance check
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: quoteToken,
    abi: erc20ABI,
    functionName: 'allowance',
    args: address && quoteToken ? [address, env.televisionAddress] : undefined,
    query: {
      enabled: !!(address && quoteToken), // Only query when both are available
    },
  });

  // Mint USDC transaction
  const {
    writeContract: mintUsdc,
    data: mintHash,
    reset: resetMint,
  } = useWriteContract();

  const { isSuccess: isMintSuccess } = useWaitForTransactionReceipt({
    hash: mintHash
  });

  // Approve transaction
  const {
    writeContract: approveWrite,
    data: approveHash,
    error: approveError,
    isPending: isApprovePending,
    reset: resetApprove,
  } = useWriteContract();

  const {
    isLoading: isApproveLoading,
    isSuccess: isApproveSuccess
  } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Takeover transaction
  const {
    writeContract: takeoverWrite,
    data: takeoverHash,
    error: takeoverError,
    isPending: isTakeoverPending,
    reset: resetTakeover,
  } = useWriteContract();

  const {
    isLoading: isTakeoverLoading,
    isSuccess: isTakeoverSuccess,
    error: receiptError
  } = useWaitForTransactionReceipt({
    hash: takeoverHash,
  });

  // Debug receipt state
  useEffect(() => {
    if (takeoverHash) {
      console.log('📝 Receipt state:', {
        hash: takeoverHash,
        isLoading: isTakeoverLoading,
        isSuccess: isTakeoverSuccess,
        error: receiptError?.message,
      });
    }
  }, [takeoverHash, isTakeoverLoading, isTakeoverSuccess, receiptError]);

  // Debug takeover transaction state
  useEffect(() => {
    console.log('🔍 Takeover transaction state:', {
      hash: takeoverHash,
      isPending: isTakeoverPending,
      isLoading: isTakeoverLoading,
      isSuccess: isTakeoverSuccess,
      error: takeoverError?.message,
      transactionStep,
    });
  }, [takeoverHash, isTakeoverPending, isTakeoverLoading, isTakeoverSuccess, takeoverError, transactionStep]);

  // Don't set transaction step based on isPending - it causes re-renders that block the wallet modal
  // Instead, use isPending directly in the UI rendering logic

  // Validate YouTube URL
  useEffect(() => {
    if (youtubeUrl) {
      setIsValidUrl(isValidYouTubeUrl(youtubeUrl));
    } else {
      setIsValidUrl(null);
    }
  }, [youtubeUrl]);

  // Handle mint success
  useEffect(() => {
    if (isMintSuccess) {
      refetchBalance();
      resetMint();
    }
  }, [isMintSuccess, refetchBalance, resetMint]);

  // Handle transaction errors with better user feedback
  const handleTransactionError = useCallback((error: Error) => {
    const errorMessage = error.message || '';
    const isUserRejection = errorMessage.toLowerCase().includes('user rejected') ||
                           errorMessage.toLowerCase().includes('user denied');
    const isInsufficientFunds = errorMessage.toLowerCase().includes('insufficient');

    console.error('❌ Transaction error:', { message: errorMessage, isUserRejection, isInsufficientFunds });

    // For user rejections, just reset silently without showing error state
    if (isUserRejection) {
      setTransactionStep('idle');
      resetApprove();
      resetTakeover();
      return;
    }

    // For actual errors, show the error message
    setTransactionStep('error');
    setStatusMessage({
      type: 'error',
      text: isInsufficientFunds
        ? 'Insufficient Balance'
        : 'Transaction Failed',
    });

    // Reset transaction state after showing error
    setTimeout(() => {
      setStatusMessage(null);
      setTransactionStep('idle');
      resetApprove();
      resetTakeover();
    }, 4000);
  }, [resetApprove, resetTakeover]);

  // Execute approve
  const executeApprove = useCallback(() => {
    if (!quoteToken || !currentPrice) {
      console.error('❌ Missing quoteToken or currentPrice');
      return;
    }

    console.log('🔄 Executing approve...', {
      token: quoteToken,
      spender: env.televisionAddress,
      amount: currentPrice.toString(),
    });

    approveWrite({
      address: quoteToken,
      abi: erc20ABI,
      functionName: 'approve',
      args: [env.televisionAddress, currentPrice],
    });
  }, [quoteToken, currentPrice, approveWrite]);

  // Execute takeover
  const executeTakeover = useCallback(() => {
    if (!isValidUrl || !youtubeUrl || !address || currentPrice === undefined || epochId === undefined) {
      console.error('❌ Missing required parameters for takeover', {
        isValidUrl,
        youtubeUrl,
        address,
        currentPrice: currentPrice?.toString(),
        epochId,
      });
      return;
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const deadline = BigInt(currentTimestamp + DEADLINE_SECONDS);
    const maxPaymentAmount = currentPrice;

    console.log('🔄 Executing takeover...');
    console.log('📋 DETAILED TRANSACTION PARAMETERS:');
    console.log('  Contract Address:', env.televisionAddress);
    console.log('  Function:', 'takeover');
    console.log('  Arg 0 - uri (string):', youtubeUrl);
    console.log('  Arg 1 - channelOwner (address):', address);
    console.log('  Arg 2 - epochId (uint256):', BigInt(epochId).toString());
    console.log('  Arg 3 - deadline (uint256):', deadline.toString());
    console.log('  Arg 4 - maxPaymentAmount (uint256):', maxPaymentAmount.toString());

    takeoverWrite({
      address: env.televisionAddress,
      abi: televisionABI,
      functionName: 'takeover',
      args: [youtubeUrl, address, BigInt(epochId), deadline, maxPaymentAmount],
    });

    console.log('✅ takeoverWrite called');
  }, [isValidUrl, youtubeUrl, address, currentPrice, epochId, takeoverWrite]);

  // Track transaction steps based on pending/loading states
  useEffect(() => {
    if (isApprovePending || isApproveLoading) {
      setTransactionStep('approving');
    } else if (isTakeoverPending || isTakeoverLoading) {
      setTransactionStep('taking-over');
    }
  }, [isApprovePending, isApproveLoading, isTakeoverPending, isTakeoverLoading]);

  // Handle approve success -> just refetch allowance
  useEffect(() => {
    if (isApproveSuccess && transactionStep === 'approving') {
      console.log('✅ Approve successful! Allowance updated.');
      refetchAllowance();
      // Reset to idle so user can click Takeover button
      setTimeout(() => {
        setTransactionStep('idle');
        resetApprove();
      }, 1000);
    }
  }, [isApproveSuccess, transactionStep, refetchAllowance, resetApprove]);

  // Handle takeover success
  useEffect(() => {
    if (isTakeoverSuccess && transactionStep === 'taking-over') {
      console.log('✅ Takeover successful!');
      setTransactionStep('success');
      setYoutubeUrl('');
      refetchBalance();
      triggerHaptic('heavy');

      setStatusMessage({
        type: 'success',
        text: 'Successful Takeover!'
      });

      setTimeout(() => {
        setStatusMessage(null);
        setTransactionStep('idle');
        resetApprove();
        resetTakeover();
        onSuccess?.();
      }, 4000);
    }
  }, [isTakeoverSuccess, transactionStep, onSuccess, refetchBalance, resetApprove, resetTakeover]);

  // Handle errors
  useEffect(() => {
    if (approveError && transactionStep === 'approving') {
      console.error('❌ Approve error:', approveError);
      handleTransactionError(approveError);
    }
  }, [approveError, transactionStep, handleTransactionError]);

  useEffect(() => {
    if (takeoverError) {
      console.error('❌ Takeover error detected:', {
        error: takeoverError,
        message: takeoverError.message,
        transactionStep,
        willHandle: transactionStep === 'taking-over',
      });

      if (transactionStep === 'taking-over') {
        handleTransactionError(takeoverError);
      }
    }
  }, [takeoverError, transactionStep, handleTransactionError]);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!isConnected || !isValidUrl || currentPrice === undefined || !quoteToken) {
      console.warn('⚠️ Cannot submit - missing requirements', {
        isConnected,
        isValidUrl,
        currentPrice: currentPrice?.toString(),
        quoteToken,
      });
      return;
    }

    console.log('🚀 Starting takeover flow...');

    // Check if approval is needed (not needed if price is 0)
    const needsApproval = currentPrice > 0n && (!allowance || allowance < currentPrice);

    console.log('📋 Allowance check:', {
      current: allowance?.toString(),
      needed: currentPrice.toString(),
      needsApproval,
    });

    if (needsApproval) {
      executeApprove();
    } else {
      executeTakeover();
    }
  }, [
    isConnected,
    isValidUrl,
    currentPrice,
    quoteToken,
    allowance,
    executeApprove,
    executeTakeover,
  ]);

  // Handle mint USDC
  const handleMintUsdc = useCallback(() => {
    if (!address) {
      console.warn('⚠️ No address for minting');
      return;
    }

    console.log('🪙 Minting USDC...', {
      to: address,
      amount: MINT_AMOUNT,
    });

    mintUsdc({
      address: env.usdcAddress,
      abi: MOCK_USDC_ABI,
      functionName: 'mint',
      args: [address, BigInt(MINT_AMOUNT * 10 ** USDC_DECIMALS)],
    });
  }, [address, mintUsdc]);

  // Format price helper
  const formatPrice = (price: bigint | undefined): string => {
    if (!price) return '0.00';

    const divisor = BigInt(10 ** USDC_DECIMALS);
    const integerPart = price / divisor;
    const fractionalPart = price % divisor;
    const fractionalStr = fractionalPart.toString().padStart(USDC_DECIMALS, '0');

    return `${integerPart}.${fractionalStr.slice(0, 2)}`;
  };

  // Determine what to show
  const showStatusMessage = statusMessage !== null;
  const isProcessing = isApprovePending || isApproveLoading || isTakeoverPending || isTakeoverLoading;
  const showInputForm = !showStatusMessage && !isProcessing;
  const showProcessing = !showStatusMessage && isProcessing;

  return (
    <div className="w-full px-3 py-3">
      <div className="max-w-6xl mx-auto">
        {/* Status Message */}
        {showStatusMessage && (
          <div
            className={`px-4 py-3 flex items-center justify-center gap-2 ${
              statusMessage.type === 'success' ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span className="text-sm font-medium">{statusMessage.text}</span>
          </div>
        )}

        {/* Input Form */}
        {showInputForm && (
          <div className="space-y-2">
            {/* Header with validation */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                <h3 className="text-white text-xs font-bold uppercase tracking-wide">
                  Broadcast Your Video
                </h3>
              </div>

              {/* Validation indicator */}
              <div className="flex items-center gap-1.5">
                {isValidUrl !== null && (
                  <>
                    {isValidUrl ? (
                      <>
                        <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-green-500 text-[10px] font-medium">Valid URL</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-red-500 text-[10px] font-medium">Invalid URL</span>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* URL Input */}
            <input
              id="youtube-url"
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3 py-2 bg-gray-800/50 text-white text-xs rounded border border-gray-700 focus:border-gray-500 focus:outline-none placeholder-gray-600"
            />

            {/* Action Buttons - Separate Approve and Takeover */}
            {currentPrice !== undefined && currentPrice > 0n && (!allowance || allowance < currentPrice) ? (
              /* Show Approve Button */
              <button
                onClick={executeApprove}
                disabled={!isValidUrl || !isConnected || !quoteToken}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-500 text-white font-bold py-2 px-4 rounded text-xs transition-colors uppercase tracking-wide"
              >
                {!isConnected
                  ? 'Connect Wallet First'
                  : !isValidUrl
                  ? 'Enter Valid URL'
                  : `Approve ${formatPrice(currentPrice)} USDC`}
              </button>
            ) : (
              /* Show Takeover Button */
              <button
                onClick={executeTakeover}
                disabled={!isValidUrl || currentPrice === undefined || !isConnected}
                className="w-full bg-white hover:bg-gray-100 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-500 text-black font-bold py-2 px-4 rounded text-xs transition-colors uppercase tracking-wide"
                style={{ color: !isValidUrl || currentPrice === undefined || !isConnected ? undefined : '#000000' }}
              >
                {!isConnected
                  ? 'Connect Wallet First'
                  : !isValidUrl
                  ? 'Enter Valid URL'
                  : currentPrice !== undefined
                  ? 'Takeover'
                  : 'Loading...'}
              </button>
            )}

            {/* Balance, Allowance & Mint */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-500">
                  Balance: ${usdcBalance ? formatPrice(usdcBalance) : '0.00'}
                </span>
                <button
                  onClick={handleMintUsdc}
                  className="bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded text-gray-400 hover:text-white transition-colors"
                >
                  Mint ${MINT_AMOUNT}
                </button>
              </div>
              {currentPrice !== undefined && currentPrice > 0n && (
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500">
                    Approved: ${allowance ? formatPrice(allowance) : '0.00'}
                  </span>
                  <span className={allowance && allowance >= currentPrice ? 'text-green-500' : 'text-gray-500'}>
                    {allowance && allowance >= currentPrice ? '✓ Ready' : 'Need approval'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Processing State */}
        {showProcessing && (
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
              {(isApprovePending || isApproveLoading)
                ? 'Approving USDC...'
                : 'Processing Takeover...'}
            </p>
            <p className="text-gray-500 text-[10px] mb-3">Confirm in your wallet</p>
            <button
              onClick={() => {
                console.log('🔄 Manual reset triggered');
                setTransactionStep('idle');
                resetApprove();
                resetTakeover();
              }}
              className="text-gray-400 hover:text-white text-[10px] underline"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
