"use client";

import { useState, useEffect } from "react";

const STARS = [
  { x: 5,  y: 10, s: 1,   d: 0   }, { x: 15, y: 25, s: 1.5, d: 1.2 },
  { x: 85, y: 15, s: 1,   d: 0.5 }, { x: 92, y: 40, s: 2,   d: 2   },
  { x: 78, y: 70, s: 1,   d: 1.8 }, { x: 45, y: 5,  s: 1.5, d: 0.3 },
  { x: 60, y: 90, s: 1,   d: 2.5 }, { x: 30, y: 85, s: 1,   d: 1.1 },
  { x: 10, y: 60, s: 2,   d: 0.8 }, { x: 70, y: 50, s: 1,   d: 1.6 },
  { x: 50, y: 75, s: 1.5, d: 3   }, { x: 25, y: 45, s: 1,   d: 2.2 },
  { x: 88, y: 82, s: 2,   d: 0.4 }, { x: 40, y: 30, s: 1,   d: 1.9 },
  { x: 65, y: 20, s: 1.5, d: 0.7 }, { x: 3,  y: 78, s: 1,   d: 2.8 },
  { x: 55, y: 55, s: 1,   d: 1.4 }, { x: 20, y: 15, s: 2,   d: 0.2 },
  { x: 95, y: 60, s: 1,   d: 2.6 }, { x: 72, y: 35, s: 1.5, d: 1.3 },
  { x: 33, y: 65, s: 1,   d: 3.1 }, { x: 80, y: 92, s: 1,   d: 0.6 },
  { x: 12, y: 38, s: 1.5, d: 2.4 }, { x: 58, y: 12, s: 1,   d: 1.7 },
  { x: 42, y: 88, s: 2,   d: 0.9 }, { x: 97, y: 22, s: 1,   d: 3.3 },
  { x: 8,  y: 50, s: 1,   d: 1.5 }, { x: 63, y: 72, s: 1.5, d: 0.1 },
  { x: 28, y: 8,  s: 1,   d: 2.7 }, { x: 47, y: 48, s: 2,   d: 1.0 },
];

const EXPERIENCE = [
  {
    company: "UCSF Medical Center",
    role: "Full Stack Software Engineer",
    period: "Apr 2024 – Nov 2025",
    badge: "Contract",
    bullets: [
      "Built enterprise reporting portal that eliminated 100+ manual monthly reports",
      "Implemented HIPAA-compliant security: Windows Auth, LDAP, RBAC, TLS encryption",
      "Developed media management system for Gastroenterology & Pediatric Pulmonary",
    ],
    stack: ["React", "ASP.NET Core", "MS SQL"],
  },
  {
    company: "Dope Thoughts Media",
    role: "Front End Engineer",
    period: "Oct 2023 – Apr 2024",
    badge: "Startup",
    bullets: [
      "Built React Native mobile app from scratch for an AI-powered agricultural SaaS",
      "Implemented AI chat page connected to a custom-trained language model",
    ],
    stack: ["React Native", "Flask", "Python"],
  },
  {
    company: "Azure Access Technology",
    role: "Software Engineer Intern",
    period: "Nov 2021 – May 2022",
    badge: "Internship",
    bullets: [
      "Modernized legacy C++ codebase in Docker containers for hardware security systems",
    ],
    stack: ["C++", "Docker"],
  },
];

const SKILLS: Record<string, string[]> = {
  "AI & Agents":     ["CrewAI", "LangChain", "LangGraph", "AutoGen", "OpenAI Agents SDK", "Claude API", "Gemini", "DeepSeek", "LangSmith", "MCP"],
  "Frontend":        ["React", "React Native", "Next.js", "TypeScript", "Tailwind CSS"],
  "Backend":         ["Node.js", "Express", "ASP.NET Core", "Python", "Flask"],
  "Databases":       ["PostgreSQL", "MySQL", "MS SQL", "Firebase", "Redis"],
  "DevOps & Tools":  ["Docker", "GitHub", "Playwright", "BullMQ", "Prisma", "NextAuth"],
};

const PROJECTS = [
  {
    name: "ResumeHero",
    tagline: "Agentic resume builder",
    description:
      "Production-grade multi-agent system that researches job postings, tailors resumes with multi-LLM routing (Claude / Gemini / DeepSeek), and scrapes live listings via Playwright. Full LangSmith observability.",
    stack: ["CrewAI", "Claude", "Gemini", "Next.js", "PostgreSQL", "Playwright", "LangSmith"],
    status: "In Progress",
  },
  {
    name: "NFT Minting App",
    tagline: "Solana Android app",
    description:
      "Android app for minting Solana NFTs with real-time wallet integration, Firebase auth, and a Node.js backend.",
    stack: ["Kotlin", "Firebase", "Node.js", "Solana"],
    status: "Shipped",
  },
];

