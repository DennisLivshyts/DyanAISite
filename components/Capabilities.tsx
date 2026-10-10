import { ABOUT, CAPABILITIES, visibleCases } from "@/content/work";

export default function Capabilities() {
  const shown = new Map(visibleCases().map((c) => [c.slug, c.name]));

  return (
    <section id="capabilities" className="py-28 px-4 sm:px-6 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="mb-20">
          <span className="font-space-mono text-[11px] tracking-[0.35em] text-teal-500 uppercase">
            What We Do
          </span>
          <h2 className="font-syne text-4xl md:text-5xl font-bold text-white mt-4 leading-tight">
            Capabilities
          </h2>
        </div>

        <div>
          {CAPABILITIES.map((cap, i) => {
            const proof = cap.proof.filter((slug) => shown.has(slug));
            return (
              <div
                key={cap.title}
                className="group relative border-t border-white/8 py-12 grid md:grid-cols-[80px_1fr_1fr] gap-6 md:gap-16 items-start hover:bg-teal-500/[0.03] transition-colors duration-300"
                style={i === CAPABILITIES.length - 1 ? { borderBottom: "1px solid rgba(255,255,255,0.08)" } : {}}
              >
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div
                  className="font-space-mono font-bold text-white/10 group-hover:text-teal-400/30 transition-colors duration-300 select-none leading-none"
                  style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>

                <h3 className="pt-1 font-syne text-xl md:text-2xl font-bold text-white group-hover:text-teal-200 transition-colors duration-300 leading-tight">
                  {cap.title}
                </h3>

                <div className="pt-1">
                  <p className="text-gray-400 leading-relaxed text-sm mb-6">{cap.body.text}</p>
                  {proof.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-space-mono text-[10px] tracking-[0.2em] uppercase text-gray-600 mr-1">See</span>
                      {proof.map((slug) => (
                        <a
                          key={slug}
                          href={`#case-${slug}`}
                          className="font-space-mono text-[10px] tracking-[0.15em] uppercase text-teal-500/80 border border-teal-500/25 px-3 py-1 hover:border-teal-400/60 hover:text-teal-300 transition-colors"
                        >
                          {shown.get(slug)}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Who we are — the company, one founder line, no CV */}
        <div className="mt-20 grid md:grid-cols-[80px_1fr] gap-6 md:gap-16">
          <div className="hidden md:block" />
          <div className="max-w-2xl border-l border-teal-500/30 pl-6">
            <div className="font-space-mono text-[10px] tracking-[0.3em] uppercase text-teal-500/80 mb-3">Who we are</div>
            <p className="text-gray-300 leading-relaxed">
              {ABOUT.text} We&apos;re small on purpose: the person on your discovery call is the person who builds it,
              and we only take on work we can see through to launch and past it.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
