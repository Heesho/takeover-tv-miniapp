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
import { getAppHostname } from '@/utils/env';

export function getKnownParentDomains(): string[] {
  const baseParents = [
    'client.warpcast.com',
    'supercast.xyz',
    'embeds.lfg.castle.fyi',
    'farcaster.xyz',
  ];

  const envHost = getAppHostname();
  if (envHost && !baseParents.includes(envHost)) baseParents.push(envHost);

  if (typeof window !== 'undefined') {
    const currentHost = window.location.hostname;
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
      if (!baseParents.includes('localhost')) baseParents.push('localhost');
    } else if (currentHost && !baseParents.includes(currentHost)) {
      baseParents.push(currentHost);
    }
  }
  return baseParents;
}

export function buildTwitchPlayerUrl(channelName: string): string {
  const parents = getKnownParentDomains();
  const parentParams = parents.map((p) => `parent=${p}`).join('&');
  return `https://player.twitch.tv/?channel=${channelName}&${parentParams}&autoplay=true&muted=false`;
}
