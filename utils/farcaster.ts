/**
 * Checks if the app is running inside a Farcaster Mini App context
 */
export function isInMiniApp(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for Farcaster SDK availability
  return (
    window.location.search.includes('farcaster') ||
    window.location.hostname.includes('warpcast.com') ||
    window.location.hostname.includes('supercast.xyz') ||
    window.location.hostname.includes('castle.fyi')
  );
}

/**
 * Formats a Farcaster username for display
 */
export function formatFarcasterUsername(username: string): string {
  return username.startsWith('@') ? username : `@${username}`;
}

/**
 * Truncates an Ethereum address for display
 */
export function truncateAddress(address: string, startChars = 6, endChars = 4): string {
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}
