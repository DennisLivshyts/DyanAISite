/**
 * DyanAI Labs — the gravity assist mark.
 *
 * A craft enters a body's sphere of influence, whips around it, and leaves on a
 * steeper course moving faster than it arrived. The path thickens as it exits
 * and punches back out through the ring.
 *
 * Nothing is drawn by hand: the curve is a real hyperbola (e = 1.15) with the
 * focus at the body, so the bend near periapsis and the way the arms straighten
 * are both correct. Geometry is computed once at module load, not per render.
 *
 * The math lives in lib/orbit.ts, shared with the brand generator and the scroll
 * scene. Change a constant there, then regenerate /public/brand.
 */

import { CX, CY, GEO, TONES, ribbon, round, headRFor, type Tone } from "@/lib/orbit";

type Variant = "primary" | "core" | "compact";

/* computed once at module load */
const FULL = ribbon(1);
const COMPACT = ribbon(1.5);

/**
 * Thresholds are set by eye, not by arithmetic: the crescent and the clearance
 * gap silt up below ~32px, and the ring stops reading as a ring below ~40px.
 */
function autoVariant(size: number): Variant {
  if (size < 32) return "compact";
  if (size < 40) return "core";
  return "primary";
}

export type LogoProps = {
  /** Rendered size in px. Drives the variant unless one is given explicitly. */
  size?: number;
  /** Force a variant instead of letting `size` decide. */
  variant?: Variant;
  /** `deep` is the reversal for white grounds — invoices, print, contracts. */
  tone?: Tone;
  /** Set when the wordmark sits next to it, so screen readers don't hear it twice. */
  decorative?: boolean;
  className?: string;
};

export default function Logo({
  size = 32,
  variant,
  tone = "bright",
  decorative = false,
  className,
}: LogoProps) {
  const v = variant ?? autoVariant(size);
  const t = TONES[tone];
  const showRing = v === "primary";
  const compact = v === "compact";
  const { d, head } = compact ? COMPACT : FULL;
  const headR = headRFor(compact ? 1.5 : 1);

  /* Deterministic so this stays SSR-safe without useId, which would force the
     whole component to be a client component. Instances sharing variant+tone
     share byte-identical defs, so a collision is harmless. */
  const uid = `dl-${v}-${tone}`;

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : "DyanAI Labs"}
    >
      {!decorative && <title>DyanAI Labs</title>}
      <defs>
        <linearGradient id={`${uid}-g`} x1="0.06" y1="0.04" x2="0.94" y2="0.96">
          {/* the trail fades in rather than ending on a hard edge — it came from far away */}
          <stop offset="0.2" stopColor={t.g1} stopOpacity="0" />
          <stop offset="0.42" stopColor={t.g1} />
          <stop offset="0.76" stopColor={t.g2} />
          <stop offset="1" stopColor={t.g3} />
        </linearGradient>

        {!compact && (
          <>
            {/* terminator: the body minus a copy of itself pushed away from the light */}
            <mask id={`${uid}-limb`} maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
              <circle cx={CX} cy={CY} r={GEO.rBody} fill="#fff" />
              <circle cx={round(CX + GEO.limb)} cy={round(CY + GEO.limb)} r={GEO.rBody} fill="#000" />
            </mask>
            {/* clearance, so the flyby reads as passing in front of the body */}
            <mask id={`${uid}-clear`} maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
              <rect width="64" height="64" fill="#fff" />
              <path d={d} fill="#000" stroke="#000" strokeWidth={GEO.clear} />
            </mask>
          </>
        )}

        {showRing && (
          /* gap where the exit punches through the sphere of influence */
          <mask id={`${uid}-soi`} maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
            <rect width="64" height="64" fill="#fff" />
            <circle cx={GEO.crossX} cy={GEO.crossY} r={GEO.knock} fill="#000" />
          </mask>
        )}
      </defs>

      {showRing && (
        <circle
          cx={CX} cy={CY} r={GEO.rSoi}
          fill="none" stroke={t.ring} strokeWidth={GEO.ringW}
          opacity={t.ringOp} mask={`url(#${uid}-soi)`}
        />
      )}

      {compact ? (
        <circle cx={CX} cy={CY} r={GEO.rBody} fill={t.limb} />
      ) : (
        <g mask={`url(#${uid}-clear)`}>
          <circle cx={CX} cy={CY} r={GEO.rBody} fill={t.dark} />
          <circle cx={CX} cy={CY} r={GEO.rBody} fill={t.limb} mask={`url(#${uid}-limb)`} opacity="0.95" />
        </g>
      )}

      {/* the flyby — thin arriving, heavy leaving */}
      <path d={d} fill={`url(#${uid}-g)`} />

      {!compact && (
        <circle cx={round(head[0])} cy={round(head[1])} r={GEO.glowR} fill={t.g2} opacity={t.glowOp} />
      )}
      <circle cx={round(head[0])} cy={round(head[1])} r={headR} fill={t.g3} />
    </svg>
  );
}
