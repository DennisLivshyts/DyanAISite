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

/* ---------------- the flight (scroll scene) ----------------
 * The mark only shows the flyby from the ring inward (TH_IN) to the exit
 * (TH_OUT). The scroll scene flies the whole thing, starting further out on
 * the same hyperbola so the craft arrives from off-screen.
 */

export const RFAR = 3 * RSOI;   // far enough out that the craft can enter from the top-left of the hero
export const TH_FAR = Math.acos((P / RFAR - 1) / E);   // ≈ 2.19 rad

/** Semi-major axis of the hyperbola (negative a convention avoided: a > 0 here). */
const A = P / (E * E - 1);

/** Orbital speed at true anomaly th, normalised so the inbound ring crossing is 1.00. */
export function speed(th: number): number {
  const r = (t: number) => P / (1 + E * Math.cos(t));
  const v = (t: number) => Math.sqrt(2 / r(t) + 1 / A);  // vis-viva for a hyperbola, μ = 1
  return v(th) / v(TH_IN);
}

/** Distance from the body, in ring radii (1 = on the ring). */
export const range = (th: number) => P / (1 + E * Math.cos(th)) / RSOI;

/**
 * Point on the flight in 3D world units: body at the origin, y up (SVG is y
 * down), the orbital plane is z = 0. Same scale as the 64-unit mark.
 */
export function world(th: number): [number, number] {
  const [x, y] = hyp(th);
  return [x - CX, -(y - CY)];
}

/**
 * Scroll progress u ∈ [0,1] → true anomaly, TH_FAR → TH_OUT.
 *
 * Pure time (Kepler) whips past periapsis too fast for a section to sit on;
 * pure arc length loses the acceleration that makes it a gravity assist. A
 * 50/50 blend keeps both. Built once as a lookup table, inverted by search.
 */
export const thetaAt = (() => {
  const N = 1024;
  const ths: number[] = [];
  const time: number[] = [];
  const arc: number[] = [];
  // hyperbolic mean anomaly M = e·sinh(H) − H, with tanh(H/2) = sqrt((e−1)/(e+1))·tan(θ/2)
  const M = (th: number) => {
    const H = 2 * Math.atanh(Math.sqrt((E - 1) / (E + 1)) * Math.tan(th / 2));
    return E * Math.sinh(H) - H;
  };
  let s = 0;
  let prev = world(TH_FAR);
  for (let i = 0; i <= N; i++) {
    const th = TH_FAR + (TH_OUT - TH_FAR) * (i / N);
    const p = world(th);
    s += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
    prev = p;
    ths.push(th);
    time.push(-M(th));   // θ decreases along the flight, so −M increases
    arc.push(s);
  }
  const norm = (a: number[]) => a.map((v) => (v - a[0]) / (a[N] - a[0]));
  const t = norm(time);
  const l = norm(arc);
  const blend = t.map((v, i) => 0.5 * v + 0.5 * l[i]);
  return (u: number) => {
    const x = Math.min(1, Math.max(0, u));
    let lo = 0, hi = N;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (blend[mid] < x) lo = mid; else hi = mid;
    }
    const f = (x - blend[lo]) / (blend[hi] - blend[lo] || 1);
    return ths[lo] + (ths[hi] - ths[lo]) * f;
  };
})();

/** Inverse of thetaAt: flight position (0..1) at true anomaly th. */
export function flightAt(th: number): number {
  let lo = 0, hi = 1;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (thetaAt(mid) > th) lo = mid; else hi = mid;   // thetaAt decreases along the flight
  }
  return (lo + hi) / 2;
}

/** True anomaly where the flight is called "periapsis" rather than capture/exit. */
const PERI_BAND = 0.35;
export const TH_PROCESS = -0.8;   // mid-exit, where the Process section sits

/** Flight position of each phase anchor — the page pins sections to these. */
export const FLIGHT = {
  approach: 0,
  ringIn: flightAt(TH_IN),
  periapsis: flightAt(0),
  process: flightAt(TH_PROCESS),
  ringOut: flightAt(TH_CROSS),
  resolve: 1,
};

export type Phase = "Approach" | "Capture" | "Periapsis" | "Exit" | "Escape";
export function phaseAt(th: number): Phase {
  if (th > TH_IN) return "Approach";
  if (th > PERI_BAND) return "Capture";
  if (th > -PERI_BAND) return "Periapsis";
  if (th > TH_CROSS) return "Exit";
  return "Escape";
}

/* ── keyframes ──────────────────────────────────────────────────────────────
 * One per page section (the scroll director pins each section to its `th`).
 * x/y: where the body sits, as fractions of the viewport (0,0 top-left).
 * size: ring radius as a fraction of the viewport's shorter side.
 * dim: canvas opacity, lowered behind full-width text.
 */
export type Key = { th: number; x: number; y: number; size: number; tiltX: number; tiltY: number; rotZ: number; dim: number };

