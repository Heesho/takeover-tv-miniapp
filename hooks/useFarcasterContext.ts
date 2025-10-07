import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
}

interface FarcasterContext {
  user: FarcasterUser | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to access Farcaster user context from the Mini App SDK
 */
export function useFarcasterContext(): FarcasterContext {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadContext() {
      try {
        const context = await sdk.context;

        if (context?.user) {
          setUser({
            fid: context.user.fid,
            username: context.user.username || '',
            displayName: context.user.displayName || '',
            pfpUrl: context.user.pfpUrl || '',
          });
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load Farcaster context:', err);
        setError(err instanceof Error ? err : new Error('Failed to load context'));
        setIsLoading(false);
      }
    }

    loadContext();
  }, []);

  return { user, isLoading, error };
}
