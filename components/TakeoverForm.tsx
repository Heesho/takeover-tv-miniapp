"use client";

import { useState, useEffect } from 'react';
import { formatUnits } from 'viem';
import { isValidTwitchUrl } from '@/utils/twitch';

interface TakeoverFormProps {
  currentPrice: bigint;
  userBalance: bigint;
  userAllowance: bigint;
  onTakeover: (url: string) => void;
  onApprove: (amount: bigint) => void;
  isPending: boolean;
  isApprovePending: boolean;
  isApproveSuccess: boolean;
  isTakeoverSuccess: boolean;
  shouldShowApproveSuccess: boolean;
  shouldShowTakeoverSuccess: boolean;
  approveErrorMessage?: string;
  takeoverErrorMessage?: string;
  initialUrl?: string;
}

export function TakeoverForm({
  currentPrice,
  userBalance,
  userAllowance,
  onTakeover,
  onApprove,
  isPending,
  isApprovePending,
  isApproveSuccess,
  isTakeoverSuccess,
  shouldShowApproveSuccess,
  shouldShowTakeoverSuccess,
  approveErrorMessage,
  takeoverErrorMessage,
  initialUrl,
}: TakeoverFormProps) {
  const [url, setUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [message, setMessage] = useState('');

  // Auto-clear any banner message after a short delay and allow manual dismiss
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(''), 2000);
    return () => clearTimeout(t);
  }, [message]);

  // Prefill URL from context (e.g., cast_share/cast_embed), if provided
  useEffect(() => {
    if (!url && initialUrl && isValidTwitchUrl(initialUrl)) {
      setUrl(initialUrl);
    }
  }, [initialUrl, url]);

  useEffect(() => {
    setIsValidUrl(url ? isValidTwitchUrl(url) : false);
  }, [url]);

  // Show success message when parent indicates we should (handles power cycle correctly)
  useEffect(() => {
    if (shouldShowApproveSuccess) {
      setMessage('Approval successful! Click TAKE0VER to continue.');
    }
  }, [shouldShowApproveSuccess]);

  useEffect(() => {
    if (shouldShowTakeoverSuccess) {
      setMessage('TAKE0VER SUCCESSFUL!');
      setUrl('');
    }
  }, [shouldShowTakeoverSuccess]);

  // Surface any async transaction errors from parent
  useEffect(() => {
    if (approveErrorMessage) {
      setMessage(approveErrorMessage);
    }
  }, [approveErrorMessage]);

  useEffect(() => {
    if (takeoverErrorMessage) {
      setMessage(takeoverErrorMessage);
    }
  }, [takeoverErrorMessage]);

  // When price is $0, no approval or balance check needed
  const isFreePrice = currentPrice === 0n;
  const needsApproval = !isFreePrice && userAllowance < currentPrice;
  const hasInsufficientBalance = !isFreePrice && currentPrice > userBalance;

  const handleApprove = () => {
    if (!isValidUrl) return;
    try {
      onApprove(currentPrice);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Approval failed. Please try again.';
      setMessage(errorMessage);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleTakeover = () => {
    if (!isValidUrl) return;
    try {
      onTakeover(url);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Take0ver failed. Please try again.';
      setMessage(errorMessage);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const getButtonText = () => {
    if (!isValidUrl) return 'ENTER A VALID URL';
    if (hasInsufficientBalance) return 'INSUFFICIENT BALANCE';
    if (needsApproval) return 'APPROVE';
    return 'TAKE0VER';
  };

  const isButtonDisabled = !isValidUrl || hasInsufficientBalance || isPending || isApprovePending;

  const formattedBalance = formatUnits(userBalance, 6);
  const formattedPrice = formatUnits(currentPrice, 6);

  return (
    <div className="px-4 space-y-3 text-sm flex-grow flex flex-col justify-end pt-2">
      {/* URL Input */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <label htmlFor="video-url">BROADCAST A STREAM</label>
          </div>
          <span className={`text-xs ${isValidUrl ? 'text-green-500' : url ? 'text-red-500' : ''}`}>
            {url && (isValidUrl ? 'Valid URL' : 'Invalid URL')}
          </span>
        </div>
        <input
          type="text"
          id="video-url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://twitch.tv/channelname"
          disabled={isPending || isApprovePending}
          className="w-full bg-black border border-gray-700 rounded p-2 text-sm focus:outline-none focus:border-retro-pink focus:ring-1 focus:ring-retro-pink disabled:opacity-50"
        />
      </div>

      {/* Action Button */}
      <button
        onClick={() => (needsApproval ? handleApprove() : handleTakeover())}
        disabled={isButtonDisabled}
        className="w-full p-2.5 rounded-lg takeover-button font-bold transition-opacity disabled:opacity-50"
      >
        {isPending || isApprovePending ? 'PROCESSING...' : getButtonText()}
      </button>

      {/* Balance & Price */}
      <div className="flex justify-between items-center text-sm px-1">
        <p className="text-retro-pink font-bold">Pay ${parseFloat(formattedPrice).toFixed(2)}</p>
        <p className="text-gray-400">Balance: ${parseFloat(formattedBalance).toFixed(2)}</p>
      </div>

      {/* Info Text */}
      <p className="text-xs text-gray-500 text-center leading-tight pt-1">
        Take0ver the TV to broadcast a stream. Price doubles on takeover then drops to $0 over 1 hour. 90% of the takeover payment goes to the previous broadcaster.
      </p>

      {/* Message Overlay */}
      {message && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 cursor-pointer"
          onClick={() => setMessage('')}
        >
          <p className="text-white text-lg text-center">{message}</p>
        </div>
      )}
    </div>
  );
}


