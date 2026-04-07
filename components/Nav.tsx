"use client";

import { useState, useEffect } from "react";
import AboutModal from "./AboutModal";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Services", href: "#services" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Why Us", href: "#why-us" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-navy-900/95 backdrop-blur-sm border-b border-navy-700"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">
            <span className="text-white">Dyan</span>
            <span className="text-gradient">AI</span>
            <span className="text-white"> Labs</span>
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => setAboutOpen(true)}
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            About
          </button>
          <a
            href="https://calendly.com/livshytsd-dyanailabs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Book a Call
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-gray-300 hover:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-navy-900/98 border-t border-navy-700 px-6 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="text-gray-300 hover:text-white transition-colors"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => { setAboutOpen(true); setMenuOpen(false); }}
            className="text-gray-300 hover:text-white transition-colors text-left"
          >
            About
          </button>
          <a
            href="https://calendly.com/livshytsd-dyanailabs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-colors font-medium text-center"
          >
            Book a Call
          </a>
        </div>
      )}

      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
    </header>
  );
}
