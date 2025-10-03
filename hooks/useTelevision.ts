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
  const [isPolling, setIsPolling] = useState(true);
  const publicClient = usePublicClient();

  const { data: initialPrice, isLoading } = useReadContract({
    address: env.televisionAddress,
    abi: televisionABI,
    functionName: 'getPrice',
  });

  useEffect(() => {
    if (initialPrice !== undefined) {
      setPrice(initialPrice);
    }
  }, [initialPrice]);

  // Poll for price updates every 5 seconds since it decays continuously
  // Stop polling when app is in background (performance optimization)
  useEffect(() => {
    if (!publicClient || !isPolling) return;

    const interval = setInterval(async () => {
      try {
        const currentPrice = await publicClient.readContract({
          address: env.televisionAddress,
          abi: televisionABI,
          functionName: 'getPrice',
        });
        setPrice(currentPrice);
      } catch (error) {
        console.error('Error fetching price:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [publicClient, isPolling]);

  // Pause polling when app is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPolling(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

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
