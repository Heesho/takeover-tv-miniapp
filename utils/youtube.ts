/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYouTubeId(url: string): string | null {
  try {
    const urlObj = new URL(url);

    // Handle youtu.be short links
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }

    // Handle youtube.com links
    if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      // Check for /watch?v= format
      const videoId = urlObj.searchParams.get('v');
      if (videoId) return videoId;

      // Check for /embed/ format
      if (urlObj.pathname.startsWith('/embed/')) {
        return urlObj.pathname.split('/')[2];
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Validate if a YouTube URL is embeddable
 * Note: This is a client-side check. The video might still be restricted.
 */
export function isValidYouTubeUrl(url: string): boolean {
  const videoId = extractYouTubeId(url);
  return videoId !== null && videoId.length === 11;
}

/**
 * Get YouTube embed URL from video ID
 */
export function getYouTubeEmbedUrl(videoId: string, muted: boolean = false): string {
  console.log('Creating embed URL for video:', videoId, 'muted:', muted);
  // Autoplay with sound - user interaction from power button allows this
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${muted ? 1 : 0}&controls=1&rel=0&enablejsapi=1&loop=1&playlist=${videoId}&playsinline=1&modestbranding=1`;
}

/**
 * Check if a URI is a valid YouTube URL
 */
export function isYouTubeUri(uri: string): boolean {
  if (!uri || uri.trim() === '') return false;
  return isValidYouTubeUrl(uri);
}
