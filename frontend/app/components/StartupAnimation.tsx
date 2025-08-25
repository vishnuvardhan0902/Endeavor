"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

interface StartupAnimationProps {
  onComplete: () => void;
  logoSrc?: string;
  version?: string;
  durationMs?: number; // total timeline duration override
}

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  ttl: number;
};

export default function StartupAnimation({
  onComplete,
  logoSrc = "/endeavor-logo.png",
  version = "v1.0.0",
  durationMs,
}: StartupAnimationProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTsRef = useRef<number | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [phase, setPhase] = useState<"loading" | "logo" | "fadeOut" | "done">("loading");
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Timeline defaults (ms)
  const TIMELINE = useMemo(() => {
    const loading = 1400;
    const logo = 1600;
    const fade = 500;
    const total = durationMs ?? loading + logo + fade;
    return { loading, logo, fade, total };
  }, [durationMs]);

  // Persisted completion so we don't replay the animation on every reload
  const STORAGE_KEY = "endeavor:startupDone";
  const finishedRef = useRef(false);
  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    try {
      if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, "1");
    } catch (e) {
      // ignore storage errors
    }
    setPhase("done");
    onComplete();
  }, [onComplete]);

  // Initialize particle set once on hydration
  const initialParticles = useMemo(() => {
    if (typeof window === "undefined") return [] as Particle[];
    const pCount = 80; // tradeoff between density and perf
    const particles: Particle[] = new Array(pCount).fill(0).map(() => {
      const ttl = 2000 + Math.random() * 4000;
      return {
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0006,
        vy: -0.0002 - Math.random() * 0.0005,
        size: 0.6 + Math.random() * 1.8,
        alpha: 0.08 + Math.random() * 0.22,
        life: 0,
        ttl,
      } as Particle;
    });
    return particles;
  }, []);

  // Resize & device pixel ratio handling
  const fitCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = `${Math.round(rect.width)}px`;
    canvas.style.height = `${Math.round(rect.height)}px`;
  }, []);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // If the animation was already completed in this browser, skip it immediately
  useEffect(() => {
    if (!hydrated) return;
    try {
      if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) {
        finish();
      }
    } catch (e) {
      // ignore
    }
  }, [hydrated, finish]);

  useEffect(() => {
    if (!hydrated) return;
    // Start the timeline
    startTsRef.current = performance.now();

    // Small helper to schedule phase changes deterministically
    const t0 = startTsRef.current;
    const toLogo = t0 + TIMELINE.loading;
    const toFade = toLogo + TIMELINE.logo;
    const toDone = toFade + TIMELINE.fade;

    const tick = (ts: number) => {
      if (!startTsRef.current) startTsRef.current = ts;
      if (ts >= toLogo && phase === "loading") setPhase("logo");
      if (ts >= toFade && (phase === "logo" || phase === "loading")) setPhase("fadeOut");
      if (ts >= toDone) {
        finish();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    // If user prefers reduced motion, skip heavy animation and shorten timeline
    if (prefersReducedMotion) {
      // fast-forward small timeout and finish
      const fastFinish = Math.min(700, TIMELINE.total);
      const t = window.setTimeout(() => {
        finish();
      }, fastFinish);
      return () => clearTimeout(t);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [hydrated, finish, prefersReducedMotion, TIMELINE]);

  // Canvas particle animation
  useEffect(() => {
    if (!hydrated || prefersReducedMotion) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

  const particles = initialParticles.map(p => ({ ...p }));
    let last = performance.now();

    fitCanvas();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const onResize = () => fitCanvas();
    window.addEventListener("resize", onResize, { passive: true });

    const draw = (now: number) => {
      const dt = Math.min(40, now - last);
      last = now;
      // clear with subtle gradient overlay for depth
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // background vignette
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "rgba(6,10,18,0.6)");
      g.addColorStop(1, "rgba(3,7,12,0.85)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life += dt;
        if (p.life > p.ttl) {
          // recycle
          p.life = 0;
          p.x = Math.random();
          p.y = 1.05; // start slightly below
          p.vx = (Math.random() - 0.5) * 0.0006;
          p.vy = -0.0002 - Math.random() * 0.0005;
          p.size = 0.6 + Math.random() * 1.8;
          p.alpha = 0.06 + Math.random() * 0.22;
          p.ttl = 2000 + Math.random() * 4000;
        }

        // update
        p.x += p.vx * dt * (w / 900);
        p.y += p.vy * dt * (h / 600);

        // fade over life
        const lifeRatio = 1 - p.life / p.ttl;
        const alpha = Math.max(0, p.alpha * lifeRatio);

        const px = p.x * w;
        const py = p.y * h;
        const size = p.size * (window.devicePixelRatio || 1);

        ctx.beginPath();
        const grd = ctx.createRadialGradient(px, py, 0, px, py, size * 6);
        grd.addColorStop(0, `rgba(56, 189, 248, ${alpha})`);
        grd.addColorStop(0.5, `rgba(59,130,246, ${alpha * 0.35})`);
        grd.addColorStop(1, `rgba(59,130,246, 0)`);
        ctx.fillStyle = grd;
        ctx.fillRect(px - size * 6, py - size * 6, size * 12, size * 12);
      }

      // subtle overlay to create depth lines
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.02;
      ctx.fillStyle = "#7dd3fc";
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [hydrated, initialParticles, fitCanvas, prefersReducedMotion]);

  // Skip handler: allow users to skip the startup animation
  useEffect(() => {
    if (!hydrated) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") {
        finish();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hydrated, finish]);

  // Ensure animation stops if page hidden
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && rafRef.current) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      } else if (!document.hidden && hydrated && phase !== "done" && !prefersReducedMotion) {
        // restart main RAF loop - will be started by effects which check hydrated
        // no-op here; the other effects handle re-creation
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [hydrated, phase, prefersReducedMotion]);

  // always render immediately; hydrated controls the animation start

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex items-center justify-center select-none pointer-events-auto transition-opacity duration-700 ease-out ${
        phase === "fadeOut" || phase === "done" ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden={phase === "done"}
      role="dialog"
      aria-label="Startup animation"
      onClick={() => {
        // single click to skip
  finish();
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div className="relative z-10 flex flex-col items-center gap-6 px-6">
        <div
          className={`relative flex items-center justify-center rounded-2xl p-4 transform transition-all duration-900 will-change-transform ${
            phase === "loading" ? "scale-95 opacity-80" : "scale-100 opacity-100"
          }`}
        >
          <div className="relative w-36 h-36 md:w-44 md:h-44">
            <Image
              src={logoSrc}
              alt="Endeavor logo"
              fill
              sizes="(max-width: 768px) 144px, 176px"
              className={`object-contain drop-shadow-2xl transition-transform duration-900 ease-out ${
                phase === "logo" ? "scale-105 animate-slow-bounce" : "scale-95"
              }`}
              priority
            />
          </div>

          {/* subtle glowing ring */}
          <div className="pointer-events-none absolute w-44 h-44 rounded-full blur-3xl opacity-30 bg-gradient-to-r from-cyan-400/30 to-blue-500/20" />
        </div>

        <div className="text-center">
          <h1 className={`text-3xl md:text-4xl font-extrabold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400 ${phase === "logo" ? "opacity-100" : "opacity-70"}`}>
            ENDEAVOR
          </h1>
          <p className={`mt-1 text-sm md:text-base text-slate-300/90 ${phase === "logo" ? "opacity-100" : "opacity-70"}`}>
            Powering your success
          </p>
        </div>

        {phase === "loading" && (
          <div className="w-72 max-w-full h-2 bg-slate-700/40 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all ease-out"
              style={{ width: `${Math.min(100, Math.round(((performance.now() - (startTsRef.current || performance.now())) / TIMELINE.loading) * 100))}%`, background: "linear-gradient(90deg,#06b6d4,#3b82f6)" }}
            />
          </div>
        )}

        {/* <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-slate-300/70 font-mono">
          {version}
        </div> */}

      <style jsx>{`
        @keyframes slow-bounce {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-6px) scale(1.02); }
          100% { transform: translateY(0) scale(1); }
        }

        .animate-slow-bounce { animation: slow-bounce 2200ms ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .animate-slow-bounce { animation: none; }
          * { transition: none !important; }
        }
      `}</style>
      </div>
    </div>
  );
}
