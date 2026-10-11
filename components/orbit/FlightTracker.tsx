"use client";

import { useEffect, useMemo, useRef } from "react";
import { FLIGHT, GEO, RBODY, S, thetaAt, world } from "@/lib/orbit";
import { flight } from "@/lib/flight";

/**
 * A small copy of the flight path pinned to the right edge: where the craft
 * is now, and a tick per section you can click to jump to. Desktop only.
 * Updates by writing to the SVG directly — scrolling never re-renders React.
 */

const STOPS = [
  { s: FLIGHT.approach,  id: "top",          label: "Top" },
  { s: FLIGHT.ringIn,    id: "capabilities", label: "Capabilities" },
  { s: FLIGHT.periapsis, id: "work",         label: "Work" },
  { s: FLIGHT.process,   id: "process",      label: "Process" },
  { s: FLIGHT.ringOut,   id: "contact",      label: "Contact" },
  { s: FLIGHT.resolve,   id: "signoff",      label: "Sign-off" },
];

const N = 140;

export default function FlightTracker() {
  // fit the whole flight (approach from far out included) into a small box
  const geo = useMemo(() => {
    const pts = Array.from({ length: N + 1 }, (_, i) => world(thetaAt(i / N)));
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const rRing = GEO.rSoi;
    const minX = Math.min(...xs, -rRing), maxX = Math.max(...xs, rRing);
    const minY = Math.min(...ys, -rRing), maxY = Math.max(...ys, rRing);
    const W = 112, pad = 6;
    const k = (W - pad * 2) / (maxX - minX);
    const H = (maxY - minY) * k + pad * 2;
    const map = ([x, y]: [number, number]) => [pad + (x - minX) * k, pad + (maxY - y) * k] as const;
    const at = (s: number) => map(world(thetaAt(s)));
    // click areas: as big as 9px, but never overlapping a neighbouring stop
    const stopPts = STOPS.map((st) => at(st.s));
    const hitR = stopPts.map(([x, y], i) => {
      const nearest = Math.min(...stopPts.filter((_, j) => j !== i).map(([u, v]) => Math.hypot(u - x, v - y)));
      return Math.max(3, Math.min(9, nearest / 2 - 0.5));
    });
    return {
      hitR,
      W, H, k,
      body: map([0, 0]),
      pts: pts.map(map),
      at,
      rBody: RBODY * S * k,
      rRing: rRing * k,
    };
  }, []);

  const traveled = useRef<SVGPolylineElement>(null);
  const head = useRef<SVGCircleElement>(null);
  const phase = useRef<HTMLSpanElement>(null);
  const vel = useRef<HTMLSpanElement>(null);

  useEffect(() => flight.subscribe((f) => {
    const upto = Math.max(1, Math.round(f.s * N));
    traveled.current?.setAttribute("points", geo.pts.slice(0, upto + 1).map((p) => p.join(",")).join(" "));
    const [x, y] = geo.at(f.s);
    head.current?.setAttribute("cx", x.toFixed(1));
    head.current?.setAttribute("cy", y.toFixed(1));
    if (phase.current) phase.current.textContent = f.phase;
    if (vel.current) vel.current.textContent = `v ${f.velocity.toFixed(2)}`;
  }), [geo]);

  const go = (id: string) => {
    if (id === "top") window.scrollTo({ top: 0, behavior: "smooth" });
    else document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: id === "signoff" ? "end" : "start" });
  };

  return (
    <nav
      aria-label="Flight path — jump to a section"
      className="hidden min-[1440px]:flex fixed right-5 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-3 select-none"
    >
      <svg width={geo.W} height={geo.H} viewBox={`0 0 ${geo.W} ${geo.H}`} className="overflow-visible">
        <circle cx={geo.body[0]} cy={geo.body[1]} r={geo.rRing} fill="none" stroke="#2DD4BF" strokeOpacity="0.25" />
        <circle cx={geo.body[0]} cy={geo.body[1]} r={geo.rBody} fill="#0D3A45" stroke="#2DD4BF" strokeOpacity="0.5" />
        <polyline points={geo.pts.map((p) => p.join(",")).join(" ")} fill="none" stroke="#67E8F9" strokeOpacity="0.15" strokeDasharray="2 3" />
        <polyline ref={traveled} fill="none" stroke="#67E8F9" strokeOpacity="0.85" strokeWidth="1.5" strokeLinecap="round" />
        {STOPS.map((st, i) => {
          const [x, y] = geo.at(st.s);
          return (
            <g key={st.id} className="group">
              <circle cx={x} cy={y} r="2" fill="#0A1628" stroke="#2DD4BF" strokeOpacity="0.7" />
              <circle
                cx={x} cy={y} r={geo.hitR[i]} fill="transparent" className="cursor-pointer"
                role="button" tabIndex={0} aria-label={`Go to ${st.label}`}
                onClick={() => go(st.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(st.id); } }}
              >
                <title>{st.label}</title>
              </circle>
              <text
                x={x - 10} y={y + 3} textAnchor="end"
                className="font-space-mono pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
                fontSize="8" letterSpacing="1.5" fill="#99F6E4"
              >
                {st.label.toUpperCase()}
              </text>
            </g>
          );
        })}
        <circle ref={head} r="3" fill="#A5F3FC" style={{ filter: "drop-shadow(0 0 4px rgba(103,232,249,0.8))" }} />
      </svg>
      <div className="font-space-mono text-[9px] tracking-[0.25em] uppercase text-gray-400 text-center leading-relaxed">
        <span ref={phase} className="block text-teal-400/80">Approach</span>
        <span ref={vel}>v 0.65</span>
      </div>
    </nav>
  );
}
