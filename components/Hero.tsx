"use client";

import { useState } from "react";
import BookingModal from "./BookingModal";

export default function Hero() {
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#52B788 1px, transparent 1px), linear-gradient(90deg, #52B788 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-green-700/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 border border-green-600/40 bg-green-700/10 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-sm font-medium tracking-wide">
            AI-Powered Business Solutions
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6">
          <span className="text-white">Your Business,</span>
          <br />
          <span className="text-gradient">Intelligently Integrated.</span>
        </h1>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-gray-400 font-light mb-4">
          Business Integrations for a Modern Era
        </p>

        {/* Sub-description */}
        <p className="text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
          We build custom websites and deploy intelligent AI agents that handle
          your marketing, outreach, and bookings — so you can focus on running
          your business.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setBookingOpen(true)}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-500 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-green-600/20"
          >
            Book a Free Consultation
          </button>
          <a
            href="#services"
            className="w-full sm:w-auto border border-navy-700 hover:border-green-600/50 text-gray-300 hover:text-white font-medium px-8 py-4 rounded-xl transition-all duration-200"
          >
            See What We Do
          </a>
        </div>

        {/* Social proof */}
        <p className="mt-12 text-gray-600 text-sm">
          Serving local businesses ready to grow with AI
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </section>
  );
}
