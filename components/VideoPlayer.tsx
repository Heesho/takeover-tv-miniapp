'use client';

import { useEffect, useRef, useState } from 'react';
import { buildTwitchPlayerUrl, getTwitchChannel } from '@/utils/twitch';

interface VideoPlayerProps {
  url: string;
  isActive: boolean;
}

export function VideoPlayer({ url, isActive }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Check if URL is empty or not a valid Twitch URL
    const channelName = url ? getTwitchChannel(url) : null;

    if (!channelName) {
      setHasError(true);
      if (url) {
        console.error('Invalid Twitch URL:', url);
      }
      return;
    }

    setHasError(false);

    // Clear previous content
    containerRef.current.innerHTML = '';

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = buildTwitchPlayerUrl(channelName);
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.allowFullscreen = true;
    iframe.style.border = 'none';

    containerRef.current.appendChild(iframe);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [url, isActive]);

  // Show TV static when not active, or when there's no valid URL
  if (!isActive || hasError) {
    return (
      <div className="w-full h-full bg-black relative">
        <div className="scanline"></div>
        <div className="tv-static"></div>
      </div>
    );
  }

  return <div ref={containerRef} className="w-full h-full bg-black" />;
}
