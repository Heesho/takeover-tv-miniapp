'use client';

import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

export function useMiniAppCapabilities() {
  const [capabilities, setCapabilities] = useState<string[] | null>(null);

  useEffect(() => {
    let mounted = true;
    try {
      const getter = (sdk as any)?.getCapabilities as (() => Promise<string[]>) | undefined;
      if (getter) {
        getter()
          .then((caps) => {
            if (mounted) setCapabilities(Array.isArray(caps) ? caps : []);
          })
          .catch(() => {
            if (mounted) setCapabilities([]);
          });
      } else {
        setCapabilities([]);
      }
    } catch {
      setCapabilities([]);
    }
    return () => {
      mounted = false;
    };
  }, []);

  return { capabilities };
}

