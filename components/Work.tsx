import Image from "next/image";
import Schematic from "./Schematic";
import { visibleCases, type Case } from "@/content/work";

function DraftRibbon({ c }: { c: Case }) {
  if (c.cleared) return null;
  return (
    <div className="absolute top-0 left-0 right-0 z-20 bg-amber-400/90 text-navy-950 font-space-mono text-[10px] tracking-[0.12em] uppercase px-3 py-1.5">
      Preview only · waiting on {c.waitingOn}
    </div>
  );
}

function Visual({ c }: { c: Case }) {
  const v = c.visual;
  if (v.kind === "schematic") {
    return <Schematic variant={v.variant} className="w-full h-auto block" />;
  }
  return (
    <div className="relative">
      <Image
        src={v.desktop}
        alt={v.alt}
        width={v.size[0]}
        height={v.size[1]}
        sizes="(min-width: 1024px) 640px, 100vw"
        className="w-full h-auto block"
      />
      {v.phone && (
        <Image
          src={v.phone}
          alt=""
          width={390}
          height={844}
          sizes="120px"
          className="hidden sm:block absolute -bottom-10 -right-5 w-[17%] h-auto rounded-xl border border-white/15 shadow-[0_20px_40px_rgba(0,0,0,0.55)]"
        />
      )}
    </div>
  );
}

function CaseBody({ c, compact }: { c: Case; compact?: boolean }) {
  return (
    <div>
      <div className="font-space-mono text-[10px] tracking-[0.25em] uppercase text-teal-500/80 mb-3">
        {c.kicker}
      </div>
      <h3 className={`font-syne font-bold text-white leading-tight mb-2 ${compact ? "text-xl" : "text-2xl md:text-3xl"}`}>
        {c.name}
      </h3>
      <p className={`text-teal-200/90 mb-5 ${compact ? "text-sm" : "text-lg"}`}>{c.headline}</p>
      <ul className="space-y-3 mb-6">
        {c.lines.map((l) => (
          <li key={l.text} className="flex gap-3 text-sm text-gray-400 leading-relaxed">
            <span className="mt-2 w-3 h-px bg-teal-400/60 shrink-0" />
            <span>{l.text}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-2">
        {c.tags.map((t) => (
          <span key={t} className="font-space-mono text-[10px] tracking-[0.15em] uppercase text-gray-500 border border-white/10 px-2.5 py-1">
            {t}
          </span>
        ))}
        {c.link && (
          <a
            href={c.link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group ml-auto font-space-mono text-[11px] tracking-[0.1em] text-teal-400 hover:text-teal-200 transition-colors inline-flex items-center gap-2"
          >
            {c.link.label}
            <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M9 7h8v8" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}

export default function Work() {
  const cases = visibleCases();
  const featured = cases.filter((c) => c.visual.kind === "shots");
  const rest = cases.filter((c) => c.visual.kind !== "shots");

  return (
    <section id="work" className="relative py-28 px-4 sm:px-6 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <span className="font-space-mono text-[11px] tracking-[0.35em] text-teal-500 uppercase">
            Selected Work
          </span>
          <h2 className="font-syne text-4xl md:text-5xl font-bold text-white mt-4 leading-tight">
            Things we&apos;ve shipped
          </h2>
        </div>

        {/* Featured: real screenshots, alternating sides */}
        {featured.length > 0 && <div className="space-y-20 mb-20">
          {featured.map((c, i) => (
            <article
              key={c.slug}
              data-case={c.slug}
              className={`relative grid lg:grid-cols-[1.25fr_1fr] gap-10 lg:gap-14 items-center ${i % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}
            >
              <div className="relative border border-white/10 bg-navy-950 overflow-visible">
                <DraftRibbon c={c} />
                <Visual c={c} />
              </div>
              <CaseBody c={c} />
            </article>
          ))}
        </div>}

        {/* The rest: schematic art in a grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/8 border border-white/8">
          {rest.map((c) => (
            <article key={c.slug} data-case={c.slug} className="relative bg-navy-900 flex flex-col">
              <div className="relative border-b border-white/8">
                <DraftRibbon c={c} />
                <Visual c={c} />
              </div>
              <div className="p-7 flex-1">
                <CaseBody c={c} compact />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
