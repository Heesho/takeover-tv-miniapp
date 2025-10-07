import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount, useSimulateContract } from 'wagmi';
import { useEffect } from 'react';
import { televisionAbi } from '@/contracts/television-abi';
import { usdcAbi } from '@/contracts/usdc-abi';
import { env } from '@/utils/env';

interface Slot0 {
  locked: number;
  epochId: number;
  initPrice: bigint;
  startTime: bigint;
  owner: string;
  uri: string;
}

interface UseTelevisionReturn {
  // Channel data
  slot0: Slot0 | null;
  currentPrice: bigint;
  isLoading: boolean;
  error: Error | null;

  // User balance
  userBalance: bigint;
  userAllowance: bigint;

  // Actions
  takeover: (uri: string) => void;
  approve: (amount: bigint) => void;

  // Transaction states
  isTakeoverPending: boolean;
  isApprovePending: boolean;
  isApproveSuccess: boolean;
  isTakeoverSuccess: boolean;
  takeoverError: Error | null;
  approveError: Error | null;
}

/**
 * Hook to interact with the Television smart contract
 */
export function useTelevision(): UseTelevisionReturn {
  const { address } = useAccount();

  // Read current slot0 (channel data) - poll every 2 seconds
  const { data: slot0Data, isLoading: isSlot0Loading, error: slot0Error, refetch: refetchSlot0 } = useReadContract({
    address: env.televisionContract,
    abi: televisionAbi,
    functionName: 'getSlot0',
    query: {
      refetchInterval: 2000, // Poll every 2 seconds
    },
  });

  // Read current price from contract - poll every 1 second for live price updates
  const { data: currentPrice = 0n, refetch: refetchPrice } = useReadContract({
    address: env.televisionContract,
    abi: televisionAbi,
    functionName: 'getPrice',
    query: {
      refetchInterval: 1000, // Poll every 1 second for price decay
    },
  });

  // Read user's USDC balance
  const { data: userBalance = 0n, error: balanceError, isLoading: isBalanceLoading } = useReadContract({
    address: env.usdcContract,
    abi: usdcAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address, // Only run when address is available
    },
  });

  // Log balance errors for debugging
  useEffect(() => {
    if (balanceError) {
      console.error('USDC balance read error:', balanceError);
    }
    if (address) {
      console.log('User address:', address);
      console.log('User USDC balance:', userBalance.toString());
      console.log('Balance loading:', isBalanceLoading);
    }
  }, [balanceError, userBalance, address, isBalanceLoading]);

  // Read user's USDC allowance for the Television contract - poll every 2 seconds
  const { data: userAllowance = 0n, refetch: refetchAllowance } = useReadContract({
    address: env.usdcContract,
    abi: usdcAbi,
    functionName: 'allowance',
    args: address ? [address, env.televisionContract] : undefined,
    query: {
      refetchInterval: 2000, // Poll every 2 seconds to detect approval changes
    },
  });

  // Write contracts
  const {
    writeContract: writeApprove,
    data: approveHash,
    isPending: isApprovePending,
    error: approveWriteError,
  } = useWriteContract();

  const {
    writeContract: writeTakeover,
    data: takeoverHash,
    isPending: isTakeoverPending,
    error: takeoverWriteError,
  } = useWriteContract();

  // Log errors for debugging
  useEffect(() => {
    if (approveWriteError) {
      console.error('Approve write error:', approveWriteError);
    }
  }, [approveWriteError]);

  useEffect(() => {
    if (takeoverWriteError) {
      console.error('Takeover write error:', takeoverWriteError);
    }
  }, [takeoverWriteError]);

  // Wait for approve transaction
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Wait for takeover transaction
  const { isLoading: isTakeoverConfirming, isSuccess: isTakeoverSuccess } = useWaitForTransactionReceipt({
    hash: takeoverHash,
  });

  // Refetch allowance after successful approval
  useEffect(() => {
    if (isApproveSuccess) {
      refetchAllowance();
    }
  }, [isApproveSuccess, refetchAllowance]);

  // Refetch data after successful takeover
  useEffect(() => {
    if (isTakeoverSuccess) {
      refetchSlot0();
      refetchPrice();
    }
  }, [isTakeoverSuccess, refetchSlot0, refetchPrice]);

  // Actions
  const approve = (amount: bigint) => {
    if (!address) throw new Error('Wallet not connected');

    console.log('Initiating approve transaction...', {
      amount: amount.toString(),
      spender: env.televisionContract,
    });

    writeApprove({
      address: env.usdcContract,
      abi: usdcAbi,
      functionName: 'approve',
      args: [env.televisionContract, amount],
    });
  };

  const takeover = (uri: string) => {
    if (!address) throw new Error('Wallet not connected');
    if (!slot0Data) throw new Error('Channel data not loaded');

    // Calculate deadline: 10 minutes from now
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 600);

    // Set max payment amount: current price + 10% buffer to prevent front-running
    const maxPaymentAmount = currentPrice + (currentPrice * 10n) / 100n;

    console.log('Initiating takeover transaction...', {
      uri,
      channelOwner: address,
      epochId: slot0Data.epochId,
      deadline: deadline.toString(),
      maxPaymentAmount: maxPaymentAmount.toString(),
      currentPrice: currentPrice.toString(),
      userAllowance: userAllowance.toString(),
    });

    // Validation checks
    if (userAllowance < currentPrice) {
      throw new Error('Insufficient USDC allowance. Please approve first.');
    }

    if (userBalance < currentPrice) {
      throw new Error('Insufficient USDC balance.');
    }

    writeTakeover({
      address: env.televisionContract,
      abi: televisionAbi,
      functionName: 'takeover',
      args: [uri, address, BigInt(slot0Data.epochId), deadline, maxPaymentAmount],
    });
  };

  // Parse slot0 data
  const slot0: Slot0 | null = slot0Data
    ? {
        locked: Number(slot0Data.locked),
        epochId: Number(slot0Data.epochId),
        initPrice: BigInt(slot0Data.initPrice),
        startTime: BigInt(slot0Data.startTime),
        owner: slot0Data.owner,
        uri: slot0Data.uri,
      }
    : null;

  return {
    slot0,
    currentPrice,
    isLoading: isSlot0Loading,
    error: slot0Error as Error | null,
    userBalance,
    userAllowance,
    takeover,
    approve,
    isTakeoverPending: isTakeoverPending || isTakeoverConfirming,
    isApprovePending: isApprovePending || isApproveConfirming,
    isApproveSuccess,
    isTakeoverSuccess,
    takeoverError: takeoverWriteError as Error | null,
    approveError: approveWriteError as Error | null,
  };
}
