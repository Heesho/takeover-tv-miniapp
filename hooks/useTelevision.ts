import { useEffect, useState } from 'react';
import { useReadContract, useWatchContractEvent, usePublicClient } from 'wagmi';
import { televisionABI } from '@/contracts/television-abi';
import { env } from '@/utils/env';
import type { Address } from 'viem';

export function useCurrentChannel() {
  const { data, isLoading, refetch } = useReadContract({
    address: env.televisionAddress,
    abi: televisionABI,
    functionName: 'getSlot0',
    chainId: env.chainId,
  });

  // Watch for Takeover events to refetch
  useWatchContractEvent({
    address: env.televisionAddress,
    abi: televisionABI,
    eventName: 'Television__Takeover',
    chainId: env.chainId,
    onLogs: () => {
      refetch();
    },
  });

  return {
    owner: data?.owner as Address | undefined,
    uri: data?.uri as string | undefined,
    epochId: data?.epochId !== undefined ? Number(data.epochId) : undefined,
    isLoading,
    refetch,
  };
}

export function useCurrentPrice() {
  const [price, setPrice] = useState<bigint | undefined>();

  // Get slot0 data for initPrice and startTime
  const { data: slot0Data } = useReadContract({
    address: env.televisionAddress,
    abi: televisionABI,
    functionName: 'getSlot0',
    chainId: env.chainId,
  });

  const { data: contractPrice, isLoading } = useReadContract({
    address: env.televisionAddress,
    abi: televisionABI,
    functionName: 'getPrice',
    chainId: env.chainId,
  });

  // Client-side price decay calculation
  useEffect(() => {
    if (!slot0Data?.initPrice || !slot0Data?.startTime) {
      setPrice(contractPrice);
      return;
    }

    const initPrice = slot0Data.initPrice as bigint;
    const startTime = Number(slot0Data.startTime);
    const EPOCH_PERIOD = 60 * 60; // 1 hour in seconds

    const updatePrice = () => {
      const now = Math.floor(Date.now() / 1000);
      const timePassed = now - startTime;

      if (timePassed >= EPOCH_PERIOD) {
        setPrice(0n);
        return;
      }

      // Linear decay: price = initPrice - (initPrice * timePassed / EPOCH_PERIOD)
      const decayedPrice = initPrice - (initPrice * BigInt(timePassed)) / BigInt(EPOCH_PERIOD);
      const finalPrice = decayedPrice > 0n ? decayedPrice : 0n;
      setPrice(finalPrice);
    };

    // Update immediately
    updatePrice();

    // Update every second for smooth countdown
    const interval = setInterval(updatePrice, 1000);

    return () => clearInterval(interval);
  }, [slot0Data, contractPrice]);

  return { price, isLoading };
}

export function useQuoteToken() {
  const { data: quoteToken } = useReadContract({
    address: env.televisionAddress,
    abi: televisionABI,
    functionName: 'quote',
    chainId: env.chainId,
  });

  return quoteToken as Address | undefined;
}

export function useTakeoverEvents(onTakeover?: (channelOwner: Address, paymentAmount: bigint) => void) {
  useWatchContractEvent({
    address: env.televisionAddress,
    abi: televisionABI,
    eventName: 'Television__Takeover',
    chainId: env.chainId,
    onLogs: (logs) => {
      for (const log of logs) {
        if (log.args.channelOwner && log.args.paymentAmount !== undefined) {
          onTakeover?.(log.args.channelOwner, log.args.paymentAmount);
        }
      }
    },
  });
}
