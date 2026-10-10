"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ── Deterministic star positions (golden-ratio spread) ── */
const makeStars = (count: number, seed: number) =>
  Array.from({ length: count }, (_, i) => ({
    x: ((i * 16.18 + seed) * 7.3) % 100,
    y: ((i * 27.43 + seed) * 3.7) % 100,
    size: 1 + (i % 3) * 0.4,
    twinkleDur: 2.2 + (i % 7) * 0.55,
    twinkleDelay: (i * 0.37) % 5,
    opacity: 0.10 + (i % 5) * 0.05,
  }));

const FAR_STARS  = makeStars(45, 3);
const NEAR_STARS = makeStars(22, 11);

/* ── Satellite SVG (inline, minimal) ── */
function SatelliteIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="overflow-visible">
      {/* Body */}
      <rect x="8" y="8" width="6" height="6" rx="1" fill="rgba(180,220,255,0.7)" stroke="rgba(180,220,255,0.9)" strokeWidth="0.6" />
      {/* Solar panels */}
      <rect x="1" y="9.5" width="6" height="3" rx="0.5" fill="rgba(100,180,255,0.45)" stroke="rgba(100,180,255,0.7)" strokeWidth="0.5" />
      <rect x="15" y="9.5" width="6" height="3" rx="0.5" fill="rgba(100,180,255,0.45)" stroke="rgba(100,180,255,0.7)" strokeWidth="0.5" />
      {/* Antenna */}
      <line x1="11" y1="2" x2="11" y2="8" stroke="rgba(200,230,255,0.6)" strokeWidth="0.6" />
      <circle cx="11" cy="2" r="1" fill="rgba(200,230,255,0.8)" className="animate-blink" />
    </svg>
  );
}

interface ShootingStar { id: number; top: number; right: number; angle: number; }
interface Satellite    { id: number; top: number; dur: number; }

export default function SpaceBackground() {
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
  const [satellites, setSatellites]       = useState<Satellite[]>([]);
  const scrollY = useRef(0);
  const farRef  = useRef<HTMLDivElement>(null);
  const nearRef = useRef<HTMLDivElement>(null);
  const rafRef  = useRef<number | null>(null);

  /* ── Parallax on scroll ── */
  const onScroll = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      scrollY.current = window.scrollY;
      if (farRef.current)  farRef.current.style.transform  = `translateY(${scrollY.current * 0.04}px)`;
      if (nearRef.current) nearRef.current.style.transform = `translateY(${scrollY.current * 0.09}px)`;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  /* ── Shooting star: random every 9-18s ── */
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let counter = 0;

    const schedule = () => {
      const delay = 9000 + Math.random() * 9000;
      timeout = setTimeout(() => {
        const id = ++counter;
        setShootingStars(s => [...s, {
          id,
          top:   6  + Math.random() * 40,   // vertical start (vh)
          right: -8 - Math.random() * 15,   // off-screen right (negative = beyond right edge)
          angle: 0,
        }]);
        setTimeout(() => setShootingStars(s => s.filter(x => x.id !== id)), 1900);
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(timeout);
  }, []);

  /* ── Satellite: drifts across every 25-45s ── */
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let counter = 0;

    const schedule = () => {
      const delay = 25000 + Math.random() * 20000;
      timeout = setTimeout(() => {
        const id = ++counter;
        const dur = 22 + Math.random() * 14;
        setSatellites(s => [...s, {
          id,
          top: 8 + Math.random() * 28,
          dur,
        }]);
        setTimeout(() => setSatellites(s => s.filter(x => x.id !== id)), dur * 1000 + 200);
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">

      {/* ── Far star layer (slower parallax) ── */}
      <div ref={farRef} className="absolute inset-0">
        {FAR_STARS.map((star, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top:  `${star.y}%`,
              width:  `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animation: `star-twinkle ${star.twinkleDur}s ease-in-out infinite`,
              animationDelay: `${star.twinkleDelay}s`,
            }} />
        ))}
      </div>

      {/* ── Near star layer (faster parallax, slightly larger) ── */}
      <div ref={nearRef} className="absolute inset-0">
        {NEAR_STARS.map((star, i) => (
          <div key={i} className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top:  `${star.y}%`,
              width:  `${star.size + 0.4}px`,
              height: `${star.size + 0.4}px`,
              opacity: star.opacity,
              background: i % 6 === 0 ? "rgba(180,240,220,0.9)" : i % 6 === 1 ? "rgba(180,210,255,0.9)" : "white",
              animation: `star-twinkle ${star.twinkleDur}s ease-in-out infinite`,
              animationDelay: `${star.twinkleDelay}s`,
            }} />
        ))}
      </div>

      {/* ── Shooting stars ── */}
      {shootingStars.map((s) => (
        <div key={s.id}
          className="animate-shoot absolute"
          style={{
            top:    `${s.top}vh`,
            right:  `${s.right}vw`,   // negative value pushes it off-screen right
            height: "1.5px",
            borderRadius: "1px",
            /* head (left) bright white → teal glow → transparent tail (right) */
            background: "linear-gradient(to right, rgba(255,255,255,0.95) 0%, rgba(180,240,225,0.7) 30%, rgba(120,210,200,0.3) 65%, transparent 100%)",
            boxShadow: "0 0 5px 1px rgba(200,255,240,0.35)",
            transformOrigin: "center center",
          }} />
      ))}

      {/* ── Satellite ── */}
      {satellites.map((sat) => (
        <div key={sat.id}
          className="animate-satellite absolute opacity-55"
          style={{
            top: `${sat.top}vh`,
            right: "-80px",
            ["--sat-dur" as string]: `${sat.dur}s`,
          }}>
          <SatelliteIcon />
        </div>
      ))}
    </div>
  );
}
