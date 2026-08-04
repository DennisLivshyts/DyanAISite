/**
 * DyanAI Labs — gravity assist mark.
 * Emits every variant as a standalone SVG in absolute 64-unit coordinates.
 *   node gen-brand.mjs <outDir>
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = process.argv[2];
if (!OUT) { console.error("usage: node gen-brand.mjs <outDir>"); process.exit(1); }
mkdirSync(OUT, { recursive: true });

/* ---------------- orbital constants ---------------- */
const P = 20;                       // semi-latus rectum
const E = 1.15;                     // eccentricity — hyperbolic, so it escapes
const PHI = (50 * Math.PI) / 180;   // periapsis bearing
const RSOI = 20;                    // sphere of influence
const ROUT = 25;                    // how far past the ring the exit runs
const RBODY = 8;
const S = 23 / RSOI;                // lands the ring at r23 inside a 64 frame
const CX = 32, CY = 32;

const TH_IN = Math.acos((P / RSOI - 1) / E);
const TH_OUT = -Math.acos((P / ROUT - 1) / E);
const TH_CROSS = -TH_IN;

const LIMB = RBODY * 0.62;          // terminator offset — a slim lit crescent
const CLEAR = 1.5;                  // gap where the path crosses in front of the body

const r2 = (n) => Number(n.toFixed(2));

function hyp(th) {
  const r = P / (1 + E * Math.cos(th));
  return [CX + r * Math.cos(th + PHI) * S, CY + r * Math.sin(th + PHI) * S];
}
const frac = (th) => (TH_IN - th) / (TH_IN - TH_OUT);
const width = (f, k) => (1.3 + 3.1 * Math.pow(f, 1.5)) * k * S;

/** the flyby as one closed contour: out along +normal, back along -normal */
function ribbon(k) {
  const N = 90, pts = [], ws = [];
  for (let i = 0; i <= N; i++) { pts.push(hyp(TH_IN + (TH_OUT - TH_IN) * i / N)); ws.push(width(i / N, k)); }
  const nrm = (i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    return [-dy / L, dx / L];
  };
  const side = (s) => pts.map((p, i) => {
    const n = nrm(i), h = ws[i] / 2 * s;
    return [r2(p[0] + n[0] * h), r2(p[1] + n[1] * h)];
  });
  return { d: "M" + side(1).concat(side(-1).reverse()).map((p, i) => (i ? "L" : "") + p[0] + " " + p[1]).join("") + "Z", head: pts[N] };
}

const BRIGHT = { g1:"#2DD4BF", g2:"#67E8F9", g3:"#A5F3FC", dark:"#0D3A45", limb:"#2DD4BF", ring:"#2DD4BF", ringOp:.45, glowOp:.2 };
const DEEP   = { g1:"#0F766E", g2:"#0E7490", g3:"#0B4A5B", dark:"#CFE0E6", limb:"#0F766E", ring:"#0E7490", ringOp:.5,  glowOp:.12 };