export const KEYS_DESKTOP: Key[] = [
  // Hero: the craft comes in from the top-left, heading ~22° down-right toward the
  // planet low on the right — the launch arcs over into exactly that heading
  // (see approachHeading and OrbitMount's launch)
  { th: TH_FAR,     x: 0.78, y: 0.40, size: 0.22, tiltX: -1.00, tiltY: 0.30, rotZ: 0.00,  dim: 1.00 },
  { th: TH_IN,      x: 0.90, y: 0.56, size: 0.24, tiltX: -0.70, tiltY: 0.22, rotZ: -0.30, dim: 0.35 }, // Capabilities: through the ring, in the margin
  { th: 0,          x: 0.80, y: 0.30, size: 0.26, tiltX: -0.45, tiltY: 0.12, rotZ: 0.10, dim: 1.00 }, // Work: the whip, above the rail
  { th: TH_PROCESS, x: 0.78, y: 0.52, size: 0.32, tiltX: -0.25, tiltY: 0.06, rotZ: 0.06, dim: 0.95 }, // Process: climbing out
  { th: TH_CROSS,   x: 0.76, y: 0.40, size: 0.26, tiltX: -0.12, tiltY: 0.03, rotZ: 0.03, dim: 1.00 }, // Contact: the punch-through, beside the heading
  { th: TH_OUT,     x: 0.50, y: 0.36, size: 0.22, tiltX: 0.00,  tiltY: 0.00, rotZ: 0.00, dim: 1.00 }, // Sign-off: the mark
];

export const KEYS_MOBILE: Key[] = [
  { th: TH_FAR,     x: 0.83, y: 0.22, size: 0.16, tiltX: -1.00, tiltY: 0.25, rotZ: -0.15, dim: 0.90 }, // small planet top-right, craft in from the top-left
  { th: TH_IN,      x: 0.78, y: 0.20, size: 0.34, tiltX: -0.70, tiltY: 0.18, rotZ: 0.05,  dim: 0.45 },
  { th: 0,          x: 0.86, y: 0.07, size: 0.26, tiltX: -0.45, tiltY: 0.10, rotZ: 0.08, dim: 0.70 }, // Work: tucked in the top-right corner, clear of the heading
  { th: TH_PROCESS, x: 0.76, y: 0.18, size: 0.32, tiltX: -0.25, tiltY: 0.05, rotZ: 0.05, dim: 0.45 },
  { th: TH_CROSS,   x: 0.74, y: 0.18, size: 0.32, tiltX: -0.12, tiltY: 0.03, rotZ: 0.03, dim: 0.60 },
  { th: TH_OUT,     x: 0.50, y: 0.36, size: 0.34, tiltX: 0.00,  tiltY: 0.00, rotZ: 0.00, dim: 1.00 },
];

/** The scene's camera: perspective, looking down −z at the orbital plane. */
export const CAMERA = { fov: 32, z: 400 };

/**
 * Where the craft sits on screen at the very start of the flight, in CSS px —
 * the same transform the scene applies, done by hand so the launch screen can
 * aim for it without loading three.js. Keep in step with scene.ts render().
 */
export function approachScreen(w: number, h: number, mobile: boolean, s = 0): { x: number; y: number } {
  const k = (mobile ? KEYS_MOBILE : KEYS_DESKTOP)[0];
  const tanH = Math.tan((CAMERA.fov * Math.PI) / 360);
  const pxPerUnit = h / (2 * CAMERA.z * tanH);
  const scale = (k.size * Math.min(w, h)) / pxPerUnit / (RSOI * S);
  const [hx, hy] = world(thetaAt(s));
  // three's Euler "XYZ": R = Rx · Ry · Rz, applied to the scaled point
  let x = hx * scale, y = hy * scale, z = 0;
  const cz = Math.cos(k.rotZ), sz = Math.sin(k.rotZ);
  [x, y] = [x * cz - y * sz, x * sz + y * cz];
  const cy = Math.cos(k.tiltY), sy = Math.sin(k.tiltY);
  [x, z] = [x * cy + z * sy, -x * sy + z * cy];
  const cx = Math.cos(k.tiltX), sx = Math.sin(k.tiltX);
  [y, z] = [y * cx - z * sx, y * sx + z * cx];
  x += (k.x - 0.5) * w / pxPerUnit;
  y += -(k.y - 0.5) * h / pxPerUnit;
  const depth = CAMERA.z - z;
  const ndcX = x / (depth * tanH * (w / h));
  const ndcY = y / (depth * tanH);
  return { x: (ndcX * 0.5 + 0.5) * w, y: (1 - (ndcY * 0.5 + 0.5)) * h };
}

/** Screen heading (radians, 0 = right, +y down) the craft is travelling at the start of the flight. */
export function approachHeading(w: number, h: number, mobile: boolean): number {
  const a = approachScreen(w, h, mobile, 0);
  const b = approachScreen(w, h, mobile, 0.004);
  return Math.atan2(b.y - a.y, b.x - a.x);
}

/**
 * The mark's gradient runs across the ribbon's bounding box (SVG
 * objectBoundingBox, x1 .06 y1 .04 → x2 .94 y2 .96). gradT gives the same
 * 0..1 coordinate for any world point, so the 3D ribbon can reproduce it.
 */
export const gradT = (() => {
  const xs: number[] = [];
  const ys: number[] = [];
  const { d } = ribbon(1);
  for (const m of Array.from(d.matchAll(/[ML]([-\d.]+) ([-\d.]+)/g))) {
    xs.push(+m[1]);
    ys.push(+m[2]);
  }
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const y0 = Math.min(...ys), y1 = Math.max(...ys);
  const gx = 0.94 - 0.06, gy = 0.96 - 0.04;
  return (wx: number, wy: number) => {
    const u = (wx + CX - x0) / (x1 - x0);       // back to SVG coords, then bbox-normalised
    const v = (-wy + CY - y0) / (y1 - y0);
    return ((u - 0.06) * gx + (v - 0.04) * gy) / (gx * gx + gy * gy);
  };
})();

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
