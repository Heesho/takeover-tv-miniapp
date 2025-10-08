import { useEffect, useState } from 'react';

export interface FarcasterProfile {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  verifiedAddresses: string[];
}

interface UseFarcasterProfileResult {
  profile: FarcasterProfile | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch a Farcaster profile by Ethereum address
 *
 * @param address - The Ethereum address to look up
 * @returns The Farcaster profile, loading state, and any errors
 */
export function useFarcasterProfile(address?: string): UseFarcasterProfileResult {
  const [profile, setProfile] = useState<FarcasterProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Reset state if no address provided
    if (!address) {
      setProfile(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;
    const addressToFetch = address; // Capture address in closure for TypeScript

    async function fetchProfile() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/farcaster/user?address=${encodeURIComponent(addressToFetch)}`);

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();

        if (isMounted) {
          // If no user found for this address, set profile to null
          setProfile(data.user || null);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching Farcaster profile:', err);
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setProfile(null);
          setIsLoading(false);
        }
      }
    }

    fetchProfile();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [address]);

  return { profile, isLoading, error };
}
