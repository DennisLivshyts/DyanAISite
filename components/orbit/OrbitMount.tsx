"use client";

import { useEffect, useRef, useState } from "react";
import type { gsap as GSAP } from "gsap";
import Logo from "../Logo";
import { FLIGHT, approachHeading, approachScreen } from "@/lib/orbit";
import { flight } from "@/lib/flight";
import type { OrbitScene } from "./scene";

/**
 * Runs the flight:
 *
 * - Scroll director: each page section is pinned to a point on the flight
 *   (ring crossing at Capabilities, periapsis at Work, punch-through on the
 *   Contact heading, the mark at the sign-off). GSAP smooths the motion once it
 *   has loaded; until then scroll maps straight through. It always runs, so the
 *   tracker and status panel work without WebGL too.
 * - Scene: three.js is a separate chunk, created once the browser is idle —
 *   or straight away when the launch screen is showing, which hides the load.
 * - Launch: first visit per session, a craft climbs from the bottom of the
 *   screen to exactly where the scene's craft sits, then the overlay dissolves
 *   and the planned course plots itself. Hard-capped; any key or click skips.
 * - prefers-reduced-motion, no WebGL, or a failed import → a static mark.
 * - ?orbit=<0..1> pins the flight and shows a scrubber (review/debug).
 */

// GSAP (~48 KB gz with ScrollTrigger) is loaded on demand, after hydration —
// nothing needs it for the first paint.
type Gsap = typeof GSAP;
type Loaded = { gsap: Gsap; ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger };
let gsapLoad: Promise<Loaded> | null = null;
function loadGsap(): Promise<Loaded> {
  gsapLoad ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([g, st]) => {
    g.gsap.registerPlugin(st.ScrollTrigger);
    return { gsap: g.gsap, ScrollTrigger: st.ScrollTrigger };
  });
  return gsapLoad;
}

type Mode = "pending" | "scene" | "static";

