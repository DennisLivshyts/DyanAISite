const services = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "Custom Website Design & Development",
    description:
      "Professional, fast-loading websites built to convert visitors into customers. Mobile-first, SEO-ready, and tailored to your brand — no templates, no shortcuts.",
    features: ["Custom design", "Mobile optimized", "SEO foundations", "Fast turnaround"],
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
    title: "AI Marketing Agents",
    description:
      "Autonomous agents that run your marketing around the clock — generating content, scheduling posts, following up on leads, and nurturing customer relationships automatically.",
    features: ["24/7 automation", "Content generation", "Lead nurturing", "Multi-channel"],
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: "AI Booking & Outreach Agents",
    description:
      "Intelligent agents that handle appointment scheduling, customer follow-ups, and cold outreach — reaching the right people at the right time, without you lifting a finger.",
    features: ["Automated booking", "Smart follow-ups", "Cold outreach", "CRM integration"],
  },
];

export default function Services() {
  return (
    <section id="services" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-green-500 text-sm font-semibold tracking-widest uppercase mb-3">
            What We Do
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Everything Your Business Needs
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            From your digital storefront to intelligent back-office agents — we
            build the full stack of modern business infrastructure.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((s) => (
            <div
              key={s.title}
              className="card-hover bg-navy-800 border border-navy-700 rounded-2xl p-8 flex flex-col gap-6"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-green-700/20 border border-green-600/20 flex items-center justify-center text-green-400">
                {s.icon}
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">{s.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{s.description}</p>
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-2 mt-auto">
                {s.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
