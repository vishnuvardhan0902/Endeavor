"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ServerWakeupScreenProps {
  backendStatus: boolean;
  microserviceStatus: boolean;
  isLoading: boolean;
  onRetry?: () => void;
}

export function ServerWakeupScreen({ 
  backendStatus, 
  microserviceStatus, 
  isLoading,
  onRetry 
}: ServerWakeupScreenProps) {
  const [dots, setDots] = useState('');
  const [wakingTime, setWakingTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!backendStatus || !microserviceStatus) {
      const timer = setInterval(() => {
        setWakingTime(prev => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setWakingTime(0);
    }
  }, [backendStatus, microserviceStatus]);

  const getStatusMessage = () => {
    if (isLoading) {
      return "Checking server status...";
    }
    
    if (!backendStatus && !microserviceStatus) {
      return "Waking up servers from sleep mode...";
    }
    
    if (!backendStatus) {
      return "Waking up main server...";
    }
    
    if (!microserviceStatus) {
      return "Waking up AI evaluation service...";
    }
    
    return "Almost ready!";
  };

  const getProgressPercentage = () => {
    let progress = 0;
    if (backendStatus) progress += 50;
    if (microserviceStatus) progress += 50;
    return progress;
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center z-50">
      <div className="text-center space-y-8 p-8 max-w-md mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-[120px] h-[120px] rounded-full flex items-center justify-center shadow-2xl animate-pulse">
              <Image
                src="/endeavor-logo.png"
                alt="Endeavor Logo"
                width={120}
                height={120}
                className="rounded-full"
                priority
                onError={(e) => {
                  // Fallback to text logo if image not found
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <span className="text-3xl font-bold text-white absolute inset-0 flex items-center justify-center">
              </span>
            </div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 animate-ping"></div>
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-4xl font-bold text-white mb-4">
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Endeavor
          </span>
        </h1>

        {/* Status Message */}
        <div className="space-y-4">
          <p className="text-lg text-slate-300">
            {getStatusMessage()}
            <span className="inline-block w-8 text-left">{dots}</span>
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>

          {/* Server Status Indicators */}
          <div className="flex justify-center space-x-6 mt-6">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${backendStatus ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
              <span className="text-sm text-slate-400">Main Server</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${microserviceStatus ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
              <span className="text-sm text-slate-400">AI Service</span>
            </div>
          </div>

          {/* Wake up explanation */}
          <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <p className="text-sm text-slate-400 leading-relaxed">
              🌙 Our servers go to sleep when inactive. 
              They&apos;re waking up now and will be ready in 30-45 seconds.
            </p>
            {wakingTime > 15 && (
              <p className="text-xs text-slate-500 mt-2">
                Waking up for {wakingTime} seconds...
              </p>
            )}
          </div>

          {/* Retry Button */}
          {wakingTime > 30 && (
            <button
              onClick={onRetry}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105"
            >
              Retry Connection
            </button>
          )}

          {/* Fun facts while waiting */}
          {wakingTime > 10 && (
            <div className="mt-6 p-3 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-lg">
              <p className="text-xs text-cyan-300">
                💡 Did you know? This loading screen only appears when servers are sleeping. 
                Once active, you&apos;ll have instant access to all features!
              </p>
            </div>
          )}
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center space-x-1 mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
