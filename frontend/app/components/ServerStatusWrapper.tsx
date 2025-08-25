"use client";

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useServerStatus } from '../hooks/useServerStatus';
import { ServerWakeupScreen } from './ServerWakeupScreen';

// Dynamically import StartupAnimation to avoid SSR hydration issues
// StartupAnimation is a default export, import as mod.default
const StartupAnimation = dynamic(() => import('./StartupAnimation').then(mod => ({ default: mod.default })), {
  ssr: false,
  // no loading UI to avoid brief spinner before animation
  loading: () => null,
});

interface ServerStatusWrapperProps {
  children: React.ReactNode;
}

export function ServerStatusWrapper({ children }: ServerStatusWrapperProps) {
  const [showStartupAnimation, setShowStartupAnimation] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { 
    backend, 
    microservice, 
    isLoading, 
    isReady, 
    isWaking,
    recheckServers 
  } = useServerStatus();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until component is mounted on client
  if (!mounted) {
    return null;
  }

  // Determine whether we should show the startup animation for this session.
  useEffect(() => {
    try {
      const seen = typeof window !== 'undefined' && sessionStorage.getItem('endeavor:startupDone');
      if (!seen) {
        // Only show startup animation after the server checks finish and servers are ready.
        // We set showStartupAnimation when servers are ready and the animation hasn't run in this session.
        // Note: do not set it immediately to avoid blocking server checks.
      }
    } catch (e) {
      // ignore session errors
    }
  }, []);

  // If servers are waking or not ready, show the ServerWakeupScreen first.
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

  // If servers are ready, decide whether to play the startup animation (only on new tabs / sessions)
  if (!showStartupAnimation) {
    try {
      const seen = typeof window !== 'undefined' && sessionStorage.getItem('endeavor:startupDone');
      if (!seen) {
        // mark that we'll show it and render the animation
        setShowStartupAnimation(true);
      }
    } catch (e) {
      // ignore
    }
  }

  if (showStartupAnimation) {
    return (
      <StartupAnimation 
        onComplete={() => setShowStartupAnimation(false)} 
      />
    );
  }

  // Servers are ready, show the actual app
  return <>{children}</>;
}
