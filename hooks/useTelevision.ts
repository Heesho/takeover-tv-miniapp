import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
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
  takeover: (uri: string) => Promise<void>;
  approve: (amount: bigint) => Promise<void>;

  // Transaction states
  isTakeoverPending: boolean;
  isApprovePending: boolean;
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
  const { data: userBalance = 0n } = useReadContract({
    address: env.usdcContract,
    abi: usdcAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Read user's USDC allowance for the Television contract
  const { data: userAllowance = 0n } = useReadContract({
    address: env.usdcContract,
    abi: usdcAbi,
    functionName: 'allowance',
    args: address ? [address, env.televisionContract] : undefined,
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

  // Wait for approve transaction
  const { isLoading: isApproveConfirming } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Wait for takeover transaction
  const { isLoading: isTakeoverConfirming, isSuccess: isTakeoverSuccess } = useWaitForTransactionReceipt({
    hash: takeoverHash,
  });

  // Refetch data after successful takeover
  if (isTakeoverSuccess) {
    refetchSlot0();
    refetchPrice();
  }

  // Actions
  const approve = async (amount: bigint) => {
    if (!address) throw new Error('Wallet not connected');

    writeApprove({
      address: env.usdcContract,
      abi: usdcAbi,
      functionName: 'approve',
      args: [env.televisionContract, amount],
    });
  };

  const takeover = async (uri: string) => {
    if (!address) throw new Error('Wallet not connected');
    if (!slot0Data) throw new Error('Channel data not loaded');

    // Calculate deadline: 10 minutes from now
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 600);

    // Set max payment amount: current price + 10% buffer to prevent front-running
    const maxPaymentAmount = currentPrice + (currentPrice * 10n) / 100n;

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
    takeoverError: takeoverWriteError as Error | null,
    approveError: approveWriteError as Error | null,
  };
}
