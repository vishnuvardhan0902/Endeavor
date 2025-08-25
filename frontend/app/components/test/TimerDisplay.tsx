"use client";
import React from 'react';
import { Clock } from 'lucide-react';
import { formatTime } from './utils';

interface TimerDisplayProps {
  timeLeft: number | null;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeLeft }) => {
  const getTimerColor = () => {
    if (timeLeft === null) return "text-slate-400";
    if (timeLeft <= 300) return "text-red-400"; // 5 minutes
    if (timeLeft <= 600) return "text-yellow-400"; // 10 minutes
    return "text-green-400";
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg border border-slate-600">
      <Clock className="h-4 w-4 text-slate-400" />
      <span className={`font-mono text-sm font-medium ${getTimerColor()}`}>
        {formatTime(timeLeft)}
      </span>
    </div>
  );
};
