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
 */
export async function triggerHaptic(style: 'light' | 'medium' | 'heavy' = 'medium') {
  try {
    const context = await sdk.context;
    if (context.features.haptics) {
      await sdk.actions.haptics({
        type: 'impact',
        style,
      });
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
 */
export async function getSafeAreaInsets() {
  const context = await sdk.context;
  return context.client.safeAreaInsets;
}
