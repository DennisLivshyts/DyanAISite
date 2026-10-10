"use client";

import { useEffect, useRef, useState } from "react";
import Logo from "../Logo";
import type { OrbitScene } from "./scene";

/**
 * Mounts the gravity-assist scene behind the page.
 *
 * - three.js is a separate chunk, requested only once the browser is idle, so
 *   the hero text paints first and stays the LCP element.
 * - prefers-reduced-motion, no WebGL, or a failed import → a static mark instead.
 * - ?orbit=<0..1> pins the flight at that point and shows a scrubber (review/debug).
 *
 * Phase 3 replaces the plain scroll mapping below with section-anchored GSAP.
 */

type Mode = "pending" | "scene" | "static";

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function OrbitMount() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<OrbitScene | null>(null);
  const [mode, setMode] = useState<Mode>("pending");
  const [visible, setVisible] = useState(false);
  const [debug, setDebug] = useState<number | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !webglAvailable()) { setMode("static"); return; }

    const q = new URLSearchParams(location.search).get("orbit");
    const pinned = q !== null && !Number.isNaN(parseFloat(q)) ? Math.min(1, Math.max(0, parseFloat(q))) : null;
    if (pinned !== null) setDebug(pinned);

    let cancelled = false;
    let cleanup = () => {};
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const idle = (cb: () => void) =>
      w.requestIdleCallback ? w.requestIdleCallback(cb, { timeout: 1500 }) : window.setTimeout(cb, 300);

    idle(async () => {
      try {
        const { createOrbitScene } = await import("./scene");
        if (cancelled || !canvasRef.current) return;
        const mobile = window.matchMedia("(max-width: 767px)").matches;
        const scene = createOrbitScene(canvasRef.current, { mobile });
        sceneRef.current = scene;
        setMode("scene");
        requestAnimationFrame(() => setVisible(true));

        const fromScroll = () => {
          if (pinned !== null) return;
          const max = document.documentElement.scrollHeight - window.innerHeight;
          scene.setProgress(max > 0 ? window.scrollY / max : 0);
        };
        const onResize = () => { scene.resize(); fromScroll(); };
        scene.setProgress(pinned ?? 0);
        fromScroll();
        window.addEventListener("scroll", fromScroll, { passive: true });
        window.addEventListener("resize", onResize);
        cleanup = () => {
          window.removeEventListener("scroll", fromScroll);
          window.removeEventListener("resize", onResize);
          scene.dispose();
          sceneRef.current = null;
        };
      } catch (err) {
        console.warn("orbit scene unavailable, using the static mark", err);
        if (!cancelled) setMode("static");
      }
    });

    return () => { cancelled = true; cleanup(); };
  }, []);

  // keep the debug scrubber and the scene in step
  useEffect(() => {
    if (debug === null || !sceneRef.current) return;
    sceneRef.current.setProgress(debug);
    sceneRef.current.setGap(debug > 0.93 ? Math.min(1, (debug - 0.93) / 0.04) : 0);
  }, [debug, mode]);

  return (
    <>
      {mode !== "static" && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          data-orbit-scene={mode}
          className="fixed inset-0 w-full h-full pointer-events-none z-0 transition-opacity duration-700"
          style={{ opacity: visible ? 1 : 0 }}
        />
      )}

      {mode === "static" && (
        <div aria-hidden="true" data-orbit-static className="fixed inset-0 pointer-events-none z-0 hidden md:block">
          {/* same spot and size as the scene's approach frame: ring radius 30vmin */}
          <div className="absolute" style={{ left: "70%", top: "60%", width: "calc(30vmin * 64 / 23)", transform: "translate(-50%, -50%)" }}>
            <Logo size={64} variant="primary" decorative className="w-full h-auto opacity-80" />
          </div>
        </div>
      )}

      {debug !== null && mode === "scene" && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[300] bg-navy-950/90 border border-teal-500/30 px-4 py-3 flex items-center gap-4 font-space-mono text-[11px] text-teal-300">
          <span>orbit</span>
          <input
            type="range" min={0} max={1} step={0.001} value={debug}
            onChange={(e) => setDebug(parseFloat(e.target.value))}
            className="w-64 accent-teal-400"
            aria-label="Flight progress"
          />
          <span className="w-12 text-right">{debug.toFixed(3)}</span>
        </div>
      )}
    </>
  );
}
