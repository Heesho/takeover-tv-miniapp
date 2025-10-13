'use client';

import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

type MiniAppEventName =
  | 'miniappAdded'
  | 'miniappRemoved'
  | 'notificationsEnabled'
  | 'notificationsDisabled';

export function useMiniAppEvents() {
  const [isAdded, setIsAdded] = useState<boolean | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const onAdded = () => {
      setIsAdded(true);
      console.log('[MiniApp Event] miniappAdded');
    };
    const onRemoved = () => {
      setIsAdded(false);
      console.log('[MiniApp Event] miniappRemoved');
    };
    const onNotifEnabled = () => {
      setNotificationsEnabled(true);
      console.log('[MiniApp Event] notificationsEnabled');
    };
    const onNotifDisabled = () => {
      setNotificationsEnabled(false);
      console.log('[MiniApp Event] notificationsDisabled');
    };

    try {
      // Guard in case host does not implement event system yet
      (sdk as any)?.on?.('miniappAdded' as MiniAppEventName, onAdded);
      (sdk as any)?.on?.('miniappRemoved' as MiniAppEventName, onRemoved);
      (sdk as any)?.on?.('notificationsEnabled' as MiniAppEventName, onNotifEnabled);
      (sdk as any)?.on?.('notificationsDisabled' as MiniAppEventName, onNotifDisabled);
    } catch (e) {
      console.warn('MiniApp events not available in this host:', e);
    }

    return () => {
      try {
        (sdk as any)?.removeListener?.('miniappAdded', onAdded);
        (sdk as any)?.removeListener?.('miniappRemoved', onRemoved);
        (sdk as any)?.removeListener?.('notificationsEnabled', onNotifEnabled);
        (sdk as any)?.removeListener?.('notificationsDisabled', onNotifDisabled);
      } catch {}
    };
  }, []);

  return { isAdded, notificationsEnabled };
}

