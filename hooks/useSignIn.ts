"use client";

import { useCallback, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { useMiniAppCapabilities } from './useMiniAppCapabilities';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function useSignIn() {
  const { capabilities } = useMiniAppCapabilities();
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const canSignIn = Boolean(capabilities?.includes('actions.signIn'));

  const signIn = useCallback(async () => {
    if (!canSignIn) return { ok: false, reason: 'unsupported' } as const;
    setStatus('loading');
    setError(null);
    try {
      const nonceRes = await fetch('/api/auth/nonce', { cache: 'no-store' });
      const { nonce } = await nonceRes.json();
      if (!nonce) throw new Error('Failed to get nonce');

      const result = await (sdk as any)?.actions?.signIn?.({
        nonce,
        acceptAuthAddress: true,
      });

      const verifyRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: result?.message, signature: result?.signature }),
      });

      if (!verifyRes.ok) throw new Error('Verification failed');

      setStatus('success');
      return { ok: true } as const;
    } catch (e: any) {
      setStatus('error');
      const name = e?.name || '';
      if (/RejectedByUser/i.test(name)) {
        setError('User rejected sign-in');
        return { ok: false, reason: 'rejected_by_user' as const };
      }
      setError(e?.message || 'Sign-in failed');
      return { ok: false, reason: 'failed' as const };
    }
  }, [canSignIn]);

  return { canSignIn, status, error, signIn };
}