type Tab = "Experience" | "Skills" | "Projects";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("Experience");
  const [tabKey, setTabKey] = useState(0);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const switchTab = (t: Tab) => {
    setTab(t);
    setTabKey((k) => k + 1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* ── Backdrop ── */}
      <div
        className="absolute inset-0 bg-[#010a18]/80 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      />

      {/* ── Nebula orbs ── */}
      <div className="nebula-orb-1 absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(20,184,166,0.28) 0%, transparent 70%)", filter: "blur(60px)" }} />
      <div className="nebula-orb-2 absolute bottom-[-15%] right-[-5%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(6,182,212,0.22) 0%, transparent 70%)", filter: "blur(70px)" }} />
      <div className="nebula-orb-3 absolute top-[30%] right-[10%] w-[25vw] h-[25vw] max-w-[350px] max-h-[350px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)", filter: "blur(50px)" }} />
      <div className="nebula-orb-4 absolute bottom-[20%] left-[5%] w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)", filter: "blur(65px)" }} />
      <div className="nebula-orb-5 absolute top-[50%] left-[40%] w-[20vw] h-[20vw] max-w-[280px] max-h-[280px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(56,189,248,0.14) 0%, transparent 70%)", filter: "blur(45px)" }} />

      {/* ── Stars ── */}
      {STARS.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.s}px`,
            height: `${star.s}px`,
            animation: `star-twinkle ${2.5 + star.d}s ease-in-out infinite`,
            animationDelay: `${star.d}s`,
          }}
        />
      ))}

      {/* ── Modal card ── */}
      <div className="animate-modal-unfold relative z-10 w-full max-w-3xl max-h-[88vh] flex flex-col rounded-3xl border border-teal-500/20 overflow-hidden"
        style={{ background: "rgba(2, 12, 28, 0.85)", backdropFilter: "blur(24px)" }}>

        {/* Shimmer top edge */}
        <div className="absolute top-0 left-0 right-0 h-[1px] overflow-hidden">
          <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-teal-400/60 to-transparent"
            style={{ animation: "shimmer-line 3s ease-in-out infinite" }} />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* ── Scrollable content ── */}
        <div className="overflow-y-auto nebula-scroll flex-1 px-8 pt-10 pb-10">

          {/* Header */}
          <div className="mb-8 animate-fade-slide-up" style={{ animationDelay: "0.05s" }}>
            <div className="inline-flex items-center gap-2 border border-teal-500/30 bg-teal-500/10 rounded-full px-3 py-1 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-teal-400 text-xs font-medium tracking-widest uppercase">About the Founder</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-2"
              style={{ background: "linear-gradient(135deg, #2DD4BF 0%, #67E8F9 50%, #a5f3fc 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Dennis Livshyts
            </h2>
            <p className="text-lg text-gray-300 font-light mb-5">
              Full Stack Engineer &amp; Agentic AI Builder
            </p>

            {/* Credential pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { icon: "🎓", text: "BS Computer Science · CSULB" },
                { icon: "📍", text: "San Francisco, CA" },
                { icon: "⚡", text: "3+ Years Professional Exp." },
                { icon: "🤖", text: "AI / Agentic Engineering" },
              ].map(({ icon, text }) => (
                <span key={text}
                  className="text-xs text-gray-300 border border-white/10 bg-white/5 rounded-full px-3 py-1.5 flex items-center gap-1.5">
                  <span>{icon}</span>{text}
                </span>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px mb-7 animate-fade-slide-up"
            style={{ background: "linear-gradient(90deg, transparent, rgba(20,184,166,0.4), transparent)", animationDelay: "0.1s" }} />

          {/* Tabs */}
          <div className="flex gap-1 mb-8 animate-fade-slide-up" style={{ animationDelay: "0.15s" }}>
            {(["Experience", "Skills", "Projects"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  tab === t
                    ? "text-teal-300 bg-teal-500/10 border border-teal-500/30"
                    : "text-gray-400 hover:text-gray-200 border border-transparent hover:border-white/10"
                }`}
              >
                {t}
                {tab === t && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-teal-400 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* ── Tab content ── */}
          <div key={tabKey} className="animate-fade-slide-up" style={{ animationDelay: "0.05s" }}>

            {/* EXPERIENCE */}
            {tab === "Experience" && (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[7px] top-3 bottom-3 w-px"
                  style={{ background: "linear-gradient(180deg, rgba(20,184,166,0.6), rgba(20,184,166,0.1))" }} />

                <div className="space-y-8">
                  {EXPERIENCE.map((job, i) => (
                    <div key={job.company}
                      className="relative pl-8 animate-fade-slide-up"
                      style={{ animationDelay: `${i * 0.1}s` }}>
                      {/* Timeline dot */}
                      <div className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-teal-400 bg-[#020c1c]"
                        style={{ boxShadow: "0 0 8px rgba(20,184,166,0.6)" }} />

                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold text-base">{job.company}</h3>
                        <span className="text-xs border border-teal-500/30 bg-teal-500/10 text-teal-400 rounded-full px-2 py-0.5">
                          {job.badge}
                        </span>
                      </div>
                      <p className="text-teal-300/80 text-sm font-medium mb-0.5">{job.role}</p>
                      <p className="text-gray-500 text-xs mb-3">{job.period}</p>

                      <ul className="space-y-1.5 mb-4">
                        {job.bullets.map((b) => (
                          <li key={b} className="flex items-start gap-2 text-sm text-gray-400">
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-teal-500/60 flex-shrink-0" />
                            {b}
                          </li>
                        ))}
                      </ul>

                      <div className="flex flex-wrap gap-1.5">
                        {job.stack.map((s) => (
                          <span key={s}
                            className="text-xs text-cyan-400/80 bg-cyan-400/5 border border-cyan-400/15 rounded px-2 py-0.5">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Education at bottom */}
                <div className="relative pl-8 mt-8 animate-fade-slide-up" style={{ animationDelay: "0.3s" }}>
                  <div className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-indigo-400 bg-[#020c1c]"
                    style={{ boxShadow: "0 0 8px rgba(99,102,241,0.5)" }} />
                  <h3 className="text-white font-semibold text-base">Cal State Long Beach</h3>
                  <p className="text-indigo-300/80 text-sm font-medium mb-0.5">B.S. Computer Science</p>
                  <p className="text-gray-500 text-xs">2018 – 2022</p>
                </div>
              </div>
            )}

            {/* SKILLS */}
            {tab === "Skills" && (
              <div className="space-y-6">
                {Object.entries(SKILLS).map(([category, skills], ci) => (
                  <div key={category}
                    className="animate-fade-slide-up"
                    style={{ animationDelay: `${ci * 0.08}s` }}>
                    <p className="text-xs font-semibold tracking-widest uppercase text-teal-500/70 mb-3">
                      {category}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span key={skill}
                          className="text-sm text-gray-300 border border-white/10 bg-white/5 rounded-lg px-3 py-1.5 cursor-default transition-all duration-200 hover:border-teal-400/50 hover:text-teal-300 hover:bg-teal-400/8"
                          style={{ ["--hover-shadow" as string]: "0 0 12px rgba(20,184,166,0.25)" }}
                          onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 14px rgba(20,184,166,0.25)")}
                          onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PROJECTS */}
            {tab === "Projects" && (
              <div className="space-y-5">
                {PROJECTS.map((proj, i) => (
                  <div key={proj.name}
                    className="relative rounded-2xl p-6 border border-white/8 overflow-hidden group transition-all duration-300 hover:border-teal-500/30 animate-fade-slide-up"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      animationDelay: `${i * 0.1}s`,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 30px rgba(20,184,166,0.1), inset 0 0 30px rgba(20,184,166,0.03)")}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}>
                    {/* Gradient corner accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-bl-full"
                      style={{ background: "radial-gradient(circle at top right, rgba(20,184,166,0.12), transparent 70%)" }} />

                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-white font-bold text-lg leading-tight">{proj.name}</h3>
                        <p className="text-teal-400/70 text-sm">{proj.tagline}</p>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${
                        proj.status === "Shipped"
                          ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/25"
                          : "text-amber-400 bg-amber-400/10 border border-amber-400/25"
                      }`}>
                        {proj.status}
                      </span>
                    </div>

                    <p className="text-gray-400 text-sm leading-relaxed mb-4">{proj.description}</p>

                    <div className="flex flex-wrap gap-1.5">
                      {proj.stack.map((s) => (
                        <span key={s}
                          className="text-xs text-cyan-400/80 bg-cyan-400/5 border border-cyan-400/15 rounded px-2 py-0.5">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
