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
    <section id="how-it-works" className="py-28 px-6 bg-navy-950">
      <div className="max-w-5xl mx-auto">

        {/* Header — left-aligned */}
        <div className="mb-24">
          <span className="font-space-mono text-[11px] tracking-[0.35em] text-teal-500 uppercase">
            The Process
          </span>
          <h2 className="font-syne text-4xl md:text-5xl font-bold text-white mt-4 leading-tight">
            How We Work
          </h2>
        </div>

        {/* Vertical timeline — schematic style */}
        <div className="relative">
          {/* Left rail gradient line */}
          <div
            className="absolute top-4 bottom-4 hidden md:block"
            style={{
              left: "27px",
              width: "1px",
              background: "linear-gradient(180deg, rgba(45,212,191,0.6) 0%, rgba(45,212,191,0.1) 100%)",
            }}
          />

          <div className="space-y-0">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className="relative grid md:grid-cols-[56px_1fr] gap-6 md:gap-12"
                style={{ paddingBottom: i < steps.length - 1 ? "4rem" : 0 }}
              >
                {/* Step marker — square, not circle */}
                <div className="relative z-10 flex-shrink-0">
                  <div
                    className="w-14 h-14 border border-teal-500/35 bg-navy-950 flex items-center justify-center"
                    style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}
                  >
                    <span className="font-space-mono text-teal-400 text-sm font-bold">{step.number}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="pt-3 pb-2">
                  <h3 className="font-syne text-xl md:text-2xl font-bold text-white mb-4 leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed max-w-xl">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
