"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount, useConnect, useReconnect } from "wagmi";
import defaultSdk, { sdk as namedSdk } from "@farcaster/miniapp-sdk";
import { StartOverlay } from "@/components/StartOverlay";
import { VideoPlayer } from "@/components/VideoPlayer";
import { ChannelInfo } from "@/components/ChannelInfo";
import { TakeoverForm } from "@/components/TakeoverForm";
import { useFarcasterContext } from "@/hooks/useFarcasterContext";
import { useTelevision } from "@/hooks/useTelevision";
import { env } from "@/utils/env";
import { useMiniAppCapabilities } from "@/hooks/useMiniAppCapabilities";
import { isValidTwitchUrl } from "@/utils/twitch";
import { useMiniAppEvents } from "@/hooks/useMiniAppEvents";

// Unified SDK bridge (handles default vs named export shapes)
const sdk: any = (namedSdk as any) ?? (defaultSdk as any);

// Clean error mapper (normalized punctuation)
function mapErrorFriendly(err?: Error | null): string | undefined {
  if (!err) return undefined;
  const raw = (err as any)?.shortMessage || err.message || "";
  if (!raw) return undefined;
  if (/User rejected|User denied|Request rejected/i.test(raw)) return "Transaction rejected by user.";
  if (raw.includes("Television__Expired")) return "Price expired - please try again.";
  if (raw.includes("Television__EpochIdMismatch")) return "Channel state changed - refresh and try again.";
  if (raw.includes("Television__MaxPaymentAmountExceeded")) return "Price moved - increase buffer and retry.";
  if (/insufficient funds|balance/i.test(raw)) return "Insufficient balance.";
  if (/allowance/i.test(raw)) return "Insufficient allowance - approve first.";
  return raw;
}

