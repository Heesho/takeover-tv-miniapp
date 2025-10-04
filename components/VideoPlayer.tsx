'use client';

import { useEffect, useState, useRef } from 'react';
import { extractYouTubeId, getYouTubeEmbedUrl, isYouTubeUri } from '@/utils/youtube';

interface VideoPlayerProps {
  uri: string | undefined;
  isLoading?: boolean;
}

export function VideoPlayer({ uri, isLoading }: VideoPlayerProps) {
  const [showStatic, setShowStatic] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const previousUriRef = useRef<string | undefined>(uri);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio element for static sound
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio();
      // You can add a static sound URL here if you have one
      // audioRef.current.src = '/static-sound.mp3';
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
        audioRef.current.play().catch(() => {
          // Ignore autoplay errors
        });
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
            SWITCHING...
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
      <iframe
        key={currentVideoId}
        width="100%"
        height="100%"
        src={getYouTubeEmbedUrl(currentVideoId)}
        title="TakeoverTV"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}
