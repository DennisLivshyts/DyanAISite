import Link from "next/link";
import type { Metadata } from "next";
import Logo from "@/components/Logo";
import { CX, CY, GEO, TONES, TH_IN, TH_OUT, hyp, round } from "@/lib/orbit";

export const metadata: Metadata = {
  title: "Off course — DyanAI Labs",
  robots: { index: false },
};

const t = TONES.bright;

// the course it should have flown: the mark's flyby, dashed
const PLANNED = (() => {
  const N = 60;
  let d = "";
  for (let i = 0; i <= N; i++) {
    const [x, y] = hyp(TH_IN + (TH_OUT - TH_IN) * (i / N));
    d += `${i ? "L" : "M"}${round(x)} ${round(y)}`;
  }
  return d;
})();

// what it actually did: missed the burn and drifted straight past, outside the ring
const DRIFT = "M -8 58 L 76 10";

export default function NotFound() {
  return (
    <main className="relative z-[1] min-h-[100svh] flex flex-col px-4 sm:px-6">
      <header className="max-w-6xl w-full mx-auto py-4">
        <Link href="/" className="inline-flex items-center gap-3" aria-label="DyanAI Labs, home">
          <Logo size={44} decorative className="shrink-0" />
          <span className="text-xl font-bold tracking-tight">
            <span className="text-white">Dyan</span>
            <span className="text-gradient">AI</span>
            <span className="text-white"> Labs</span>
          </span>
        </Link>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center text-center pb-20">
        <svg viewBox="-8 -4 80 72" className="w-[min(78vw,340px)] h-auto mb-10" aria-hidden="true">
          <circle cx={CX} cy={CY} r={GEO.rSoi} fill="none" stroke={t.ring} strokeWidth={GEO.ringW} opacity={t.ringOp} />
          <circle cx={CX} cy={CY} r={GEO.rBody} fill={t.dark} />
          <circle cx={round(CX - GEO.limb * 0.35)} cy={round(CY - GEO.limb * 0.35)} r={GEO.rBody * 0.92} fill={t.limb} opacity="0.12" />
          <path d={PLANNED} fill="none" stroke={t.g2} strokeOpacity="0.35" strokeWidth="0.8" strokeDasharray="1.5 2.2" />
          <path d={DRIFT} fill="none" stroke={t.g3} strokeOpacity="0.12" strokeWidth="0.5" />
          <g>
            <circle r="3.4" fill={t.g2} opacity="0.18" />
            <circle r="1.6" fill={t.g3} />
            <animateMotion dur="11s" repeatCount="indefinite" path={DRIFT} />
          </g>
        </svg>

        <div className="font-space-mono text-[11px] tracking-[0.35em] text-teal-400 uppercase mb-5">
          404 · Off course
        </div>
        <h1 className="font-syne font-bold text-white leading-tight mb-4" style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)" }}>
          This page missed its burn.
        </h1>
        <p className="text-gray-400 max-w-md leading-relaxed mb-10">
          It drifted out of orbit somewhere between the link and here. The rest of the site is right where we left it.
        </p>
        <Link
          href="/"
          className="group font-syne font-bold text-navy-950 bg-teal-400 hover:bg-teal-300 text-sm tracking-wide px-8 py-4 transition-all duration-200 inline-flex items-center gap-3"
          style={{ clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))" }}
        >
          Plot a course home
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </main>
  );
}
