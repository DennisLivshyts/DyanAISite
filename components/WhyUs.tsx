const reasons = [
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
  {
    title: "No Bloat. No BS.",
    description:
      "No retainer contracts for features you don't need. We scope what matters, build fast, and stay lean. You know exactly what you're getting and what it costs.",
  },
  {
    title: "You Own Everything",
    description:
      "Your website, your agents, your data. We hand over full ownership and documentation — no lock-in, no proprietary black boxes.",
  },
  {
    title: "Fast Delivery",
    description:
      "Most websites launch in 2–3 weeks. AI agents are deployed in under a month. We respect your time and move with urgency.",
  },
  {
    title: "Ongoing Partnership",
    description:
      "We're available after launch. As your business evolves, we evolve with you — updating, optimizing, and expanding your systems on demand.",
  },
];

export default function WhyUs() {
  return (
    <section id="why-us" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-green-500 text-sm font-semibold tracking-widest uppercase mb-3">
            Why DyanAI Labs
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            We Build Like It's Our Own Business
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Because we've been operators too. We know what it means to need
            results without wasting money on fluff.
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((r) => (
            <div
              key={r.title}
              className="bg-navy-800/50 border border-navy-700 rounded-xl p-6 hover:border-green-600/30 transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-green-500 mb-4" />
              <h3 className="text-white font-semibold mb-2">{r.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{r.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
