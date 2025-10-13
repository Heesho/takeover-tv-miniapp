'use client';

import { useEffect, useRef } from 'react';
import defaultSdk, { sdk as namedSdk } from '@farcaster/miniapp-sdk';

export function MiniAppReady() {
  const calledRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        if (calledRef.current) return;

        const tryReady = async () => {
          try {
            const bridge: any = (namedSdk as any) ?? (defaultSdk as any);
            await bridge?.actions?.ready?.();
            calledRef.current = true;
            console.log('[MiniAppReady] ready() success');
            return true;
          } catch (e) {
            console.warn('[MiniAppReady] ready() failed, retrying...', e);
            return false;
          }
        };

        if (!(await tryReady())) {
          let attempts = 0;
          const id = window.setInterval(async () => {
            if (calledRef.current) {
              clearInterval(id);
              return;
            }
            attempts += 1;
            const ok = await tryReady();
            if (ok || attempts >= 20) {
              clearInterval(id);
              if (!ok) console.warn('[MiniAppReady] ready() retries exhausted');
            }
          }, 300);
        }
      } catch (e) {
        console.warn('[MiniAppReady] bootstrap error', e);
      }
    })();
  }, []);

  return null;
}
