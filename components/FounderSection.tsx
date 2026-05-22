"use client";

import { useState, useEffect, useRef } from "react";

/* ── static data ── */
const EXPERIENCE = [
  {
    company: "UCSF Medical Center",
    role: "Full Stack Software Engineer",
    period: "Apr 2024 – Nov 2025",
    badge: "Contract",
    bullets: [
      "Built enterprise reporting portal eliminating 100+ manual monthly reports",
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
  "AI & Agents":    ["CrewAI", "LangChain", "LangGraph", "AutoGen", "OpenAI Agents SDK", "Claude API", "Gemini", "DeepSeek", "LangSmith", "MCP"],
  "Frontend":       ["React", "React Native", "Next.js", "TypeScript", "Tailwind CSS"],
  "Backend":        ["Node.js", "Express", "ASP.NET Core", "Python", "Flask"],
  "Databases":      ["PostgreSQL", "MySQL", "MS SQL", "Firebase", "Redis"],
  "DevOps & Tools": ["Docker", "GitHub", "Playwright", "BullMQ", "Prisma", "NextAuth"],
};

const PROJECTS = [
  {
    name: "ResumeHero",
    tagline: "Agentic resume builder",
    description:
      "Production-grade multi-agent system with multi-LLM routing (Claude / Gemini / DeepSeek), Playwright job scraping, and full LangSmith observability.",
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

/* ── deterministic star particles ── */
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  angle: (i / 28) * 360,
  dist: `${90 + (i % 6) * 28}px`,
  size: 1 + (i % 3) * 0.8,
  delay: `${(i % 5) * 40}ms`,
  dur: `${500 + (i % 4) * 120}ms`,
  color: i % 4 === 0 ? "#67e8f9" : i % 4 === 1 ? "#2dd4bf" : i % 4 === 2 ? "#818cf8" : "#34d399",
}));

const RING_COLORS = [
  "rgba(20,184,166,0.65)",
  "rgba(6,182,212,0.55)",
  "rgba(99,102,241,0.45)",
  "rgba(16,185,129,0.5)",
  "rgba(56,189,248,0.4)",
];

type Tab = "Experience" | "Skills" | "Projects";

export default function FounderSection() {
  const [state, setState] = useState<"idle" | "exploding" | "open">("idle");
  const [tab, setTab] = useState<Tab>("Experience");
  const [tabKey, setTabKey] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const handleExpand = () => {
    if (state !== "idle") return;
    setState("exploding");
    setTimeout(() => setState("open"), 860);
  };

  useEffect(() => {
    const handler = () => {
      if (state !== "idle") return;
      setState("exploding");
      setTimeout(() => {
        setState("open");
        setTimeout(() => {
          sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      }, 860);
    };
    window.addEventListener("open-founder", handler);
    return () => window.removeEventListener("open-founder", handler);
  }, [state]);

  const handleCollapse = () => setState("idle");

  const switchTab = (t: Tab) => { setTab(t); setTabKey((k) => k + 1); };

  return (
    <section ref={sectionRef} id="founder" className="relative overflow-hidden">

      {/* ── COLLAPSED: subtle section divider ── */}
      {state !== "open" && (
        <div className="relative bg-navy-950 py-14 flex flex-col items-center justify-center overflow-hidden">

          {/* Faint horizontal rule that "parts" around the nucleus */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center pointer-events-none px-6">
            <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(82,183,136,0.15))" }} />
            <div className="w-32" /> {/* gap for nucleus */}
            <div className="flex-1 h-px" style={{ background: "linear-gradient(270deg, transparent, rgba(82,183,136,0.15))" }} />
          </div>

          {/* Explosion FX */}
          {state === "exploding" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="animate-flash absolute inset-0"
                style={{ background: "radial-gradient(ellipse at center, rgba(20,184,166,0.22) 0%, transparent 65%)" }} />
              {RING_COLORS.map((color, i) => (
                <div key={i} className="animate-explode-ring absolute rounded-full"
                  style={{ width: 100, height: 100, border: `1.5px solid ${color}`,
                    animationDelay: `${i * 55}ms`, filter: "blur(1px)" }} />
              ))}
              <div className="animate-explode-core absolute rounded-full"
                style={{ width: 70, height: 70,
                  background: "radial-gradient(circle, rgba(20,184,166,0.85) 0%, rgba(6,182,212,0.4) 55%, transparent 75%)",
                  filter: "blur(7px)" }} />
              {/* Star particles */}
              {PARTICLES.map((p, i) => (
                <div key={i} className="animate-particle absolute rounded-full"
                  style={{
                    width: p.size, height: p.size,
                    background: p.color,
                    boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
                    ["--angle" as string]: `${p.angle}deg`,
                    ["--dist" as string]: p.dist,
                    ["--dur" as string]: p.dur,
                    animationDelay: p.delay,
                  } as React.CSSProperties} />
              ))}
            </div>
          )}

          {/* Nucleus button */}
          <button
            onClick={handleExpand}
            disabled={state === "exploding"}
            className="relative z-10 group flex flex-col items-center gap-3 focus:outline-none"
            aria-label="Meet the founder"
          >
            {/* Orbital ring */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-[88px] h-[88px] rounded-full border border-teal-500/15 group-hover:border-teal-500/35 transition-colors duration-300" />
              {/* Orbit particle 1 */}
              <div className="absolute w-[88px] h-[88px] flex items-center justify-center">
                <div className="animate-orbit w-1.5 h-1.5 rounded-full"
                  style={{ background: "rgba(20,184,166,0.9)", boxShadow: "0 0 5px rgba(20,184,166,1)" }} />
              </div>
              {/* Orbit particle 2 */}
              <div className="absolute w-[88px] h-[88px] flex items-center justify-center">
                <div className="animate-orbit-reverse w-1 h-1 rounded-full"
                  style={{ background: "rgba(6,182,212,0.9)", boxShadow: "0 0 4px rgba(6,182,212,1)", animationDelay: "-1.5s" }} />
              </div>
              {/* Core */}
              <div
                className="animate-nucleus-pulse relative w-[56px] h-[56px] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                style={{
                  background: "radial-gradient(circle at 35% 35%, rgba(56,189,248,0.85), rgba(20,184,166,0.65) 50%, rgba(99,102,241,0.45) 100%)",
                  boxShadow: "0 0 22px rgba(20,184,166,0.35), inset 0 0 14px rgba(255,255,255,0.08)",
                }}
              >
                <svg className="w-5 h-5 text-white/85" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>

            {/* Label */}
            <span className="text-[11px] font-medium tracking-[0.18em] uppercase text-gray-600 group-hover:text-teal-500/80 transition-colors duration-200">
              Meet the Founder
            </span>
          </button>
        </div>
      )}

      {/* ── EXPANDED: tabbed nebula panel ── */}
      {state === "open" && (
        <div className="animate-section-unfurl relative overflow-hidden" style={{ background: "#020c1c" }}>

          {/* Nebula orbs */}
          <div className="nebula-orb-1 absolute top-[-8%] left-[-6%] w-[50vw] h-[50vw] max-w-[650px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(20,184,166,0.2) 0%, transparent 70%)", filter: "blur(70px)" }} />
          <div className="nebula-orb-2 absolute top-[25%] right-[-4%] w-[40vw] h-[40vw] max-w-[520px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(6,182,212,0.16) 0%, transparent 70%)", filter: "blur(80px)" }} />
          <div className="nebula-orb-3 absolute bottom-[5%] left-[18%] w-[35vw] h-[35vw] max-w-[440px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)", filter: "blur(60px)" }} />
          <div className="nebula-orb-5 absolute bottom-[-5%] right-[12%] w-[28vw] h-[28vw] max-w-[360px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(16,185,129,0.13) 0%, transparent 70%)", filter: "blur(65px)" }} />

          {/* Stars */}
          {[[8,12],[22,35],[78,18],[91,55],[65,80],[14,70],[47,25],[55,90],[82,42],[38,8],
            [70,65],[5,88],[93,30],[30,75],[60,15],[18,50],[85,85],[44,45],[12,95],[76,5]
          ].map(([x, y], i) => (
            <div key={i} className="absolute rounded-full bg-white pointer-events-none"
              style={{ left:`${x}%`, top:`${y}%`, width:"1.5px", height:"1.5px", opacity:0.35,
                animation:`star-twinkle ${2+(i%4)*0.7}s ease-in-out infinite`,
                animationDelay:`${(i*0.3)%3}s` }} />
          ))}

          {/* Shimmer top edge */}
          <div className="absolute top-0 left-0 right-0 h-[1px] overflow-hidden">
            <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-teal-400/60 to-transparent"
              style={{ animation: "shimmer-line 3s ease-in-out infinite" }} />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">

            {/* Header row */}
            <div className="flex items-start justify-between gap-4 mb-8 animate-fade-slide-up">
              <div>
                <div className="inline-flex items-center gap-2 border border-teal-500/30 bg-teal-500/10 rounded-full px-3 py-1 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                  <span className="text-teal-400 text-xs font-medium tracking-widest uppercase">About the Founder</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-1"
                  style={{ background: "linear-gradient(135deg, #2DD4BF 0%, #67E8F9 55%, #a5f3fc 100%)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Dennis Livshyts
                </h2>
                <p className="text-gray-300 font-light">Full Stack Engineer &amp; Agentic AI Builder</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {["BS CS · CSULB", "San Francisco", "3+ Yrs Exp", "AI / Agentic Eng"].map((tag) => (
                    <span key={tag} className="text-xs text-gray-400 border border-white/10 bg-white/5 rounded-full px-3 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <button onClick={handleCollapse}
                className="flex-shrink-0 flex items-center gap-1.5 text-xs text-gray-600 hover:text-teal-400 border border-white/8 hover:border-teal-500/30 bg-white/3 hover:bg-teal-500/8 rounded-full px-3 py-1.5 transition-all duration-200 mt-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Close
              </button>
            </div>

            {/* Divider */}
            <div className="w-full h-px mb-7 animate-fade-slide-up"
              style={{ background: "linear-gradient(90deg, transparent, rgba(20,184,166,0.4), transparent)", animationDelay: "0.1s" }} />

            {/* Tabs */}
            <div className="flex gap-1 mb-8 animate-fade-slide-up" style={{ animationDelay: "0.15s" }}>
              {(["Experience", "Skills", "Projects"] as Tab[]).map((t) => (
                <button key={t} onClick={() => switchTab(t)}
                  className={`relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    tab === t
                      ? "text-teal-300 bg-teal-500/10 border border-teal-500/30"
                      : "text-gray-400 hover:text-gray-200 border border-transparent hover:border-white/10"
                  }`}>
                  {t}
                  {tab === t && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-teal-400 rounded-full" />}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div key={tabKey} className="animate-fade-slide-up" style={{ animationDelay: "0.05s" }}>

              {/* EXPERIENCE */}
              {tab === "Experience" && (
                <div className="relative">
                  <div className="absolute left-[7px] top-3 bottom-3 w-px"
                    style={{ background: "linear-gradient(180deg, rgba(20,184,166,0.6), rgba(20,184,166,0.08))" }} />
                  <div className="space-y-8">
                    {EXPERIENCE.map((job, i) => (
                      <div key={job.company} className="relative pl-8 animate-fade-slide-up"
                        style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-teal-400 bg-[#020c1c]"
                          style={{ boxShadow: "0 0 8px rgba(20,184,166,0.6)" }} />
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-white font-semibold">{job.company}</h3>
                          <span className="text-xs border border-teal-500/30 bg-teal-500/10 text-teal-400 rounded-full px-2 py-0.5">{job.badge}</span>
                        </div>
                        <p className="text-teal-300/80 text-sm font-medium mb-0.5">{job.role}</p>
                        <p className="text-gray-500 text-xs mb-3">{job.period}</p>
                        <ul className="space-y-1.5 mb-3">
                          {job.bullets.map((b) => (
                            <li key={b} className="flex items-start gap-2 text-sm text-gray-400">
                              <span className="mt-1.5 w-1 h-1 rounded-full bg-teal-500/60 flex-shrink-0" />
                              {b}
                            </li>
                          ))}
                        </ul>
                        <div className="flex flex-wrap gap-1.5">
                          {job.stack.map((s) => (
                            <span key={s} className="text-xs text-cyan-400/80 bg-cyan-400/5 border border-cyan-400/15 rounded px-2 py-0.5">{s}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                    {/* Education */}
                    <div className="relative pl-8 animate-fade-slide-up" style={{ animationDelay: "0.3s" }}>
                      <div className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-indigo-400 bg-[#020c1c]"
                        style={{ boxShadow: "0 0 8px rgba(99,102,241,0.55)" }} />
                      <h3 className="text-white font-semibold">Cal State Long Beach</h3>
                      <p className="text-indigo-300/80 text-sm font-medium mb-0.5">B.S. Computer Science</p>
                      <p className="text-gray-500 text-xs">2018 – 2022</p>
                    </div>
                  </div>
                </div>
              )}

              {/* SKILLS */}
              {tab === "Skills" && (
                <div className="space-y-6">
                  {Object.entries(SKILLS).map(([category, skills], ci) => (
                    <div key={category} className="animate-fade-slide-up" style={{ animationDelay: `${ci * 0.08}s` }}>
                      <p className="text-xs font-semibold tracking-widest uppercase text-teal-500/70 mb-3">{category}</p>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <span key={skill}
                            className="text-sm text-gray-300 border border-white/10 bg-white/5 rounded-lg px-3 py-1.5 cursor-default transition-all duration-200 hover:border-teal-400/50 hover:text-teal-300"
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
                      style={{ background: "rgba(255,255,255,0.03)", animationDelay: `${i * 0.1}s` }}
                      onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 30px rgba(20,184,166,0.1), inset 0 0 30px rgba(20,184,166,0.03)")}
                      onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}>
                      <div className="absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{ background: "radial-gradient(circle at top right, rgba(20,184,166,0.14), transparent 70%)" }} />
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-white font-bold text-lg">{proj.name}</h3>
                          <p className="text-teal-400/70 text-sm">{proj.tagline}</p>
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${
                          proj.status === "Shipped"
                            ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/25"
                            : "text-amber-400 bg-amber-400/10 border border-amber-400/25"
                        }`}>{proj.status}</span>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed mb-4">{proj.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {proj.stack.map((s) => (
                          <span key={s} className="text-xs text-cyan-400/80 bg-cyan-400/5 border border-cyan-400/15 rounded px-2 py-0.5">{s}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
