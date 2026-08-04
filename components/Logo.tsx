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
 * Standalone assets in /public/brand are generated from this same math — if you
 * change a constant here, regenerate them so they don't drift.
 */

type Variant = "primary" | "core" | "compact";
type Tone = "bright" | "deep";

/* ---------------- orbital constants ---------------- */
const P = 20;                      // semi-latus rectum
const E = 1.15;                    // eccentricity — hyperbolic, so it escapes
const PHI = (50 * Math.PI) / 180;  // periapsis bearing
const RSOI = 20;                   // sphere of influence
const ROUT = 25;                   // how far past the ring the exit runs
const RBODY = 8;
const S = 23 / RSOI;               // lands the ring at r23 inside a 64 frame
const CX = 32;
const CY = 32;

const TH_IN = Math.acos((P / RSOI - 1) / E);
const TH_OUT = -Math.acos((P / ROUT - 1) / E);
const TH_CROSS = -TH_IN;           // where the exit crosses the ring

const LIMB = RBODY * 0.62;         // terminator offset — a slim lit crescent
const CLEAR = 1.5;                 // gap where the path crosses in front of the body

const round = (n: number) => Number(n.toFixed(2));

function hyp(th: number): [number, number] {
  const r = P / (1 + E * Math.cos(th));
  return [CX + r * Math.cos(th + PHI) * S, CY + r * Math.sin(th + PHI) * S];
}
const frac = (th: number) => (TH_IN - th) / (TH_IN - TH_OUT);
const width = (f: number, k: number) => (1.3 + 3.1 * Math.pow(f, 1.5)) * k * S;

/**
 * The flyby as a single closed contour: out along the +normal, back along the
 * -normal. It never crosses itself, so one contour is enough and it stays about
 * half the size of a stroked-quad approach.
 */
function ribbon(k: number) {
  const N = 90;
  const pts: [number, number][] = [];
  const ws: number[] = [];
  for (let i = 0; i <= N; i++) {
    pts.push(hyp(TH_IN + (TH_OUT - TH_IN) * (i / N)));
    ws.push(width(i / N, k));
  }
  const normal = (i: number): [number, number] => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(N, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const L = Math.hypot(dx, dy) || 1;
    return [-dy / L, dx / L];
  };
  const side = (sign: number) =>
    pts.map((p, i) => {
      const [nx, ny] = normal(i);
      const h = (ws[i] / 2) * sign;
      return [round(p[0] + nx * h), round(p[1] + ny * h)] as [number, number];
    });

  const all = side(1).concat(side(-1).reverse());
  return {
    d: "M" + all.map((p, i) => (i ? "L" : "") + p[0] + " " + p[1]).join("") + "Z",
    head: pts[N],
  };
}

/* computed once at module load */
const FULL = ribbon(1);
const COMPACT = ribbon(1.5);
const CROSS = hyp(TH_CROSS);
const GEO = {
  knock: round(width(frac(TH_CROSS), 1) / 2 + 1.4 * S),
  knockCompact: round(width(frac(TH_CROSS), 1.5) / 2 + 1.4 * S),
  rBody: round(RBODY * S),
  rSoi: round(RSOI * S),
  limb: round(LIMB * S),
  clear: round(CLEAR * S),
  ringW: round(1.5 * S),
  glowR: round(4.4 * S),
  crossX: round(CROSS[0]),
  crossY: round(CROSS[1]),
};

const TONES: Record<Tone, {
  g1: string; g2: string; g3: string;
  dark: string; limb: string; ring: string;
  ringOp: number; glowOp: number;
}> = {
  bright: { g1: "#2DD4BF", g2: "#67E8F9", g3: "#A5F3FC", dark: "#0D3A45", limb: "#2DD4BF", ring: "#2DD4BF", ringOp: 0.45, glowOp: 0.2 },
  deep:   { g1: "#0F766E", g2: "#0E7490", g3: "#0B4A5B", dark: "#CFE0E6", limb: "#0F766E", ring: "#0E7490", ringOp: 0.5,  glowOp: 0.12 },
};

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
  const headR = round(2.3 * (compact ? 1.5 : 1) * S);

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
