"use client";

import { useState, useEffect } from 'react';

interface ServerStatus {
  backend: boolean;
  microservice: boolean;
  isLoading: boolean;
}

export function useServerStatus() {
  const [status, setStatus] = useState<ServerStatus>({
    backend: false,
    microservice: false,
    isLoading: true
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const checkBackendStatus = async (): Promise<boolean> => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:4000";
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${backendUrl}/user-api/history`, {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-cache'
      });
      
      clearTimeout(timeoutId);
      // Even 401 means server is responding (just needs auth)
      return response.status === 401 || response.ok;
    } catch (error) {
      console.log('Backend not responding:', error);
      return false;
    }
  };

  const checkMicroserviceStatus = async (): Promise<boolean> => {
    try {
      const microserviceUrl = process.env.NEXT_PUBLIC_MICROSERVICE_URL || "http://127.0.0.1:8000";
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${microserviceUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-cache'
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      // If health endpoint doesn't exist, try root
      try {
        const controller2 = new AbortController();
        const timeoutId2 = setTimeout(() => controller2.abort(), 5000);
        
        const response2 = await fetch(`${process.env.NEXT_PUBLIC_MICROSERVICE_URL || "http://127.0.0.1:8000"}/`, {
          method: 'GET',
          signal: controller2.signal,
          cache: 'no-cache'
        });
        
        clearTimeout(timeoutId2);
        return response2.ok || response2.status < 500;
      } catch (error2) {
        console.log('Microservice not responding:', error2);
        return false;
      }
    }
  };

  const checkServers = async () => {
    setStatus(prev => ({ ...prev, isLoading: true }));
    
    try {
      const [backendStatus, microserviceStatus] = await Promise.all([
        checkBackendStatus(),
        checkMicroserviceStatus()
      ]);

      setStatus({
        backend: backendStatus,
        microservice: microserviceStatus,
        isLoading: false
      });

      // If servers are sleeping, keep checking
      if (!backendStatus || !microserviceStatus) {
        setTimeout(checkServers, 3000); // Check every 3 seconds
      }
    } catch (error) {
      console.error('Error checking server status:', error);
      setStatus(prev => ({ ...prev, isLoading: false }));
      setTimeout(checkServers, 5000); // Retry after 5 seconds
    }
  };

  useEffect(() => {
    if (isClient) {
      checkServers();
    }
  }, [isClient]);

  const isReady = status.backend && status.microservice && !status.isLoading;
  const isWaking = status.isLoading || !status.backend || !status.microservice;

  return {
    ...status,
    isReady,
    isWaking,
    recheckServers: checkServers
  };
}