const LAUNCH_CAP_MS = 3500;   // the inline <head> script removes the overlay at this point regardless
const ASCENT_S = 1.0;
const FADE_S = 0.45;

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
    // until GSAP arrives: scroll maps straight through, no smoothing
    let to: (s: number) => void = (s) => { proxy.s = s; apply(); };
    const direct = () => to(mapScroll(anchors, window.scrollY));
    const remeasure = () => { anchors = measureAnchors(); direct(); };
    window.addEventListener("scroll", direct, { passive: true });
    window.addEventListener("resize", remeasure);
    let killScroll = () => {
      window.removeEventListener("scroll", direct);
      window.removeEventListener("resize", remeasure);
    };
    if (pinned !== null) flight.set(pinned);

    /* ── scene ── */
    let cancelled = false;
    let gsap: Gsap | null = null;
    const gsapReady = loadGsap().then(({ gsap: g, ScrollTrigger: ST }) => {
      if (cancelled) return g;
      gsap = g;
      // hand the scroll over to ScrollTrigger + quickTo smoothing
      killScroll();
      const quick = g.quickTo(proxy, "s", { duration: reduce ? 0 : 0.7, ease: "power3.out", onUpdate: apply });
      to = (s) => quick(s);
      const st = ST.create({
        start: 0,
        end: "max",
        onUpdate: (self) => to(mapScroll(anchors, self.scroll())),
        onRefresh: () => { anchors = measureAnchors(); to(mapScroll(anchors, window.scrollY)); },
      });
      killScroll = () => st.kill();
      return g;
    });
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
      // created as the launch screen fades, so shader compilation never
      // competes with the climb (see finish below)
    } else {
      const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
      if (w.requestIdleCallback) w.requestIdleCallback(startScene, { timeout: 1500 }); else window.setTimeout(startScene, 300);
    }

    /* ── course plot: the planned path traces itself in once the craft is in place ── */
    const plotIn = (scene: OrbitScene | null) => {
      if (!scene || cancelled) return;
      const p = { t: 0 };
      scene.setPlot(0);
      gsapReady.then((g) => {
        if (!cancelled) g.to(p, { t: 1, duration: 1.4, ease: "power1.inOut", onUpdate: () => scene.setPlot(p.t) });
      });
    };

    /* ── launch ── */
    const killers: (() => void)[] = [];
    if (launching) {
      const root = document.getElementById("launch");
      const trail = document.getElementById("launch-trail") as SVGPathElement | null;
      const craft = document.getElementById("launch-craft") as SVGCircleElement | null;
      const glowEl = document.getElementById("launch-glow") as SVGCircleElement | null;
      const label = document.getElementById("launch-label");
      const pad = document.getElementById("launch-pad");
      const remaining = LAUNCH_CAP_MS - performance.now();
      let tl: ReturnType<Gsap["timeline"]> | null = null;
      let done = false;

      const finish = () => {
        if (done) return;
        done = true;
        tl?.kill();
        if (!reduce && webglAvailable()) startScene();   // fades in under the overlay's fade-out
        // a hidden tab gets no animation frames, so a tweened fade would never finish
        if (root && !document.hidden && gsap) gsap.to(root, { opacity: 0, duration: 0.45, ease: "power1.out", onComplete: endLaunch });
        else endLaunch();
        ready.then(plotIn);
      };

      // Only skip when there's genuinely no time left for a climb; otherwise the
      // ignition is already running (CSS) and the climb always gets to play.
      // A background tab (opened with a middle-click, say) gets no animation frames
      // at all: skip the show rather than leave the scene waiting on it.
      if (!root || !trail || !craft || !glowEl || !label || window.scrollY > 40 || remaining < 700 || document.hidden) {
        // too late, already scrolled, or no overlay: don't make anyone wait
        done = true;
        endLaunch();
        if (!reduce && webglAvailable()) startScene();
        ready.then(plotIn);
      } else {
        const W = window.innerWidth, H = window.innerHeight;

        // Let the ignition read for a moment (it has been running in CSS since
        // first paint), then climb — no waiting on three.js: the target is
        // computed by hand from the same transform the scene uses.
        const wait = Math.max(0, Math.min(700 - performance.now(), remaining - (ASCENT_S + FADE_S) * 1000 - 200));
        setTimeout(async () => {
          const g = await gsapReady;
          if (cancelled || done) return;
          // build the timeline now, not earlier: tweens added to a timeline that has
          // been playing while we waited land "in the past" and skip ahead
          tl = g.timeline();
          const left = LAUNCH_CAP_MS - performance.now() - FADE_S * 1000 - 100;
          const ascent = Math.max(0.5, Math.min(ASCENT_S, left / 1000));
          const mobile = window.matchMedia("(max-width: 767px)").matches;
          const target = approachScreen(W, H, mobile);
          const heading = approachHeading(W, H, mobile);          // ~22° below level, toward the planet
          // A launch arc: clear the pad vertically, pitch over through level near
          // the top, then a short gentle descent that meets the flight exactly on
          // its own heading — curving the whole way, no corners, no reversal.
          // start exactly where the CSS put the pad, then take over positioning
          const origin = document.getElementById("launch-origin");
          const pr = (pad ?? craft).getBoundingClientRect();
          const padX = pr.left + pr.width / 2;
          const padY = pr.top + pr.height / 2;
          origin?.style.setProperty("transform", "none");
          for (const el of [craft, glowEl, pad]) { el?.setAttribute("cx", String(padX)); el?.setAttribute("cy", String(padY)); }
          const dy = padY - target.y;
          const dx = Math.max(1, target.x - padX);
          const [ux, uy] = [Math.cos(heading), Math.sin(heading)];
          // back off along the heading for the last control point, but never so far
          // that the path would swing back left of where it has already been
          const b = Math.min(dy * 0.3, (dx * 0.85) / Math.max(0.2, ux));
          const d = `M ${padX} ${padY} C ${padX} ${padY - dy * 0.6}, ${target.x - ux * b} ${target.y - uy * b}, ${target.x} ${target.y}`;
          trail.setAttribute("d", d);
          const L = trail.getTotalLength();
          trail.style.strokeDasharray = `${L}`;
          trail.style.strokeDashoffset = `${L}`;
          const p = { t: 0 };
          // hand the label and pad over from their CSS animations (which would
          // override any inline opacity) to the timeline
          label.style.animation = "none";
          label.style.opacity = "1";
          if (pad) { pad.style.animation = "none"; pad.style.opacity = "0.4"; tl.to(pad, { opacity: 0, duration: 0.2 }, 0); }
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
          .to(glowEl, { attr: { r: 6 }, duration: ascent, ease: "power1.in" }, "<")
          .to(label, { opacity: 0, duration: 0.3 }, "<0.3")
          .add(finish);
        }, wait);
      }

      // Belt and braces: whatever happens to the animation, the launch ends — and
      // the scene starts — at the cap.
      const capTimer = window.setTimeout(finish, Math.max(0, remaining));
      killers.push(() => window.clearTimeout(capTimer));

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
      killScroll();
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
          {/* same spot and size as the scene's approach frame (KEYS_DESKTOP[0]): ring radius 22vmin */}
          <div className="absolute" style={{ left: "78%", top: "40%", width: "calc(22vmin * 64 / 23)", transform: "translate(-50%, -50%)" }}>
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
