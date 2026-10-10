const primary = [
  {
    title: "Built for small businesses",
    description:
      "We work with businesses that serve real communities, not Fortune 500 enterprises. We understand your scale, your budget, and what actually moves the needle.",
  },
  {
    title: "AI-native from day one",
    description:
      "We don't bolt AI on as an afterthought. We design around automation where it earns its keep, and leave it out where it doesn't.",
  },
];

const secondary = [
  {
    title: "Scoped, not padded",
    description: "No retainer for features you don't need. We scope what matters and build that.",
  },
  {
    title: "You own everything",
    description: "Your code, your domain, your data. We document it and hand over the keys whenever you want them.",
  },
  {
    title: "Previews as we go",
    description: "Every change lands on a private preview link first, so you see real progress, not status updates.",
  },
  {
    title: "Still here after launch",
    description: "As your business changes, the site and the systems behind it change with it.",
  },
];

export default function WhyUs() {
  return (
    <section id="why-us" className="py-28 px-4 sm:px-6">
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
