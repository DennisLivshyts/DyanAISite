# DyanAI Labs — brand marks

The **gravity assist**: a craft enters a body's sphere of influence, whips around it,
and leaves on a steeper course moving faster than it arrived. The path thickens as
it exits and punches back out through the ring.

Everything here is generated from the same geometry as `components/Logo.tsx` —
a real hyperbola (`e = 1.15`) with the focus at the body. **Don't hand-edit these
files.** Change the constants in `Logo.tsx`, then regenerate (see below).

## Which file to use

| File | Use it for |
|---|---|
| `logo-primary.svg` | 40px and up — nav, footer, decks, share cards, print. The default |
| `logo-core.svg` | 32–40px — tight lockups where the ring starts to crowd |
| `logo-compact.svg` | Under 32px — favicons, app icons, nav bars, email signatures |
| `*-reversed.svg` | White and light grounds — invoices, contracts, letterhead |
| `logo-mono-white.svg` | One-colour on dark: embroidery, stamps, single-ink print |
| `logo-mono-black.svg` | One-colour on light: faxes, forms, laser engraving |
| `*-512.png` | Anywhere SVG is awkward — Google Business, social avatars, Slack |

All SVGs are a `0 0 64 64` viewBox and scale cleanly to any size.

## Clear space and minimum size

Leave clear space equal to the **body's radius** on all sides. Minimum sizes:
primary 40px, core 32px, compact 16px. Below 16px use a solid teal circle instead —
nothing survives down there.

Prefer the primary wherever it fits. The ring is the most recognisable part of the
mark and the reason it reads as an orbit rather than a swoosh.

## Don't

Recolour outside the two supplied palettes, stretch it non-uniformly, rotate it,
add effects, or place the bright variant on a light ground. The exit head must stay
the lightest element in the mark; it is the focal point.

## Regenerating

```bash
node brand-src/gen-svg.mjs public/brand      # the SVGs
cd brand-src && npm i @resvg/resvg-js
node gen-png.mjs                             # the PNGs, favicon, OG card
```

`gen-png.mjs` is deliberately not part of `npm run build` — the outputs are
committed so the site builds with no image-generation dependency.
