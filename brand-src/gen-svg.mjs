/**
 * DyanAI Labs — gravity assist mark.
 * Emits every variant as a standalone SVG in absolute 64-unit coordinates.
 *   node brand-src/gen-svg.mjs <outDir>
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = process.argv[2];
if (!OUT) { console.error("usage: node brand-src/gen-svg.mjs <outDir>"); process.exit(1); }
mkdirSync(OUT, { recursive: true });

// The math is shared with components/Logo.tsx and the scroll scene. Node >= 22.18
// imports the .ts directly (type stripping); older Node needs --experimental-strip-types.
import { CX, CY, RBODY, RSOI, LIMB, CLEAR, S, TONES, TH_CROSS, hyp, ribbon, knockFor, headRFor, round as r2 } from "../lib/orbit.ts";

const BRIGHT = TONES.bright;
const DEEP = TONES.deep;

function build({ id, variant, pal, mono }) {
  const ring = variant === "primary";
  const compact = variant === "compact";
  const k = compact ? 1.5 : 1;
  const { d, head } = ribbon(k);
  const cross = hyp(TH_CROSS);
  const knock = knockFor(k);
  const rB = r2(RBODY * S), rS = r2(RSOI * S), off = r2(LIMB * S);
  const headR = headRFor(k);
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
