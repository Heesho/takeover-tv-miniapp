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

    console.log('VideoPlayer received URL:', url);

    // Check if URL is empty or not a valid Twitch URL
    const channelName = url ? getTwitchChannel(url) : null;
    console.log('Extracted channel name:', channelName);

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
    const embedUrl = buildTwitchPlayerUrl(channelName);
    console.log('Twitch embed URL:', embedUrl);
    console.log('Current hostname:', window.location.hostname);

    iframe.src = embedUrl;
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.allowFullscreen = true;
    iframe.style.border = 'none';

    // Add error handler
    iframe.onerror = () => {
      console.error('Iframe failed to load');
      setHasError(true);
    };

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
