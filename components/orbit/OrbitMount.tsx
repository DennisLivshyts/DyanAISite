"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Logo from "../Logo";
import { FLIGHT } from "@/lib/orbit";
import { flight } from "@/lib/flight";
import type { OrbitScene } from "./scene";

/**
 * Runs the flight:
 *
 * - Scroll director: each page section is pinned to a point on the flight
 *   (ring crossing at Capabilities, periapsis at Work, punch-through on the
 *   Contact booking card, the mark at the sign-off). GSAP smooths the motion.
 *   It always runs, so the tracker and status panel work without WebGL too.
 * - Scene: three.js is a separate chunk, created once the browser is idle —
 *   or straight away when the launch screen is showing, which hides the load.
 * - Launch: first visit per session, a craft climbs from the bottom of the
 *   screen to exactly where the scene's craft sits, then the overlay dissolves
 *   and the planned course plots itself. Hard-capped; any key or click skips.
 * - prefers-reduced-motion, no WebGL, or a failed import → a static mark.
 * - ?orbit=<0..1> pins the flight and shows a scrubber (review/debug).
 */

gsap.registerPlugin(ScrollTrigger);

type Mode = "pending" | "scene" | "static";

const LAUNCH_CAP_MS = 2600;   // the inline <head> script removes the overlay at this point regardless

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** [scrollY, flight position] pairs, from where the sections actually are right now. */
function measureAnchors(): [number, number][] {
  const vh = window.innerHeight;
  const max = Math.max(0, document.documentElement.scrollHeight - vh);
  const abs = (el: Element | null) => (el ? el.getBoundingClientRect().top + window.scrollY : null);
  const centred = (el: Element | null) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return r.top + window.scrollY + r.height / 2 - vh / 2;
  };
  const cap = abs(document.getElementById("capabilities"));
  const raw: [number | null, number][] = [
    [0, FLIGHT.approach],
    [cap === null ? null : cap - 0.35 * vh, FLIGHT.ringIn],
    [centred(document.getElementById("work")), FLIGHT.periapsis],
    [centred(document.getElementById("process")), FLIGHT.process],
    [centred(document.querySelector("[data-punch]")), FLIGHT.ringOut],
    [centred(document.getElementById("signoff")), FLIGHT.resolve],
  ];
  const out: [number, number][] = [];
  for (const [y, s] of raw) {
    if (y === null) continue;
    const yy = Math.min(max, Math.max(0, y));
    if (out.length && yy <= out[out.length - 1][0]) continue;   // keep it monotone
    out.push([yy, s]);
  }
  if (out[out.length - 1][1] < 1) out.push([Math.max(max, out[out.length - 1][0] + 1), 1]);
  return out;
}

function mapScroll(a: [number, number][], y: number) {
  if (y <= a[0][0]) return a[0][1];
  for (let i = 1; i < a.length; i++) {
    if (y <= a[i][0]) {
      const [y0, s0] = a[i - 1], [y1, s1] = a[i];
      return s0 + (s1 - s0) * ((y - y0) / (y1 - y0));
    }
  }
  return a[a.length - 1][1];
}

function endLaunch() {
  document.documentElement.classList.remove("launching");
  try { sessionStorage.setItem("dl-launched", "1"); } catch {}
}