export default function Home() {
  const [isPoweredOn, setIsPoweredOn] = useState(false);
  const [lastShownTakeoverSuccess, setLastShownTakeoverSuccess] = useState(false);
  const [lastShownApproveSuccess, setLastShownApproveSuccess] = useState(false);

  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { reconnect } = useReconnect();
  const { connect, connectors } = useConnect();
  const { user, isLoading: isUserLoading } = useFarcasterContext();
  const {
    slot0,
    currentPrice,
    isLoading: isChannelLoading,
    userBalance,
    userAllowance,
    takeover,
    approve,
    isTakeoverPending,
    isApprovePending,
    isApproveSuccess,
    isTakeoverSuccess,
    approveError,
    takeoverError,
  } = useTelevision();

  // Auto-reconnect wallet and try Farcaster connector if available
  useEffect(() => {
    reconnect();
  }, [reconnect]);

  useEffect(() => {
    if (!isConnected && !isConnecting && !isReconnecting && !isUserLoading && user) {
      const farcasterConnector = connectors.find((c) => c.id === "farcasterMiniApp");
      if (farcasterConnector) connect({ connector: farcasterConnector });
    }
  }, [isConnected, isConnecting, isReconnecting, isUserLoading, user, connect, connectors]);

  const { capabilities } = useMiniAppCapabilities();
  const { isAdded } = useMiniAppEvents();
  const canAddMiniApp = (isAdded === false) && capabilities?.includes('actions.addMiniApp');
  const canComposeCast = capabilities?.includes('actions.composeCast');
  const canViewCast = capabilities?.includes('actions.viewCast');
  const canOpenUrl = capabilities?.includes('actions.openUrl');

  // Track success; provide light haptics if supported
  useEffect(() => {
    if (isTakeoverSuccess && isTakeoverSuccess !== lastShownTakeoverSuccess) {
      setLastShownTakeoverSuccess(true);
      try {
        if (capabilities?.includes('haptics.notificationOccurred')) {
          (sdk as any)?.haptics?.notificationOccurred?.('success');
        }
      } catch {}
    } else if (!isTakeoverSuccess && lastShownTakeoverSuccess) {
      setLastShownTakeoverSuccess(false);
    }
  }, [isTakeoverSuccess, lastShownTakeoverSuccess, capabilities]);

  useEffect(() => {
    if (isApproveSuccess && isApproveSuccess !== lastShownApproveSuccess) {
      setLastShownApproveSuccess(true);
      try {
        if (capabilities?.includes('haptics.notificationOccurred')) {
          (sdk as any)?.haptics?.notificationOccurred?.('success');
        }
      } catch {}
    } else if (!isApproveSuccess && lastShownApproveSuccess) {
      setLastShownApproveSuccess(false);
    }
  }, [isApproveSuccess, lastShownApproveSuccess, capabilities]);

  // Ensure ready() is called promptly inside Mini App to dismiss splash
  const readyCalledRef = useRef(false);
  useEffect(() => {
    (async () => {
      try {
        if (readyCalledRef.current) return;
        // Try immediately, then retry briefly in case host bridge isn't ready yet
        const tryReady = async () => {
          try {
            const bridge: any = (namedSdk as any) ?? (defaultSdk as any);
            await bridge?.actions?.ready?.();
            readyCalledRef.current = true;
            console.log("Mini App ready() success");
            return true;
          } catch (e) {
            console.warn("ready() attempt failed; will retry", e);
            return false;
          }
        };

        if (!(await tryReady())) {
          let attempts = 0;
          const id = window.setInterval(async () => {
            if (readyCalledRef.current) {
              clearInterval(id);
              return;
            }
            attempts += 1;
            const ok = await tryReady();
            if (ok || attempts >= 20) {
              clearInterval(id);
              if (!ok) console.warn("ready() retries exhausted");
            }
          }, 300);
        }
      } catch (e) {
        console.warn("ready() call failed on mount", e);
      }
    })();
  }, []);

  const handlePowerOn = async () => setIsPoweredOn(true);
  const handlePowerOff = () => setIsPoweredOn(false);
  const handleTakeover = (url: string) => takeover(url);
  const handleApprove = (amount: bigint) => approve(amount);

  async function handleAddMiniApp() {
    try {
      await (sdk as any)?.actions?.addMiniApp?.();
      try {
        if (capabilities?.includes('haptics.notificationOccurred')) {
          (sdk as any)?.haptics?.notificationOccurred?.('success');
        }
      } catch {}
    } catch (e) {
      console.error('addMiniApp failed:', e);
    }
  }

  async function handleComposeCast() {
    try {
      const text = `I just took over the TV on Take0ver TV - come watch or steal the screen next!`;
      const embedUrl = slot0?.uri || env.appUrl;
      await (sdk as any)?.actions?.composeCast?.({ text, embeds: [embedUrl] as [string] });
    } catch (e) {
      console.error('composeCast failed:', e);
    }
  }

  async function handleViewCast(close = false) {
    try {
      const hash = (sdk as any)?.context?.location?.cast?.hash;
      if (!hash) {
        console.warn('No cast hash found in context');
        return;
      }
      await (sdk as any)?.actions?.viewCast?.({ hash, close });
    } catch (e) {
      console.error('viewCast failed:', e);
    }
  }

  async function handleOpenUrl() {
    try {
      const targetUrl = slot0?.uri || env.appUrl;
      await (sdk as any)?.actions?.openUrl?.({ url: targetUrl });
    } catch (e) {
      console.error('openUrl failed:', e);
    }
  }

  // Prefill URL from cast context
  const initialUrl = (() => {
    try {
      const loc: any = (sdk as any)?.context?.location;
      if (!loc) return undefined;
      const embeds: string[] | undefined = loc?.cast?.embeds;
      if (Array.isArray(embeds)) {
        return embeds.find((e) => typeof e === "string" && isValidTwitchUrl(e));
      }
    } catch {}
    return undefined;
  })();

  const approveErrorMessage = mapErrorFriendly(approveError);
  const takeoverErrorMessage = mapErrorFriendly(takeoverError);

  // Safe area insets (resolved via async context to avoid proxy path errors)
  const [safeAreaStyle, setSafeAreaStyle] = useState<React.CSSProperties | undefined>(undefined);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const ctx: any = await (sdk as any)?.context;
        const insets = ctx?.client?.safeAreaInsets;
        if (!mounted || !insets) return;
        const top = Number(insets.top ?? 0);
        const bottom = Number(insets.bottom ?? 0);
        const left = Number(insets.left ?? 0);
        const right = Number(insets.right ?? 0);
        setSafeAreaStyle({ paddingTop: top, paddingBottom: bottom, paddingLeft: left, paddingRight: right });
      } catch {
        // ignore; style remains undefined
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (isUserLoading || isChannelLoading) {
    return (
      <div className="bg-black text-white flex items-center justify-center min-h-screen">
        <p className="text-2xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-black text-white flex items-center justify-center min-h-screen" style={safeAreaStyle}>
      <div className="w-full max-w-md mx-auto h-auto aspect-[9/19.5] max-h-[95vh] flex flex-col">
        {!isPoweredOn ? (
          <div className="flex flex-col items-center justify-around h-full tv-border p-4 text-center">
            <StartOverlay onStart={handlePowerOn} />
          </div>
        ) : (
          <div className="flex flex-col h-full space-y-3 py-3 tv-border">
            {/* Header */}
            <div className="flex items-center justify-between px-3 flex-shrink-0">
              {/* Left: Farcaster user info (restore original placement) */}
              <div className="flex items-center space-x-3">
                <img
                  src={user?.pfpUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${address}`}
                  alt="User"
                  className="w-9 h-9 rounded-full border-2 border-gray-700 bg-gray-800"
                />
                <div className="text-left">
                  <p className="font-bold">{user?.displayName || "Guest"}</p>
                  {user?.username && <p className="text-gray-400">@{user.username}</p>}
                </div>
                <h1 className="text-xl tracking-wider ml-2">TAKE0VER TV</h1>
              </div>

              {/* Right: Power control only */}
              <button onClick={handlePowerOff} className="p-1 text-retro-pink hover:opacity-80 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                </svg>
              </button>
            </div>

            {/* TV Screen */}
            <div className="aspect-video relative overflow-hidden flex-shrink-0">
              <VideoPlayer url={slot0?.uri || `https://twitch.tv/${env.defaultChannel}`} isActive={isPoweredOn} />
            </div>

            {/* Channel Info */}
            {slot0 && <ChannelInfo ownerAddress={slot0.owner} currentPrice={currentPrice} />}

            {/* Takeover Form */}
            <TakeoverForm
              currentPrice={currentPrice}
              userBalance={userBalance}
              userAllowance={userAllowance}
              onTakeover={handleTakeover}
              onApprove={handleApprove}
              isPending={isTakeoverPending}
              isApprovePending={isApprovePending}
              isApproveSuccess={isApproveSuccess}
              isTakeoverSuccess={isTakeoverSuccess}
              shouldShowApproveSuccess={isApproveSuccess && isApproveSuccess !== lastShownApproveSuccess}
              shouldShowTakeoverSuccess={isTakeoverSuccess && isTakeoverSuccess !== lastShownTakeoverSuccess}
              approveErrorMessage={approveErrorMessage}
              takeoverErrorMessage={takeoverErrorMessage}
              initialUrl={initialUrl}
            />
          </div>
        )}
      </div>
    </div>
  );
}
