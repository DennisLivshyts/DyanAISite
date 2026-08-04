/**
 * Rasterise the static brand images from the generated SVGs.
 *
 *   cd brand-src && npm i @resvg/resvg-js && node gen-png.mjs
 *
 * Deliberately not wired into `npm run build` — the outputs are committed, so
 * the site builds with no image-generation dependency. (next/og was the obvious
 * alternative but its bundled copy crashes on Windows: it runs path.join over a
 * file:// URL, which produces backslashes and then fails fileURLToPath.)
 */
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = join(HERE, "..");
const BRAND = join(SITE, "public/brand");
const FONTS = [join(HERE, "fonts/DMSans-Bold.ttf"), join(HERE, "fonts/DMSans-Regular.ttf")];

/** strip the outer <svg> so a mark can be nested inside a larger canvas */
const inner = (file) =>
  readFileSync(join(BRAND, file), "utf8")
    .replace(/^[\s\S]*?<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "");

function render(svg, width, out) {
  const r = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: "DM Sans" },
  });
  writeFileSync(out, r.render().asPng());
  console.log(out.split(/[\\/]/).pop().padEnd(30), width + "px");
}

/* ---------- apple touch icon ---------- */
render(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
    <defs><radialGradient id="bg" cx="0.3" cy="0.18" r="0.95">
      <stop offset="0" stop-color="#123049"/><stop offset="0.7" stop-color="#050D1A"/>
    </radialGradient></defs>
    <rect width="180" height="180" fill="url(#bg)"/>
    <g transform="translate(28,28) scale(1.9375)">${inner("logo-compact.svg")}</g>
  </svg>`,
  180,
  join(SITE, "app/apple-icon.png")
);

/* ---------- open graph card ---------- */
render(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
    <defs><radialGradient id="bg" cx="0.78" cy="0.12" r="1.05">
      <stop offset="0" stop-color="#123049"/><stop offset="0.62" stop-color="#050D1A"/>
    </radialGradient></defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <g transform="translate(491,116) scale(3.4)">${inner("logo-primary.svg")}</g>
    <text x="600" y="448" text-anchor="middle" font-family="DM Sans" font-weight="700"
          font-size="76" letter-spacing="-2">
      <tspan fill="#F2F8FC">Dyan</tspan><tspan fill="#67E8F9">AI</tspan><tspan fill="#F2F8FC"> Labs</tspan>
    </text>
    <text x="600" y="508" text-anchor="middle" font-family="DM Sans" font-weight="400"
          font-size="23" letter-spacing="5.4" fill="#7E95AE">
      BUSINESS INTEGRATIONS FOR A MODERN ERA
    </text>
  </svg>`,
  1200,
  join(SITE, "app/opengraph-image.png")
);

/* ---------- raster marks, for anywhere SVG is awkward ---------- */
for (const [file, out] of [
  ["logo-primary.svg", "logo-primary-512.png"],
  ["logo-core.svg", "logo-core-512.png"],
  ["logo-compact.svg", "logo-compact-512.png"],
  ["logo-primary-reversed.svg", "logo-primary-reversed-512.png"],
]) {
  render(readFileSync(join(BRAND, file), "utf8"), 512, join(BRAND, out));
}
