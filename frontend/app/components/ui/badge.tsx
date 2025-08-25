"use client";
import React from "react";

export function Badge({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${dark ? 'bg-slate-700 text-slate-100 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      {children}
    </span>
  );
}

export default Badge;
