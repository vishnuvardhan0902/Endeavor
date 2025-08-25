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
  const [showStartupAnimation, setShowStartupAnimation] = useState(true);
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

  // Show startup animation first
  if (showStartupAnimation) {
    return (
      <StartupAnimation 
        onComplete={() => setShowStartupAnimation(false)} 
      />
    );
  }

  // Show loading screen if servers are waking up or not ready
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
