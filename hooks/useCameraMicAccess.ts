'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { useMiniAppCapabilities } from './useMiniAppCapabilities';

type Status = 'unknown' | 'granted' | 'denied' | 'unsupported';

export function useCameraMicAccess() {
  const { capabilities } = useMiniAppCapabilities();
  const [status, setStatus] = useState<Status>('unknown');

  // Determine if host exposes the permission action
  const canRequest = useMemo(
    () => Boolean(capabilities?.includes('actions.requestCameraAndMicrophoneAccess')),
    [capabilities]
  );

  // Prime status from context.features if present
  useEffect(() => {
    (async () => {
      try {
        const ctx = await (sdk as any).context;
        if (ctx?.features?.cameraAndMicrophoneAccess === true) {
          setStatus('granted');
        } else if (!canRequest) {
          setStatus('unsupported');
        }
      } catch {
        /* noop */
      }
    })();
  }, [canRequest]);

  const request = useCallback(async () => {
    if (!canRequest) {
      setStatus('unsupported');
      return;
    }
    try {
      await (sdk as any)?.actions?.requestCameraAndMicrophoneAccess?.();
      setStatus('granted');
    } catch {
      setStatus('denied');
    }
  }, [canRequest]);

  return { status, canRequest, request };
}

