/**
 * Extracts the Twitch channel name from various URL formats
 */
export function getTwitchChannel(url: string): string | null {
  const regex = /(?:https?:\/\/)?(?:www\.)?twitch\.tv\/([a-zA-Z0-9_]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

/**
 * Validates if a string is a valid Twitch URL or channel name
 */
export function isValidTwitchUrl(url: string): boolean {
  return getTwitchChannel(url) !== null;
}

/**
 * Constructs a Twitch player iframe URL with proper parent domains for Farcaster clients
 */
export function buildTwitchPlayerUrl(channelName: string): string {
  const knownParents = [
    'client.warpcast.com',
    'supercast.xyz',
    'embeds.lfg.castle.fyi',
    'farcaster.xyz', // Farcaster developer preview tool
  ];

  // Get current hostname (works in browser only)
  if (typeof window !== 'undefined') {
    const currentHost = window.location.hostname;

    // For localhost, we need to add it without the port
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
      if (!knownParents.includes('localhost')) {
        knownParents.push('localhost');
      }
    } else if (currentHost && !knownParents.includes(currentHost)) {
      // For production domains (Vercel, etc.)
      knownParents.push(currentHost);
    }
  }

  const parentParams = knownParents.map(p => `parent=${p}`).join('&');

  return `https://player.twitch.tv/?channel=${channelName}&${parentParams}&autoplay=true&muted=true`;
}
