"use client";

import { useState } from "react";
import BookingModal from "./BookingModal";
import Logo from "./Logo";

/**
 * The end of the flight. The orbit scene resolves into the mark in the space
 * above the text; without the scene (reduced motion, no WebGL) the SVG mark
 * stands in, hidden whenever the scene is running.
 */
export default function SignOff() {
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <section id="signoff" className="relative min-h-[100svh] flex flex-col items-center justify-end px-4 sm:px-6 pb-20 text-center">
      {/* stand-in for the scene's final frame: same place, same size */}
      <div
        aria-hidden="true"
        className="signoff-static absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ top: "36%", width: "calc(22vmin * 64 / 23)" }}
      >
        <Logo size={64} variant="primary" decorative className="w-full h-auto" />
      </div>

      <div className="relative">
        <div className="font-space-mono text-[11px] tracking-[0.35em] text-teal-400 uppercase mb-5">
          Escape velocity reached
        </div>
        <h2 className="font-syne font-bold text-white leading-tight mb-8" style={{ fontSize: "clamp(1.9rem, 4vw, 3.2rem)" }}>
          Ready when you are.
        </h2>
        <button
          onClick={() => setBookingOpen(true)}
          className="group font-syne font-bold text-navy-950 bg-teal-400 hover:bg-teal-300 text-sm tracking-wide px-8 py-4 transition-all duration-200 inline-flex items-center gap-3"
          style={{ clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))" }}
        >
          Book a Free Consultation
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>

      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </section>
  );
}
