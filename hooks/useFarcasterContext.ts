import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

export function useFarcasterContext() {
  const [context, setContext] = useState(sdk.context);

  useEffect(() => {
    // Context is available immediately, but we can track updates
    setContext(sdk.context);
  }, []);

  return context;
}

export function useFarcasterUser() {
  const context = useFarcasterContext();
  return context.user;
}

export function useFarcasterClient() {
  const context = useFarcasterContext();
  return context.client;
}

export function useFarcasterFeatures() {
  const context = useFarcasterContext();
  return context.features;
}
