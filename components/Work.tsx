import CaseRail from "./CaseRail";
import { visibleCases } from "@/content/work";

// Server component on purpose: visibleCases() reads VERCEL_ENV at build time,
// so uncleared cases never reach a production bundle at all.
export default function Work() {
  const cases = visibleCases();

  return (
    <section id="work" className="relative py-28 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className="font-space-mono text-[11px] tracking-[0.35em] text-teal-500 uppercase">
            Selected Work
          </span>
          <h2 className="font-syne text-4xl md:text-5xl font-bold text-white mt-4 leading-tight">
            Things we&apos;ve shipped
          </h2>
        </div>
        <p className="font-space-mono text-[10px] tracking-[0.25em] uppercase text-gray-400">
          Drag, swipe or use the arrows · click a card to open it
        </p>
      </div>

      <CaseRail cases={cases} />
    </section>
  );
}
