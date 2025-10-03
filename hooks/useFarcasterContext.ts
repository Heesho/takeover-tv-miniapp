import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

type MiniAppContext = Awaited<typeof sdk.context>;

export function useFarcasterContext() {
  const [context, setContext] = useState<MiniAppContext | null>(null);

  useEffect(() => {
    sdk.context.then(setContext);
  }, []);

  return context;
}

export function useFarcasterUser() {
  const context = useFarcasterContext();
  return context?.user;
}

export function useFarcasterClient() {
  const context = useFarcasterContext();
  return context?.client;
}

export function useFarcasterFeatures() {
  const context = useFarcasterContext();
  return context?.features;
}
