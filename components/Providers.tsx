'use client';

import { ReactNode, useState, useEffect } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/wagmi';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Create QueryClient inside component to avoid re-initialization issues
  const [queryClient] = useState(() => new QueryClient());

  // Defensive check for ethereum provider conflicts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Log if ethereum is already defined (for debugging)
      if (window.ethereum) {
        console.log('window.ethereum already defined:', window.ethereum);
      }
    }
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
