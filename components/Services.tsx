const services = [
  {
    number: "01",
    title: "Custom Website Design & Development",
    description:
      "Professional, fast-loading websites built to convert visitors into customers. Mobile-first, SEO-ready, and tailored to your brand — no templates, no shortcuts.",
    features: ["Custom design", "Mobile optimized", "SEO foundations", "Fast turnaround"],
  },
  {
    number: "02",
    title: "AI Marketing Agents",
    description:
      "Autonomous agents that run your marketing around the clock — generating content, scheduling posts, following up on leads, and nurturing customer relationships automatically.",
    features: ["24/7 automation", "Content generation", "Lead nurturing", "Multi-channel"],
  },
  {
    number: "03",
    title: "AI Booking & Outreach Agents",
    description:
      "Intelligent agents that handle appointment scheduling, customer follow-ups, and cold outreach — reaching the right people at the right time, without you lifting a finger.",
    features: ["Automated booking", "Smart follow-ups", "Cold outreach", "CRM integration"],
  },
];

export default function Services() {
  return (
    <section id="services" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header — left-aligned */}
        <div className="mb-20">
          <span className="font-space-mono text-[11px] tracking-[0.35em] text-teal-500 uppercase">
            What We Do
          </span>
          <h2 className="font-syne text-4xl md:text-5xl font-bold text-white mt-4 leading-tight">
            Our Services
          </h2>
        </div>

        {/* Service rows — case-file style */}
        <div>
          {services.map((s, i) => (
            <div
              key={s.number}
              className="group relative border-t border-white/8 py-12 grid md:grid-cols-[80px_1fr_1fr] gap-8 md:gap-16 items-start hover:bg-teal-500/[0.03] transition-colors duration-300 cursor-default"
              style={i === services.length - 1 ? { borderBottom: "1px solid rgba(255,255,255,0.08)" } : {}}
            >
              {/* Left accent bar — appears on hover */}
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Number */}
              <div className="font-space-mono font-bold text-white/10 group-hover:text-teal-400/30 transition-colors duration-300 select-none leading-none"
                style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
                {s.number}
              </div>

              {/* Title */}
              <div className="pt-1">
                <h3 className="font-syne text-xl md:text-2xl font-bold text-white group-hover:text-teal-200 transition-colors duration-300 leading-tight">
                  {s.title}
                </h3>
              </div>

              {/* Description + tags */}
              <div className="pt-1">
                <p className="text-gray-400 leading-relaxed text-sm mb-6">
                  {s.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {s.features.map((f) => (
                    <span
                      key={f}
                      className="font-space-mono text-[10px] tracking-[0.18em] uppercase text-gray-600 border border-white/10 px-3 py-1 group-hover:border-teal-500/30 group-hover:text-teal-500/80 transition-all duration-300"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
