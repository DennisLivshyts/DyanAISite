"use client";

import { useState } from "react";
import BookingModal from "./BookingModal";

function FloatLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <label className="absolute left-4 top-4 text-gray-500 text-sm transition-all duration-200 pointer-events-none peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-teal-400 peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-[11px] peer-[&:not(:placeholder-shown)]:text-gray-400">
        {label}
      </label>
    </div>
  );
}

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", business: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [bookingOpen, setBookingOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setStatus(res.ok ? "success" : "error");
  };

  return (
    <section
      id="contact"
      className="relative py-32 px-6 bg-navy-950 overflow-hidden"
    >
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#2DD4BF 1px, transparent 1px), linear-gradient(90deg, #2DD4BF 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-teal-600/15 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-10 bg-teal-400" />
            <span className="font-space-mono text-[11px] tracking-[0.35em] text-teal-400 uppercase">
              Let's Work Together
            </span>
          </div>
          <h2 className="font-syne text-4xl md:text-5xl font-bold text-white leading-tight">
            Ready to grow?
          </h2>
          <p className="text-gray-400 mt-4 text-lg max-w-lg leading-relaxed">
            Book a free call or send a message — we'll figure out exactly what your business needs.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-stretch">

          {/* Left: Book-a-call card */}
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setBookingOpen(true)}
              className="group relative w-full flex-1 text-left rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.015] active:scale-[0.99]"
            >
              {/* Gradient border layer */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-400/25 via-teal-600/10 to-transparent" />
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    "conic-gradient(from 180deg at 50% 50%, rgba(20,184,166,0.2) 0deg, rgba(45,212,191,0.12) 90deg, transparent 180deg, rgba(20,184,166,0.2) 270deg, rgba(45,212,191,0.12) 360deg)",
                }}
              />
              <div className="absolute inset-[1px] rounded-2xl bg-navy-900" />

              <div className="relative p-8 flex flex-col h-full">
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center mb-7 group-hover:bg-teal-500/25 group-hover:border-teal-400/40 transition-all duration-300">
                  <svg className="w-7 h-7 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">Book a Free Call</h3>
                <p className="text-gray-400 mb-7 leading-relaxed text-sm">
                  30 minutes. No pitch, no pressure. We'll listen to your situation and tell you honestly what would move the needle.
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {["30 min", "Free", "No commitment"].map((tag) => (
                    <span
                      key={tag}
                      className="font-space-mono text-[10px] tracking-[0.15em] uppercase text-teal-400 border border-teal-500/30 bg-teal-500/10 px-3 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* CTA row */}
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-white font-semibold group-hover:text-teal-400 transition-colors">
                    Pick a time
                    <span className="inline-block ml-1 group-hover:translate-x-1 transition-transform duration-200">→</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500 text-xs mr-1">Available</span>
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${i < 4 ? "bg-teal-400" : "bg-navy-700"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </button>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "< 24h", label: "Response time" },
                { value: "Free", label: "Consultation" },
                { value: "100%", label: "Custom builds" },
              ].map(({ value, label }) => (
                <div
                  key={label}
                  className="bg-navy-900 border border-navy-700 hover:border-teal-500/20 rounded-xl p-4 text-center transition-colors duration-200"
                >
                  <p className="font-space-mono text-teal-400 font-bold text-lg">{value}</p>
                  <p className="text-gray-500 text-xs mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Contact form */}
          {status === "success" ? (
            <div className="flex flex-col items-center justify-center min-h-[480px] rounded-2xl bg-navy-900 border border-navy-700 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-teal-500/15 border border-teal-500/30 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Message sent</h3>
              <p className="text-gray-400 text-sm">We'll get back to you within one business day.</p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-navy-900 border border-navy-700 rounded-2xl p-8 space-y-4"
            >
              <div className="mb-2">
                <p className="text-white font-semibold text-lg">Send a message</p>
                <p className="text-gray-500 text-sm mt-1">We'll reply within one business day.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <FloatLabel label="Your Name *">
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder=" "
                    className="peer w-full bg-navy-800 border border-navy-700 hover:border-navy-600 focus:border-teal-500/50 rounded-xl px-4 pt-6 pb-3 text-white outline-none transition-colors text-sm"
                  />
                </FloatLabel>
                <FloatLabel label="Email *">
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder=" "
                    className="peer w-full bg-navy-800 border border-navy-700 hover:border-navy-600 focus:border-teal-500/50 rounded-xl px-4 pt-6 pb-3 text-white outline-none transition-colors text-sm"
                  />
                </FloatLabel>
              </div>

              <FloatLabel label="Business Name">
                <input
                  name="business"
                  value={form.business}
                  onChange={handleChange}
                  placeholder=" "
                  className="peer w-full bg-navy-800 border border-navy-700 hover:border-navy-600 focus:border-teal-500/50 rounded-xl px-4 pt-6 pb-3 text-white outline-none transition-colors text-sm"
                />
              </FloatLabel>

              <FloatLabel label="Message *">
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder=" "
                  className="peer w-full bg-navy-800 border border-navy-700 hover:border-navy-600 focus:border-teal-500/50 rounded-xl px-4 pt-6 pb-3 text-white outline-none transition-colors text-sm resize-none"
                />
              </FloatLabel>

              <button
                type="submit"
                disabled={status === "loading"}
                className="relative w-full bg-teal-500 hover:bg-teal-400 disabled:opacity-60 disabled:cursor-not-allowed text-navy-950 font-bold py-4 rounded-xl transition-all duration-200 overflow-hidden group"
              >
                <span className="relative z-10">
                  {status === "loading" ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Sending…
                    </span>
                  ) : (
                    "Send Message"
                  )}
                </span>
                <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              </button>

              {status === "error" && (
                <p className="text-red-400 text-sm text-center">
                  Something went wrong. Email us at{" "}
                  <a href="mailto:livshytsd@dyanailabs.com" className="underline hover:text-red-300">
                    livshytsd@dyanailabs.com
                  </a>
                </p>
              )}
            </form>
          )}
        </div>
      </div>

      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </section>
  );
}
