import { sdk } from '@farcaster/miniapp-sdk';

let cachedIsMiniApp: boolean | null = null;

// Robust, cached detection with timeout and multi-path verification.
export async function isInMiniAppAsync(timeoutMs = 100): Promise<boolean> {
  if (cachedIsMiniApp !== null) return cachedIsMiniApp;

  // 1) Fast short-circuit
  if (typeof window === 'undefined') return false; // SSR
  const inIframe = (() => {
    try { return window.self !== window.top; } catch { return true; }
  })();
  const isRNWebView = typeof (window as any).ReactNativeWebView !== 'undefined';
  if (!inIframe && !isRNWebView) return false;

  // 2) Context verification via SDK with timeout race
  const verify = async () => {
    try {
      const isMiniFn = (sdk as any)?.isInMiniApp as undefined | (() => Promise<boolean>);
      if (isMiniFn) return await isMiniFn();
    } catch {}
    try {
      const capsFn = (sdk as any)?.getCapabilities as undefined | (() => Promise<string[]>);
      if (capsFn) {
        const caps = await capsFn();
        if (Array.isArray(caps)) return true;
      }
    } catch {}
    return false;
  };

  const withTimeout = <T>(p: Promise<T>, ms: number, fallback: T) =>
    new Promise<T>((resolve) => {
      const t = setTimeout(() => resolve(fallback), Math.max(0, ms));
      p.then((v) => { clearTimeout(t); resolve(v); }).catch(() => { clearTimeout(t); resolve(fallback); });
    });

  let result = await withTimeout(verify(), timeoutMs, false);

  // 3) Heuristic fallback if still false (helps preview/debug tools)
  if (!result) {
    const host = window.location.hostname || '';
    const search = window.location.search || '';
    result = (
      search.includes('farcaster') ||
      host.includes('warpcast.com') ||
      host.includes('supercast.xyz') ||
      host.includes('castle.fyi')
    );
  }

  cachedIsMiniApp = result;
  return result;
}
