"use client";

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useServerStatus } from '../hooks/useServerStatus';
import { ServerWakeupScreen } from './ServerWakeupScreen';

// Dynamically import StartupAnimation to avoid SSR hydration issues
// StartupAnimation is a default export, import as mod.default
const StartupAnimation = dynamic(() => import('./StartupAnimation').then(mod => ({ default: mod.default })), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-black">
      <div className="flex flex-col items-center space-y-8">
        <div className="w-16 h-16 border-4 border-cyan-200/20 rounded-full animate-spin border-t-cyan-400"></div>
        <p className="text-cyan-300 text-sm font-medium">
          Loading...
        </p>
      </div>
    </div>
  )
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