function build({ id, variant, pal, mono }) {
  const ring = variant === "primary";
  const compact = variant === "compact";
  const k = compact ? 1.5 : 1;
  const { d, head } = ribbon(k);
  const cross = hyp(TH_CROSS);
  const knock = r2(width(frac(TH_CROSS), k) / 2 + 1.4 * S);
  const rB = r2(RBODY * S), rS = r2(RSOI * S), off = r2(LIMB * S);
  const headR = r2(2.3 * k * S);
  const defs = [], out = [];

  if (mono) {
    if (ring) out.push(`<circle cx="${CX}" cy="${CY}" r="${rS}" fill="none" stroke="${mono}" stroke-width="${r2(1.5*S)}" opacity=".45"/>`);
    out.push(`<circle cx="${CX}" cy="${CY}" r="${rB}" fill="none" stroke="${mono}" stroke-width="${r2(1.3*S)}"/>`);
    out.push(`<path d="${d}" fill="${mono}"/>`);
    out.push(`<circle cx="${r2(head[0])}" cy="${r2(head[1])}" r="${headR}" fill="${mono}"/>`);
  } else {
    // the trail fades in rather than ending on a hard edge — it came from far away
    defs.push(
      `<linearGradient id="${id}-g" x1=".06" y1=".04" x2=".94" y2=".96">` +
      `<stop offset=".2" stop-color="${pal.g1}" stop-opacity="0"/>` +
      `<stop offset=".42" stop-color="${pal.g1}"/>` +
      `<stop offset=".76" stop-color="${pal.g2}"/>` +
      `<stop offset="1" stop-color="${pal.g3}"/></linearGradient>`
    );
    if (!compact) {
      // terminator: the body minus a copy of itself pushed away from the light
      defs.push(
        `<mask id="${id}-limb" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">` +
        `<circle cx="${CX}" cy="${CY}" r="${rB}" fill="#fff"/>` +
        `<circle cx="${r2(CX+off)}" cy="${r2(CY+off)}" r="${rB}" fill="#000"/></mask>`
      );
      // clearance so the flyby reads as passing in front of the body
      defs.push(
        `<mask id="${id}-clear" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">` +
        `<rect width="64" height="64" fill="#fff"/>` +
        `<path d="${d}" fill="#000" stroke="#000" stroke-width="${r2(CLEAR*S)}"/></mask>`
      );
    }
    if (ring) {
      defs.push(
        `<mask id="${id}-soi" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">` +
        `<rect width="64" height="64" fill="#fff"/>` +
        `<circle cx="${r2(cross[0])}" cy="${r2(cross[1])}" r="${knock}" fill="#000"/></mask>`
      );
      out.push(`<circle cx="${CX}" cy="${CY}" r="${rS}" fill="none" stroke="${pal.ring}" stroke-width="${r2(1.5*S)}" opacity="${pal.ringOp}" mask="url(#${id}-soi)"/>`);
    }
    if (compact) {
      out.push(`<circle cx="${CX}" cy="${CY}" r="${rB}" fill="${pal.limb}"/>`);
    } else {
      out.push(`<g mask="url(#${id}-clear)">` +
        `<circle cx="${CX}" cy="${CY}" r="${rB}" fill="${pal.dark}"/>` +
        `<circle cx="${CX}" cy="${CY}" r="${rB}" fill="${pal.limb}" mask="url(#${id}-limb)" opacity=".95"/></g>`);
    }
    out.push(`<path d="${d}" fill="url(#${id}-g)"/>`);
    if (!compact) out.push(`<circle cx="${r2(head[0])}" cy="${r2(head[1])}" r="${r2(4.4*S)}" fill="${pal.g2}" opacity="${pal.glowOp}"/>`);
    out.push(`<circle cx="${r2(head[0])}" cy="${r2(head[1])}" r="${headR}" fill="${pal.g3}"/>`);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="DyanAI Labs">\n` +
    `<title>DyanAI Labs</title>\n` +
    (defs.length ? `<defs>${defs.join("")}</defs>\n` : "") +
    out.map((l) => "  " + l).join("\n") + "\n</svg>\n";
}

const FILES = [
  ["logo-primary.svg",            { id:"p",   variant:"primary", pal:BRIGHT }],
  ["logo-core.svg",               { id:"c",   variant:"core",    pal:BRIGHT }],
  ["logo-compact.svg",            { id:"k",   variant:"compact", pal:BRIGHT }],
  ["logo-primary-reversed.svg",   { id:"pr",  variant:"primary", pal:DEEP   }],
  ["logo-core-reversed.svg",      { id:"cr",  variant:"core",    pal:DEEP   }],
  ["logo-compact-reversed.svg",   { id:"kr",  variant:"compact", pal:DEEP   }],
  ["logo-mono-white.svg",         { id:"mw",  variant:"primary", mono:"#FFFFFF" }],
  ["logo-mono-black.svg",         { id:"mb",  variant:"primary", mono:"#050D1A" }],
  ["logo-mono-compact-white.svg", { id:"mcw", variant:"compact", mono:"#FFFFFF" }],
  ["logo-mono-compact-black.svg", { id:"mcb", variant:"compact", mono:"#050D1A" }],
];

for (const [name, opts] of FILES) {
  const svg = build(opts);
  writeFileSync(join(OUT, name), svg, "utf8");
  console.log(name.padEnd(32), svg.length + " bytes");
}
