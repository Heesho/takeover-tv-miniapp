import { sdk } from '@farcaster/miniapp-sdk';

// Wrapper around Quick Auth that prefers sdk.quickAuth.fetch when available,
// and falls back to adding the Bearer token manually.
export async function quickAuthFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  try {
    const qa: any = (sdk as any)?.quickAuth;
    if (qa?.fetch) {
      // Uses the SDK-provided fetch that injects Authorization automatically
      return await qa.fetch(input as any, init as any);
    }

    // Fallback: getToken and set Authorization header manually
    const token: string | undefined = await qa?.getToken?.();
    const headers = new Headers(init?.headers || {});
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return await fetch(input, { ...init, headers });
  } catch (e) {
    // Final fallback: plain fetch
    return await fetch(input, init);
  }
}

