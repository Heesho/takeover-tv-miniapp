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
  });

  // Watch for Takeover events to refetch
  useWatchContractEvent({
    address: env.televisionAddress,
    abi: televisionABI,
    eventName: 'Television__Takeover',
    onLogs: () => {
      refetch();
    },
  });

  return {
    owner: data?.owner as Address | undefined,
    uri: data?.uri as string | undefined,
    epochId: data?.epochId as number | undefined,
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
  });

  const { data: contractPrice, isLoading } = useReadContract({
    address: env.televisionAddress,
    abi: televisionABI,
    functionName: 'getPrice',
  });

  // Client-side price decay calculation
  useEffect(() => {
    // Extract values from tuple
    const initPrice = slot0Data?.[0]?.initPrice || slot0Data?.initPrice;
    const startTime = slot0Data?.[0]?.startTime || slot0Data?.startTime;

    if (!initPrice || !startTime) {
      setPrice(contractPrice);
      return;
    }

    const initPriceBigInt = BigInt(initPrice);
    const startTimeNumber = Number(startTime);
    const EPOCH_PERIOD = 24 * 60 * 60; // 24 hours in seconds

    const updatePrice = () => {
      const now = Math.floor(Date.now() / 1000);
      const timePassed = now - startTimeNumber;

      if (timePassed >= EPOCH_PERIOD) {
        setPrice(0n);
        return;
      }

      if (timePassed < 0) {
        setPrice(initPriceBigInt);
        return;
      }

      // Linear decay: price = initPrice - (initPrice * timePassed / EPOCH_PERIOD)
      const decayedPrice = initPriceBigInt - (initPriceBigInt * BigInt(timePassed)) / BigInt(EPOCH_PERIOD);
      setPrice(decayedPrice > 0n ? decayedPrice : 0n);
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
  });

  return quoteToken as Address | undefined;
}

export function useTakeoverEvents(onTakeover?: (channelOwner: Address, paymentAmount: bigint) => void) {
  useWatchContractEvent({
    address: env.televisionAddress,
    abi: televisionABI,
    eventName: 'Television__Takeover',
    onLogs: (logs) => {
      for (const log of logs) {
        if (log.args.channelOwner && log.args.paymentAmount !== undefined) {
          onTakeover?.(log.args.channelOwner, log.args.paymentAmount);
        }
      }
    },
  });
}
