'use client';

import { useState, useEffect } from 'react';
import { formatUnits } from 'viem';
import { isValidTwitchUrl } from '@/utils/twitch';

interface TakeoverFormProps {
  currentPrice: bigint;
  userBalance: bigint;
  userAllowance: bigint;
  onTakeover: (url: string) => Promise<void>;
  onApprove: (amount: bigint) => Promise<void>;
  isPending: boolean;
  isApprovePending: boolean;
}

export function TakeoverForm({
  currentPrice,
  userBalance,
  userAllowance,
  onTakeover,
  onApprove,
  isPending,
  isApprovePending,
}: TakeoverFormProps) {
  const [url, setUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setIsValidUrl(url ? isValidTwitchUrl(url) : false);
  }, [url]);

  const needsApproval = userAllowance < currentPrice;
  const hasInsufficientBalance = currentPrice > userBalance;

  const handleSubmit = async () => {
    if (!isValidUrl) return;

    try {
      if (needsApproval) {
        setMessage('Approving USDC...');
        await onApprove(currentPrice);
        setMessage('Approval successful! Now executing takeover...');
      }

      setMessage('Executing Takeover...');
      await onTakeover(url);
      setMessage('TAKEOVER SUCCESSFUL!');
      setUrl('');

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Takeover failed:', error);
      setMessage('Takeover failed. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const getButtonText = () => {
    if (!isValidUrl) return 'ENTER A VALID URL';
    if (hasInsufficientBalance) return 'INSUFFICIENT BALANCE';
    if (needsApproval) return 'APPROVE & TAKEOVER';
    return 'TAKEOVER';
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
            <label htmlFor="video-url">BROADCAST YOUR STREAM</label>
          </div>
          <span className={`text-xs ${isValidUrl ? 'text-green-500' : url ? 'text-red-500' : ''}`}>
            {url && (isValidUrl ? '✓ Valid URL' : '✗ Invalid URL')}
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

      {/* Takeover Button */}
      <button
        onClick={handleSubmit}
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
        Takeover the TV to broadcast your video. Price doubles on takeover then drops to $0 over 1
        hour.
      </p>

      {/* Message Overlay */}
      {message && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <p className="text-white text-lg text-center">{message}</p>
        </div>
      )}
    </div>
  );
}
