'use client';

import { useEffect, useState, useRef } from 'react';
import { extractYouTubeId, isYouTubeUri } from '@/utils/youtube';

interface VideoPlayerProps {
  uri: string | undefined;
  isLoading?: boolean;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function VideoPlayer({ uri, isLoading }: VideoPlayerProps) {
  const [showStatic, setShowStatic] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const previousUriRef = useRef<string | undefined>(uri);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    // Initialize audio element for static sound
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio();
    }

    // Load YouTube IFrame API
    if (typeof window !== 'undefined' && !window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  useEffect(() => {
    // Detect URI change
    if (uri !== previousUriRef.current && previousUriRef.current !== undefined) {
      // Show static transition
      setShowStatic(true);

      // Play static sound
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      // After 1.5 seconds, hide static and show new video
      setTimeout(() => {
        setShowStatic(false);
        if (uri && isYouTubeUri(uri)) {
          const videoId = extractYouTubeId(uri);
          setCurrentVideoId(videoId);
        } else {
          setCurrentVideoId(null);
        }
      }, 1500);
    } else if (uri && !currentVideoId) {
      // Initial load
      if (isYouTubeUri(uri)) {
        const videoId = extractYouTubeId(uri);
        setCurrentVideoId(videoId);
      }
    }

    previousUriRef.current = uri;
  }, [uri, currentVideoId]);

  // Initialize YouTube player with API for better autoplay control
  useEffect(() => {
    if (!currentVideoId || showStatic) return;

    const initPlayer = () => {
      if (window.YT && window.YT.Player && containerRef.current) {
        // Destroy previous player if exists
        if (playerRef.current) {
          playerRef.current.destroy();
        }

        // Create new player
        playerRef.current = new window.YT.Player(containerRef.current, {
          videoId: currentVideoId,
          playerVars: {
            autoplay: 1,
            controls: 1,
            rel: 0,
            loop: 1,
            playlist: currentVideoId,
            playsinline: 1,
            modestbranding: 1,
          },
          events: {
            onReady: (event: any) => {
              // Unmute and play when ready
              event.target.unMute();
              event.target.playVideo();
            },
            onError: (event: any) => {
              console.error('YouTube player error:', event.data);
            },
          },
        });
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [currentVideoId, showStatic]);


  if (isLoading) {
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (showStatic) {
    return (
      <div className="w-full aspect-video bg-black relative overflow-hidden tv-static">
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-white text-2xl md:text-4xl font-bold opacity-80 mix-blend-difference">
            TAKEOVER IN PROGRESS...
          </div>
        </div>
      </div>
    );
  }

  if (!uri || !currentVideoId) {
    return (
      <div className="w-full aspect-video bg-black relative overflow-hidden tv-static">
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="text-white text-3xl md:text-5xl font-bold mb-4">
              STANDBY
            </div>
            <div className="text-gray-400 text-sm md:text-base">
              No signal detected
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video bg-black">
      <div
        ref={containerRef}
        className="w-full h-full"
      />
    </div>
  );
}
