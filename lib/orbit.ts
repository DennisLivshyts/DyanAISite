/**
 * DyanAI Labs — the gravity assist, as numbers.
 *
 * A craft enters a body's sphere of influence, whips around it, and leaves on a
 * steeper course moving faster than it arrived. The curve is a real hyperbola
 * (e = 1.15) with the focus at the body.
 *
 * Single source of truth for the mark: components/Logo.tsx, brand-src/gen-svg.mjs
 * and the scroll scene all build from this module, so they can't drift apart.
 * If you change a constant, regenerate /public/brand (see its README).
 *
 * Pure and DOM-free. Kept to erasable TypeScript so Node can import it directly.
 */

/* ---------------- orbital constants ---------------- */
export const P = 20;                      // semi-latus rectum
export const E = 1.15;                    // eccentricity — hyperbolic, so it escapes
export const PHI = (50 * Math.PI) / 180;  // periapsis bearing
export const RSOI = 20;                   // sphere of influence
export const ROUT = 25;                   // how far past the ring the exit runs
export const RBODY = 8;
export const S = 23 / RSOI;               // lands the ring at r23 inside a 64 frame
export const CX = 32;
export const CY = 32;

export const TH_IN = Math.acos((P / RSOI - 1) / E);
export const TH_OUT = -Math.acos((P / ROUT - 1) / E);
export const TH_CROSS = -TH_IN;           // where the exit crosses the ring

export const LIMB = RBODY * 0.62;         // terminator offset — a slim lit crescent
export const CLEAR = 1.5;                 // gap where the path crosses in front of the body

export const round = (n: number) => Number(n.toFixed(2));

/** Point on the flyby at true anomaly `th`, in 64-frame coordinates. */
export function hyp(th: number): [number, number] {
  const r = P / (1 + E * Math.cos(th));
  return [CX + r * Math.cos(th + PHI) * S, CY + r * Math.sin(th + PHI) * S];
}
/** 0 at the inbound ring crossing, 1 at the end of the exit. */
export const frac = (th: number) => (TH_IN - th) / (TH_IN - TH_OUT);
/** Ribbon width: thin arriving, heavy leaving. */
export const width = (f: number, k: number) => (1.3 + 3.1 * Math.pow(f, 1.5)) * k * S;

/**
 * The flyby as a single closed contour: out along the +normal, back along the
 * -normal. It never crosses itself, so one contour is enough and it stays about
 * half the size of a stroked-quad approach.
 */
export function ribbon(k: number): { d: string; head: [number, number] } {
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

/** Ring gap where the exit punches through, for ribbon weight `k`. */
export const knockFor = (k: number) => round(width(frac(TH_CROSS), k) / 2 + 1.4 * S);
/** Head radius for ribbon weight `k`. */
export const headRFor = (k: number) => round(2.3 * k * S);

const CROSS = hyp(TH_CROSS);
export const GEO = {
  knock: knockFor(1),
  knockCompact: knockFor(1.5),
  rBody: round(RBODY * S),
  rSoi: round(RSOI * S),
  limb: round(LIMB * S),
  clear: round(CLEAR * S),
  ringW: round(1.5 * S),
  bodyStroke: round(1.3 * S),   // mono variants outline the body instead of shading it
  glowR: round(4.4 * S),
  crossX: round(CROSS[0]),
  crossY: round(CROSS[1]),
};

export type Tone = "bright" | "deep";
export type Palette = {
  g1: string; g2: string; g3: string;
  dark: string; limb: string; ring: string;
  ringOp: number; glowOp: number;
};

export const TONES: Record<Tone, Palette> = {
  bright: { g1: "#2DD4BF", g2: "#67E8F9", g3: "#A5F3FC", dark: "#0D3A45", limb: "#2DD4BF", ring: "#2DD4BF", ringOp: 0.45, glowOp: 0.2 },
  deep:   { g1: "#0F766E", g2: "#0E7490", g3: "#0B4A5B", dark: "#CFE0E6", limb: "#0F766E", ring: "#0E7490", ringOp: 0.5,  glowOp: 0.12 },
};
