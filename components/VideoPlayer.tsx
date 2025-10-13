'use client';

import { useEffect, useRef, useState } from 'react';
import { getTwitchChannel, getKnownParentDomains } from '@/utils/twitch';

interface VideoPlayerProps {
  url: string;
  isActive: boolean;
  // Bump this when a user gesture should force unmute+play
  unmuteKey?: number;
}

// Declare Twitch global type
declare global {
  interface Window {
    Twitch?: {
      Player: new (elementId: string, options: any) => TwitchPlayer;
    };
  }
}

interface TwitchPlayer {
  setChannel(channel: string): void;
  setMuted(muted: boolean): void;
  play(): void;
  pause(): void;
  destroy(): void;
  addEventListener(event: string, callback: () => void): void;
}

export function VideoPlayer({ url, isActive, unmuteKey }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<TwitchPlayer | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [twitchReady, setTwitchReady] = useState(false);
  const [needsUnmute, setNeedsUnmute] = useState(false);
  const pendingUnmuteRef = useRef(false);

  // Extract channel name
  const channelName = url ? getTwitchChannel(url) : null;

  // Ensure the Twitch Player API is loaded before attempting to create the player
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.Twitch?.Player) {
      setTwitchReady(true);
      return;
    }

    // Attempt to detect when the script loads (polling fallback)
    let tries = 0;
    const maxTries = 50; // ~10s at 200ms
    const interval = setInterval(() => {
      tries += 1;
      if (window.Twitch?.Player) {
        setTwitchReady(true);
        clearInterval(interval);
      } else if (tries >= maxTries) {
        console.error('Twitch Player API not available after waiting');
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isActive || !containerRef.current || !channelName) {
      if (!channelName && url) {
        console.error('Invalid Twitch URL:', url);
        setHasError(true);
      }
      return;
    }

    if (!twitchReady) {
      // Wait until Twitch API is ready
      return;
    }

    console.log('VideoPlayer initializing for channel:', channelName);
    setHasError(false);

    // Generate unique ID for this player instance
    const playerId = `twitch-player-${Date.now()}`;

    // Clear previous content and create player container
    containerRef.current.innerHTML = '';
    const playerDiv = document.createElement('div');
    playerDiv.id = playerId;
    playerDiv.style.width = '100%';
    playerDiv.style.height = '100%';
    containerRef.current.appendChild(playerDiv);

    try {
      const knownParents = getKnownParentDomains();
      console.log('Creating Twitch Player with parents:', knownParents);

      // Create the Twitch Player (guard and assert availability for TS)
      const twitchApi = (window as any).Twitch as { Player?: new (id: string, options: any) => TwitchPlayer } | undefined;
      if (!twitchApi || !twitchApi.Player) {
        console.error('Twitch API not available at player creation time');
        setHasError(true);
        return;
      }
      const player = new twitchApi.Player(playerId, {
        width: '100%',
        height: '100%',
        channel: channelName,
        parent: knownParents,
        autoplay: true,
        muted: false, // Attempt unmuted; some clients may still require user gesture
        allowfullscreen: true,
      });

      // Listen for ready event
      player.addEventListener('ready', () => {
        console.log('Twitch Player ready');
        setIsPlayerReady(true);

        // Ensure unmuted playback (redundant but ensures it works)
        try {
          player.setMuted(false);
          (player as any).setVolume?.(0.6);
          player.play();
          setNeedsUnmute(false);
        } catch {}

        // Apply any pending user-gesture unmute
        if (pendingUnmuteRef.current) {
          try {
            player.setMuted(false);
            (player as any).setVolume?.(0.6);
            player.play();
            pendingUnmuteRef.current = false;
            setNeedsUnmute(false);
          } catch {}
        }
      });

      // Autoplay blocked handler: wait for first user gesture, then unmute+play
      try {
        (player as any).addEventListener?.('PLAYBACK_BLOCKED', () => {
          console.warn('Twitch autoplay blocked – awaiting user gesture');
          setNeedsUnmute(true);
          const onFirstPointer = () => {
            try {
              player.setMuted(false);
              (player as any).setVolume?.(0.6);
              player.play();
            } catch {}
            setNeedsUnmute(false);
            document.removeEventListener('pointerdown', onFirstPointer, true);
          };
          document.addEventListener('pointerdown', onFirstPointer, true);
        });
      } catch {}

      playerRef.current = player;

      console.log('Twitch Player created successfully');
    } catch (error) {
      console.error('Error creating Twitch Player:', error);
      setHasError(true);
    }

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.error('Error destroying player:', error);
        }
        playerRef.current = null;
      }
      setIsPlayerReady(false);
    };
  }, [url, channelName, isActive, twitchReady]);

  // Update channel when URL changes (for takeovers)
  useEffect(() => {
    if (isPlayerReady && playerRef.current && channelName) {
      console.log('Updating channel to:', channelName);
      playerRef.current.setChannel(channelName);
      // Ensure it stays unmuted after channel change
      try {
        playerRef.current.setMuted(false);
        (playerRef.current as any).setVolume?.(0.6);
        playerRef.current.play();
        setNeedsUnmute(false);
      } catch {}
    }
  }, [channelName, isPlayerReady]);

  // Force unmute+play in response to a user gesture (e.g., power-on)
  useEffect(() => {
    if (!unmuteKey) return;
    if (playerRef.current && isPlayerReady) {
      try {
        playerRef.current.setMuted(false);
        (playerRef.current as any).setVolume?.(0.6);
        playerRef.current.play();
        setNeedsUnmute(false);
      } catch {
        // If player not ready to accept commands, queue it
        pendingUnmuteRef.current = true;
      }
    } else {
      pendingUnmuteRef.current = true;
    }
  }, [unmuteKey, isPlayerReady]);

  // Show TV static when not active, or when there's an error
  if (!isActive || hasError) {
    return (
      <div className="w-full h-full bg-black relative">
        <div className="scanline"></div>
        <div className="tv-static"></div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full bg-black relative">
      {needsUnmute && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/55 text-white text-xs px-3 py-1 rounded">Tap anywhere to unmute</div>
        </div>
      )}
    </div>
  );
}
