"use client";

import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { useServerStatus } from '../hooks/useServerStatus';
import { ServerWakeupScreen } from './ServerWakeupScreen';

interface ServerStatusWrapperCoreProps {
  children: React.ReactNode;
  // Whether the startup animation should be shown immediately on mount.
  initialShowStartupAnimation?: boolean;
  // If true, only trigger the startup animation after servers report ready and session hasn't seen it.
  showStartupOnlyAfterReady?: boolean;
  // When true, the wrapper will render nothing until client mount (matches previous "Fixed" behavior).
  suppressRenderUntilMounted?: boolean;
  // Optional loading fallback to show while the dynamic StartupAnimation is loading.
  loadingFallback?: React.ReactNode | null;
}

export function ServerStatusWrapperCore({
  children,
  initialShowStartupAnimation = false,
  showStartupOnlyAfterReady = true,
  suppressRenderUntilMounted = false,
  loadingFallback = null,
}: ServerStatusWrapperCoreProps) {
  const [showStartupAnimation, setShowStartupAnimation] = useState(initialShowStartupAnimation);
  const [mounted, setMounted] = useState(false);
  const { backend, microservice, isLoading, isReady, isWaking, recheckServers } = useServerStatus();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Create a dynamic component for the animation using the provided loading fallback.
  const StartupAnimation = dynamic(
    () => import('./StartupAnimation').then((mod) => ({ default: mod.default })),
    { ssr: false, loading: () => (loadingFallback ?? null) }
  );

  // If startup animation should only run after servers are ready, check sessionStorage once ready.
  useEffect(() => {
    if (!mounted) return;
    if (!showStartupOnlyAfterReady) return;
    if (!isReady) return; // wait for server checks

    try {
      const seen = typeof window !== 'undefined' && sessionStorage.getItem('endeavor:startupDone');
      if (!seen) setShowStartupAnimation(true);
    } catch (e) {
      // ignore session errors
    }
  }, [mounted, isReady, showStartupOnlyAfterReady]);

  if (suppressRenderUntilMounted && !mounted) {
    return null;
  }

  // If startup animation is active, show it first.
  if (showStartupAnimation) {
    return (
      <StartupAnimation
        onComplete={() => {
          try {
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('endeavor:startupDone', '1');
            }
          } catch (e) {
            // ignore
          }
          setShowStartupAnimation(false);
        }}
      />
    );
  }

  // If servers are waking or not ready, show the ServerWakeupScreen.
  if (isWaking || !isReady) {
    return (
      <ServerWakeupScreen
        backendStatus={backend}
        microserviceStatus={microservice}
        isLoading={isLoading}
        onRetry={recheckServers}
      />
    );
  }

  // Servers are ready, show the actual app
  return <>{children}</>;
}
