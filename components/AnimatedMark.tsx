/**
 * The mark, flown once: the ring draws, the body fades up, the flyby sweeps
 * round it (accelerating, as it would), and the head lands last. Same geometry
 * as <Logo> (lib/orbit.ts), so the final frame is the primary mark exactly.
 *
 * Used where a moment deserves it — the booking confirmation, the 404.
 * CSS only; under prefers-reduced-motion it renders the finished mark.
 */

import { CX, CY, GEO, TONES, TH_IN, TH_OUT, hyp, ribbon, round, headRFor } from "@/lib/orbit";

const FULL = ribbon(1);
const HEAD_R = headRFor(1);
const t = TONES.bright;

// centreline of the flyby, for the reveal mask
const CENTRE = (() => {
  const N = 90;
  let d = "";
  for (let i = 0; i <= N; i++) {
    const [x, y] = hyp(TH_IN + (TH_OUT - TH_IN) * (i / N));
    d += `${i ? "L" : "M"}${round(x)} ${round(y)}`;
  }
  return d;
})();

export default function AnimatedMark({ size = 96, id = "am", className }: { size?: number; id?: string; className?: string }) {
  const [hx, hy] = [round(FULL.head[0]), round(FULL.head[1])];
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={`animated-mark ${className ?? ""}`} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-g`} x1="0.06" y1="0.04" x2="0.94" y2="0.96">
          <stop offset="0.2" stopColor={t.g1} stopOpacity="0" />
          <stop offset="0.42" stopColor={t.g1} />
          <stop offset="0.76" stopColor={t.g2} />
          <stop offset="1" stopColor={t.g3} />
        </linearGradient>
        <mask id={`${id}-limb`} maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
          <circle cx={CX} cy={CY} r={GEO.rBody} fill="#fff" />
          <circle cx={round(CX + GEO.limb)} cy={round(CY + GEO.limb)} r={GEO.rBody} fill="#000" />
        </mask>
        <mask id={`${id}-clear`} maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
          <rect width="64" height="64" fill="#fff" />
          <path d={FULL.d} fill="#000" stroke="#000" strokeWidth={GEO.clear} />
        </mask>
        <mask id={`${id}-soi`} maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
          <rect width="64" height="64" fill="#fff" />
          <circle cx={GEO.crossX} cy={GEO.crossY} r={GEO.knock} fill="#000" />
        </mask>
        {/* reveals the ribbon along its length, like the craft drawing it */}
        <mask id={`${id}-fly`} maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
          <path className="am-fly" d={CENTRE} pathLength={1} fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="butt" />
        </mask>
      </defs>

      {/* mask on the group, rotation on the circle: the draw starts at the inbound
          crossing without dragging the exit gap round with it */}
      <g mask={`url(#${id}-soi)`}>
        <circle
          className="am-ring" cx={CX} cy={CY} r={GEO.rSoi} pathLength={1}
          fill="none" stroke={t.ring} strokeWidth={GEO.ringW} opacity={t.ringOp}
          transform={`rotate(140 ${CX} ${CY})`}
        />
      </g>
      <g className="am-body" mask={`url(#${id}-clear)`}>
        <circle cx={CX} cy={CY} r={GEO.rBody} fill={t.dark} />
        <circle cx={CX} cy={CY} r={GEO.rBody} fill={t.limb} mask={`url(#${id}-limb)`} opacity="0.95" />
      </g>
      <path d={FULL.d} fill={`url(#${id}-g)`} mask={`url(#${id}-fly)`} />
      <g className="am-head">
        <circle cx={hx} cy={hy} r={GEO.glowR} fill={t.g2} opacity={t.glowOp} />
        <circle cx={hx} cy={hy} r={HEAD_R} fill={t.g3} />
      </g>
    </svg>
  );
}
