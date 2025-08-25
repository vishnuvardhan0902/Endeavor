"use client";
import React, { useEffect, useRef, useState } from "react";
import Progress from "./ui/progress";
import Badge from "./ui/badge";

export interface LoadingScreenProps {
  active: boolean;
  percent?: number;
  messages?: string[];
}

export default function LoadingScreen({ active, percent = 0, messages = [] }: LoadingScreenProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const typingRef = useRef<number | null>(null);
  const pauseRef = useRef<number | null>(null);

  // Typing effect for the current message
  useEffect(() => {
    if (!active || messages.length === 0) return;

    // ensure revealed array matches messages length
    setRevealed((r) => {
      if (r.length === messages.length) return r;
      return new Array(messages.length).fill(false);
    });

    const current = messages[currentIdx] || "";
    let i = 0;
    setDisplayText("");

    function tick() {
      i += 1;
      setDisplayText(current.slice(0, i));
      if (i >= current.length) {
        // finished typing current line: mark revealed
        setRevealed((r) => {
          const copy = r.slice();
          copy[currentIdx] = true;
          return copy;
        });
        // finished typing current line, pause then move to next
        if (pauseRef.current) window.clearTimeout(pauseRef.current);
        pauseRef.current = window.setTimeout(() => {
          setCurrentIdx((s) => (s + 1) % messages.length);
        }, 900);
      } else {
        typingRef.current = window.setTimeout(tick, 24 + Math.random() * 40);
      }
    }

    tick();

    return () => {
      if (typingRef.current) window.clearTimeout(typingRef.current);
      if (pauseRef.current) window.clearTimeout(pauseRef.current);
    };
  }, [active, currentIdx, messages]);

  // reset when deactivated
  useEffect(() => {
    if (!active) {
      setCurrentIdx(0);
      setDisplayText("");
  setRevealed([]);
      if (typingRef.current) window.clearTimeout(typingRef.current);
      if (pauseRef.current) window.clearTimeout(pauseRef.current);
    }
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[min(960px,96%)] max-h-[86vh] overflow-auto bg-slate-900 text-slate-100 rounded-2xl shadow-2xl p-6 border border-slate-800">
        <div className="flex gap-4 items-start">
          <div className="flex-shrink-0 mt-1">
            <div className="w-20 h-14 rounded-xl   flex items-center justify-center">
              <span className="brand-logo text-base font-bold tracking-wide">Endeavor</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold leading-tight">Starting Enhanced Interview RAG Pipeline...</h3>
                <p className="text-sm text-slate-300 mt-1">This runs analysis, retrieval and generates interview questions — hold tight.</p>
              </div>
              <div className="text-xs text-slate-400">{Math.round(percent)}%</div>
            </div>

            <div className="mt-4">
              <Progress value={percent} dark />
            </div>

            <div className="mt-4 bg-slate-800 border border-slate-700 rounded-md p-3 font-mono text-sm text-slate-200">
              {messages.map((m, idx) => {
                const isCurrent = idx === currentIdx;
                return (
                  <div key={idx} className={`flex items-center gap-3 py-1 ${isCurrent ? 'text-slate-100' : 'text-slate-400'}`}>
                    <Badge dark>{isCurrent ? '••' : '•'}</Badge>
                    <div className="flex-1">
                      {isCurrent ? (
                        <span>
                          {displayText}
                          <span className="inline-block w-1 h-4 bg-slate-100 ml-1 align-middle animate-blink" />
                        </span>
                      ) : revealed[idx] ? (
                        <span>{m}</span>
                      ) : (
                        <span className="text-slate-500 italic">...</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex justify-end">
              <div className="text-xs text-slate-400">Usaually takes 120s to 180s. If this stalls over 200s, please try again.</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blink { 0% { opacity: 1 } 50% { opacity: 0 } 100% { opacity: 1 } }
        .animate-blink { animation: blink 1s steps(2,end) infinite; }
      `}</style>
    </div>
  );
}
