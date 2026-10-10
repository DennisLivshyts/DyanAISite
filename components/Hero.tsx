"use client";

import { useEffect, useRef, useState } from "react";
import { flight } from "@/lib/flight";
import BookingModal from "./BookingModal";

const TICKER_ITEMS = [
  "Custom Websites",
  "3D & Motion",
  "AI Agents",
  "Data Platforms",
  "Booking Systems",
];
// Repeated so the marquee loops seamlessly at -50%.
const TICKER = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];

// Phase and velocity are live: read from the flight as the page scrolls.
const HUD_ROWS: { label: string; value: string; live?: "phase" | "velocity" }[] = [
  { label: "Phase", value: "Approach", live: "phase" },
  { label: "Velocity", value: "0.65 ×", live: "velocity" },
  { label: "Status", value: "Accepting Clients" },
  { label: "Location", value: "San Francisco, CA" },
];

export default function Hero() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const phaseRef = useRef<HTMLDivElement>(null);
  const velRef = useRef<HTMLDivElement>(null);

  // write straight to the DOM: scrolling never re-renders the hero
  useEffect(() => flight.subscribe((f) => {
    if (phaseRef.current) phaseRef.current.textContent = f.phase;
    if (velRef.current) velRef.current.textContent = `${f.velocity.toFixed(2)} ×`;
  }), []);

  return (
    <section id="top" className="relative min-h-screen flex flex-col overflow-hidden">

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full pt-32 pb-12">
          <div className="grid lg:grid-cols-[1fr_280px] gap-20 items-center">

            {/* LEFT: Headline block */}
            <div>
              {/* Mission label — replaces pill badge */}
              <div className="flex items-center gap-4 mb-10">
                <div className="h-px w-10 bg-teal-400" />
                <span className="font-space-mono text-[11px] tracking-[0.35em] text-teal-400 uppercase">
                  Mission // 001
                </span>
              </div>

              {/* The logo's gravity assist, in words */}
              <h1 className="font-syne font-bold leading-[1.02] tracking-tight mb-10"
                style={{ fontSize: "clamp(2.5rem, 5.5vw, 5rem)" }}>
                <span className="block text-white">You arrive with momentum.</span>
                <span className="block text-white">We bend the course.</span>
                <span className="block text-gradient" style={{ paddingBottom: '0.08em' }}>You leave faster.</span>
              </h1>

              <p className="text-gray-400 text-lg max-w-md leading-relaxed mb-12 font-light">
                DyanAI Labs builds websites, AI agents and data platforms for
                businesses that need to move, and stays in orbit after launch.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-8">
                <button
                  onClick={() => setBookingOpen(true)}
                  className="group font-syne font-bold text-navy-950 bg-teal-400 hover:bg-teal-300 text-sm tracking-wide px-8 py-4 transition-all duration-200 flex items-center gap-3"
                  style={{ clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))" }}
                >
                  Book a Free Consultation
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>

                <a
                  href="#work"
                  className="group font-space-mono text-[11px] tracking-[0.25em] uppercase text-gray-500 hover:text-teal-400 transition-colors flex items-center gap-3"
                >
                  <span className="w-8 h-px bg-current group-hover:w-12 transition-all duration-300" />
                  See the Work
                </a>
              </div>
            </div>

            {/* RIGHT: Mission Status HUD */}
            {/* sits low, level with the CTAs: the planet owns the upper right of the hero */}
            <div className="hidden lg:block lg:self-end lg:translate-y-6">
              <div
                className="relative border border-teal-500/25 bg-navy-950/90 backdrop-blur-sm p-7"
                style={{ clipPath: "polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 0 100%)" }}
              >
                {/* Notched corner accent */}
                <div className="absolute top-0 right-0 overflow-hidden" style={{ width: 24, height: 24 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <polygon points="0,0 24,0 24,24" fill="rgba(45,212,191,0.1)" />
                    <line x1="0" y1="0" x2="24" y2="24" stroke="rgba(45,212,191,0.3)" strokeWidth="1" />
                  </svg>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-5 border-b border-white/8">
                  <span className="font-space-mono text-[10px] tracking-[0.3em] text-gray-500 uppercase">
                    Flight Status
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                    <span className="font-space-mono text-[10px] text-teal-400">Online</span>
                  </div>
                </div>

                {/* Data rows */}
                <div className="space-y-5">
                  {HUD_ROWS.map((row) => (
                    <div key={row.label}>
                      <div className="font-space-mono text-[9px] tracking-[0.28em] text-gray-600 uppercase mb-1">
                        {row.label}
                      </div>
                      <div
                        ref={row.live === "phase" ? phaseRef : row.live === "velocity" ? velRef : undefined}
                        className={`font-space-mono text-sm ${row.live ? "text-teal-300 tabular-nums" : "text-white"}`}
                      >
                        {row.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom accent line */}
                <div className="mt-6 pt-5 border-t border-white/8">
                  <div className="h-px" style={{ background: "linear-gradient(90deg, rgba(45,212,191,0.5), transparent)" }} />
                </div>

                {/* Bottom-left corner brackets */}
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-teal-500/30" />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Ticker strip */}
      <div className="relative z-10 border-t border-white/8 overflow-hidden">
        <div className="py-3.5 overflow-hidden">
          <div className="animate-marquee flex items-center">
            {TICKER.map((item, i) => (
              <span
                key={i}
                className="font-space-mono text-[10px] tracking-[0.3em] text-gray-600 uppercase px-10 whitespace-nowrap inline-flex items-center gap-10"
              >
                {item}
                <span className="text-teal-500/25 text-xs">◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </section>
  );
}
