import { sdk } from '@farcaster/miniapp-sdk';
import { env } from './env';

/**
 * Share a successful takeover on Farcaster
 */
export async function shareOnFarcaster(videoUrl: string) {
  try {
    await sdk.actions.composeCast({
      text: `Just took control of TakeoverTV! 📺 Come watch my video`,
      embeds: [`https://${env.appDomain}`],
    });
    return true;
  } catch (error) {
    console.error('Failed to share on Farcaster:', error);
    return false;
  }
}

/**
 * Add TakeoverTV to user's home screen
 */
export async function addToHomeScreen() {
  try {
    await sdk.actions.addMiniApp();
    return true;
  } catch (error) {
    console.error('Failed to add to home screen:', error);
    return false;
  }
}

/**
 * Open an external URL
 */
export async function openExternalUrl(url: string) {
  try {
    await sdk.actions.openUrl({ url });
    return true;
  } catch (error) {
    console.error('Failed to open URL:', error);
    return false;
  }
}

/**
 * Trigger haptic feedback (if supported)
 * Uses the official sdk.haptics API introduced in June 2025
 */
export async function triggerHaptic(style: 'light' | 'medium' | 'heavy' = 'medium') {
  try {
    const context = await sdk.context;
    if (context.features?.haptics) {
      await sdk.haptics.impactOccurred(style);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Haptic feedback failed:', error);
    return false;
  }
}

/**
 * Close the Mini App
 */
export async function closeMiniApp() {
  try {
    await sdk.actions.close();
    return true;
  } catch (error) {
    console.error('Failed to close Mini App:', error);
    return false;
  }
}

/**
 * Get Farcaster user info
 */
export async function getFarcasterUser() {
  const context = await sdk.context;
  return context.user;
}

/**
 * Get client platform type
 */
export async function getClientPlatform() {
  const context = await sdk.context;
  return context.client.platformType;
}

/**
 * Check if running in Farcaster client
 */
export async function isInFarcaster() {
  const context = await sdk.context;
  return context.client.platformType !== undefined;
}

/**
 * Get safe area insets for mobile
 * Use these to avoid rendering content behind navigation elements
 */
export async function getSafeAreaInsets() {
  const context = await sdk.context;
  return context.client.safeAreaInsets;
}

/**
 * Check if a specific feature is available
 */
export async function isFeatureAvailable(feature: keyof NonNullable<Awaited<typeof sdk.context>['features']>) {
  const context = await sdk.context;
  return context.features?.[feature] ?? false;
}

/**
 * Get the app's location context (how it was launched)
 */
export async function getLocationContext() {
  const context = await sdk.context;
  return context.location;
}

/**
 * Check if app was launched from a cast
 */
export async function isLaunchedFromCast() {
  const location = await getLocationContext();
  return location?.type === 'cast_embed' || location?.type === 'cast_share';
}

/**
 * Prompt user to share on Farcaster with optional channel
 */
export async function promptShare(text: string, embeds?: string[], channelKey?: string) {
  try {
    const result = await sdk.actions.composeCast({
      text,
      embeds: embeds as [] | [string] | [string, string] | undefined,
      channelKey,
    });
    return { success: true, cast: result?.cast };
  } catch (error) {
    console.error('Failed to compose cast:', error);
    return { success: false, error };
  }
}

/**
 * Check capabilities before using features
 */
export async function getCapabilities() {
  try {
    return await sdk.getCapabilities();
  } catch (error) {
    console.error('Failed to get capabilities:', error);
    return [];
  }
}
