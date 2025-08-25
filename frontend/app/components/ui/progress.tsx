"use client";
import React from "react";

export interface ProgressProps {
  value: number; // 0-100
  className?: string;
  dark?: boolean;
}

export function Progress({ value, className = "" }: ProgressProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className={`relative h-2 w-full rounded-full overflow-hidden ${false ? 'bg-slate-100' : 'bg-slate-800'}`}>
        <div
          className="absolute left-0 top-0 h-2 bg-gradient-to-r from-emerald-400 via-blue-500 to-indigo-600 shadow-[0_6px_18px_-6px_rgba(79,70,229,0.6)]"
          style={{ width: `${Math.min(100, Math.max(0, value))}%`, transition: 'width 420ms cubic-bezier(.22,.9,.33,1)' }}
        />
      </div>
      <div className="mt-2 text-xs text-slate-400">{Math.round(value)}%</div>
    </div>
  );
}

export default Progress;
