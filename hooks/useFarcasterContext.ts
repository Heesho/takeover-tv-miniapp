import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { isInMiniAppAsync } from '@/utils/miniapp';

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
    let mounted = true;

    async function loadContext() {
      try {
        // Fast-path: if not in miniapp (or unknown), do not block UI
        const inMini = await isInMiniAppAsync(200);
        if (!inMini) {
          if (mounted) setIsLoading(false);
          return;
        }

        // Guard sdk.context with a timeout so it can't hang forever
        const withTimeout = <T,>(p: Promise<T>, ms: number, onTimeout: () => void): Promise<T | undefined> =>
          new Promise((resolve) => {
            const t = setTimeout(() => {
              try { onTimeout(); } catch {}
              resolve(undefined);
            }, Math.max(0, ms));
            p.then((v) => { clearTimeout(t); resolve(v); })
             .catch(() => { clearTimeout(t); resolve(undefined); });
          });

        const context = await withTimeout((sdk as any)?.context, 2000, () => {
          console.warn('sdk.context timed out; proceeding without Farcaster user');
        });

        if (mounted && context && (context as any)?.user) {
          const u = (context as any).user;
          setUser({
            fid: u.fid,
            username: u.username || '',
            displayName: u.displayName || '',
            pfpUrl: u.pfpUrl || '',
          });
        }

        if (mounted) setIsLoading(false);
      } catch (err) {
        console.error('Failed to load Farcaster context:', err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to load context'));
          setIsLoading(false);
        }
      }
    }

    loadContext();

    return () => {
      mounted = false;
    };
  }, []);

  return { user, isLoading, error };
}