export default function OrbitMount() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<OrbitScene | null>(null);
  const [mode, setMode] = useState<Mode>("pending");
  const [visible, setVisible] = useState(false);
  const [debug, setDebug] = useState<number | null>(null);

  useEffect(() => {
    const html = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const launching = html.classList.contains("launching");
    const q = new URLSearchParams(location.search).get("orbit");
    const pinned = q !== null && !Number.isNaN(parseFloat(q)) ? Math.min(1, Math.max(0, parseFloat(q))) : null;
    if (pinned !== null) setDebug(pinned);

    /* ── scroll director ── */
    let anchors = measureAnchors();
    const proxy = { s: mapScroll(anchors, window.scrollY) };
    const apply = () => {
      if (pinned !== null) return;
      flight.set(proxy.s);
      sceneRef.current?.setProgress(proxy.s);
    };
    apply();
    const to = gsap.quickTo(proxy, "s", { duration: reduce ? 0 : 0.7, ease: "power3.out", onUpdate: apply });
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => to(mapScroll(anchors, self.scroll())),
      onRefresh: () => { anchors = measureAnchors(); to(mapScroll(anchors, window.scrollY)); },
    });
    if (pinned !== null) flight.set(pinned);

    /* ── scene ── */
    let cancelled = false;
    let disposeScene = () => {};
    let resolveReady: (s: OrbitScene | null) => void = () => {};
    const ready = new Promise<OrbitScene | null>((r) => { resolveReady = r; });

    const startScene = async () => {
      try {
        const { createOrbitScene } = await import("./scene");
        if (cancelled || !canvasRef.current) return resolveReady(null);
        const mobile = window.matchMedia("(max-width: 767px)").matches;
        const scene = createOrbitScene(canvasRef.current, { mobile });
        sceneRef.current = scene;
        scene.setProgress(pinned ?? proxy.s);
        const onResize = () => scene.resize();
        window.addEventListener("resize", onResize);
        disposeScene = () => { window.removeEventListener("resize", onResize); scene.dispose(); sceneRef.current = null; };
        setMode("scene");
        html.dataset.orbit = "scene";
        resolveReady(scene);
      } catch (err) {
        console.warn("orbit scene unavailable, using the static mark", err);
        if (!cancelled) { setMode("static"); html.dataset.orbit = "static"; }
        resolveReady(null);
      }
    };

    if (reduce || !webglAvailable()) {
      setMode("static");
      html.dataset.orbit = "static";
      resolveReady(null);
    } else if (launching) {
      startScene();                       // the launch screen hides the load
    } else {
      const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
      if (w.requestIdleCallback) w.requestIdleCallback(startScene, { timeout: 1500 }); else window.setTimeout(startScene, 300);
    }

    /* ── course plot: the planned path traces itself in once the craft is in place ── */
    const plotIn = (scene: OrbitScene | null) => {
      if (!scene || cancelled) return;
      const p = { t: 0 };
      scene.setPlot(0);
      gsap.to(p, { t: 1, duration: 1.4, ease: "power1.inOut", onUpdate: () => scene.setPlot(p.t) });
    };

    /* ── launch ── */
    const killers: (() => void)[] = [];
    if (launching) {
      const root = document.getElementById("launch");
      const trail = document.getElementById("launch-trail") as SVGPathElement | null;
      const craft = document.getElementById("launch-craft") as SVGCircleElement | null;
      const glowEl = document.getElementById("launch-glow") as SVGCircleElement | null;
      const label = document.getElementById("launch-label");
      const remaining = LAUNCH_CAP_MS - performance.now();
      let tl: gsap.core.Timeline | null = null;
      let done = false;

      const finish = () => {
        if (done) return;
        done = true;
        tl?.kill();
        if (root) gsap.to(root, { opacity: 0, duration: 0.45, ease: "power1.out", onComplete: endLaunch });
        else endLaunch();
        ready.then(plotIn);
      };

      if (!root || !trail || !craft || !glowEl || !label || window.scrollY > 40 || remaining < 900) {
        // too late, already scrolled, or no overlay: don't make anyone wait
        done = true;
        endLaunch();
        ready.then(plotIn);
      } else {
        const ascent = remaining > 1700 ? 1.0 : 0.6;
        const W = window.innerWidth, H = window.innerHeight;
        const x0 = W / 2, y0 = H * 0.96;
        tl = gsap.timeline();
        tl.to(label, { opacity: 1, duration: 0.25 })
          .fromTo(glowEl, { attr: { r: 2 } }, { attr: { r: 16 }, opacity: 0.35, duration: 0.3, ease: "power2.out" }, "<");

        // the target is wherever the scene puts the craft at the top of the page
        const timeout = new Promise<null>((r) => setTimeout(() => r(null), Math.max(0, Math.min(900, remaining - 900))));
        Promise.race([ready, timeout]).then((scene) => {
          if (cancelled || done || !tl) return;
          scene?.setPlot(0);
          const target = scene ? scene.headScreen() : { x: W * 0.2, y: H * 0.22 };
          // a gravity turn: straight up off the pad, bending over toward the target
          const d = `M ${x0} ${y0} C ${x0} ${H * 0.45}, ${target.x + (x0 - target.x) * 0.15} ${target.y + H * 0.22}, ${target.x} ${target.y}`;
          trail.setAttribute("d", d);
          const L = trail.getTotalLength();
          trail.style.strokeDasharray = `${L}`;
          trail.style.strokeDashoffset = `${L}`;
          const p = { t: 0 };
          tl.to(p, {
            t: 1, duration: ascent, ease: "power2.in",
            onUpdate: () => {
              const pt = trail.getPointAtLength(p.t * L);
              craft.setAttribute("cx", String(pt.x));
              craft.setAttribute("cy", String(pt.y));
              glowEl.setAttribute("cx", String(pt.x));
              glowEl.setAttribute("cy", String(pt.y));
              trail.style.strokeDashoffset = String(L * (1 - p.t));
            },
          })
          .to(glowEl, { attr: { r: 7 }, opacity: 0.25, duration: ascent, ease: "power1.in" }, "<")
          .to(label, { opacity: 0, duration: 0.3 }, "<0.3")
          .add(finish);
        });
      }

      const skip = () => finish();
      window.addEventListener("pointerdown", skip, { once: true });
      window.addEventListener("keydown", skip, { once: true });
      killers.push(() => {
        window.removeEventListener("pointerdown", skip);
        window.removeEventListener("keydown", skip);
        tl?.kill();
      });
    } else {
      ready.then(plotIn);
    }

    return () => {
      cancelled = true;
      st.kill();
      killers.forEach((k) => k());
      disposeScene();
    };
  }, []);

  // fade the canvas in once the scene exists
  useEffect(() => {
    if (mode === "scene") requestAnimationFrame(() => setVisible(true));
  }, [mode]);

  // debug scrubber drives the scene and the readouts directly
  useEffect(() => {
    if (debug === null) return;
    flight.set(debug);
    sceneRef.current?.setProgress(debug);
  }, [debug, mode]);

  return (
    <>
      {mode !== "static" && (
        <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-700" style={{ opacity: visible ? 1 : 0 }}>
          <canvas ref={canvasRef} data-orbit-scene={mode} className="absolute inset-0 w-full h-full" />
        </div>
      )}

      {mode === "static" && (
        <div aria-hidden="true" data-orbit-static className="absolute inset-x-0 top-0 h-[100svh] pointer-events-none z-0 hidden md:block">
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
