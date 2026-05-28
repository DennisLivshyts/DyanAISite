const primary = [
  {
    title: "Built for Local Businesses",
    description:
      "We specialize in businesses that serve real communities — not Fortune 500 enterprises. We understand your scale, your budget, and what actually moves the needle.",
  },
  {
    title: "AI-Native from Day One",
    description:
      "We don't bolt AI on as an afterthought. Every solution we build is designed around intelligent automation — so your systems work harder as your business grows.",
  },
];

const secondary = [
  {
    title: "No Bloat. No BS.",
    description: "No retainer contracts for features you don't need. We scope what matters, build fast, and stay lean.",
  },
  {
    title: "You Own Everything",
    description: "Your website, your agents, your data. Full ownership and documentation — no lock-in.",
  },
  {
    title: "Fast Delivery",
    description: "Most websites launch in 2–3 weeks. AI agents deployed in under a month.",
  },
  {
    title: "Ongoing Partnership",
    description: "We're available after launch. As your business evolves, we evolve with you.",
  },
];

export default function WhyUs() {
  return (
    <section id="why-us" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header — left-aligned */}
        <div className="mb-20">
          <span className="font-space-mono text-[11px] tracking-[0.35em] text-teal-500 uppercase">
            Why DyanAI Labs
          </span>
          <h2 className="font-syne text-4xl md:text-5xl font-bold text-white mt-4 leading-tight">
            We Build Like It's<br className="hidden md:block" /> Our Own Business
          </h2>
        </div>

        {/* Primary two — larger blocks */}
        <div className="grid md:grid-cols-2 gap-px bg-white/8 mb-px">
          {primary.map((r) => (
            <div
              key={r.title}
              className="group bg-navy-900 hover:bg-[#0c1d38] transition-colors duration-300 p-10 md:p-14"
            >
              <div className="w-8 h-px bg-teal-400 mb-8 group-hover:w-14 transition-all duration-300" />
              <h3 className="font-syne text-2xl md:text-3xl font-bold text-white mb-5 group-hover:text-teal-200 transition-colors duration-300 leading-tight">
                {r.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {r.description}
              </p>
            </div>
          ))}
        </div>

        {/* Secondary four — compact, tight grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/8">
          {secondary.map((r) => (
            <div
              key={r.title}
              className="group bg-navy-900 hover:bg-[#0c1d38] transition-colors duration-300 p-8"
            >
              <div className="w-5 h-px bg-teal-400/50 mb-6 group-hover:w-8 group-hover:bg-teal-400 transition-all duration-300" />
              <h3 className="font-syne text-lg font-bold text-white mb-3 group-hover:text-teal-200 transition-colors duration-300 leading-snug">
                {r.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {r.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
