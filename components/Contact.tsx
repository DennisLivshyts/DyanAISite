"use client";

import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", business: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

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
    <section id="contact" className="py-24 px-6 bg-navy-950">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-green-500 text-sm font-semibold tracking-widest uppercase mb-3">
            Get in Touch
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Book a free consultation or send us a message. We typically respond
            within one business day.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left: contact options */}
          <div className="flex flex-col gap-6">
            {/* Book a call */}
            <a
              href="https://calendly.com/dyanailabs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-green-600 hover:bg-green-500 text-white rounded-xl p-6 transition-all group"
            >
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-lg">Book a Free Call</p>
                <p className="text-white/70 text-sm">Pick a time that works for you — 30 min, no commitment</p>
              </div>
              <svg className="w-5 h-5 ml-auto group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>

            {/* Email directly */}
            <a
              href="mailto:livshytsd@dyanailabs.com"
              className="flex items-center gap-4 bg-navy-800 hover:bg-navy-700 border border-navy-700 hover:border-green-600/30 text-white rounded-xl p-6 transition-all group"
            >
              <div className="w-12 h-12 rounded-lg bg-green-700/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Email Us Directly</p>
                <p className="text-gray-400 text-sm">livshytsd@dyanailabs.com</p>
              </div>
              <svg className="w-5 h-5 ml-auto text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>

            <p className="text-gray-600 text-sm">
              Prefer to fill in a form? Use the form on the right and we'll get back to you within 24 hours.
            </p>
          </div>

          {/* Right: contact form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Your Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Jane Smith"
                  className="w-full bg-navy-800 border border-navy-700 focus:border-green-600/60 rounded-lg px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Email *</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="jane@business.com"
                  className="w-full bg-navy-800 border border-navy-700 focus:border-green-600/60 rounded-lg px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Business Name</label>
              <input
                name="business"
                value={form.business}
                onChange={handleChange}
                placeholder="Your Business"
                className="w-full bg-navy-800 border border-navy-700 focus:border-green-600/60 rounded-lg px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Message *</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Tell us about your business and what you're looking to build..."
                className="w-full bg-navy-800 border border-navy-700 focus:border-green-600/60 rounded-lg px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors text-sm resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading" || status === "success"}
              className="bg-green-600 hover:bg-green-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors"
            >
              {status === "loading" ? "Sending..." : status === "success" ? "Message Sent!" : "Send Message"}
            </button>

            {status === "error" && (
              <p className="text-red-400 text-sm text-center">
                Something went wrong. Please email us directly at livshytsd@dyanailabs.com
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
