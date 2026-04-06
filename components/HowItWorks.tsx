const steps = [
  {
    number: "01",
    title: "Discovery Call",
    description:
      "We learn your business, your goals, and where you're losing time or revenue. No jargon, no sales pitch — just an honest conversation about what you actually need.",
  },
  {
    number: "02",
    title: "Build & Integrate",
    description:
      "We design and build your website and/or AI agents, customized for your business. You'll see progress fast — most projects launch within weeks, not months.",
  },
  {
    number: "03",
    title: "Launch & Optimize",
    description:
      "We go live, monitor performance, and tune your systems as you grow. You get a partner who stays engaged — not an agency that disappears after delivery.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-navy-950">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-green-500 text-sm font-semibold tracking-widest uppercase mb-3">
            The Process
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple. Fast. Done Right.
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            We keep things straightforward — no bloated projects, no endless
            back-and-forth. Here's how we work.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-8 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-transparent via-green-600/30 to-transparent" />

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center text-center gap-4">
                {/* Number badge */}
                <div className="w-16 h-16 rounded-full border border-green-600/40 bg-green-700/10 flex items-center justify-center text-green-400 font-mono font-bold text-lg z-10">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
