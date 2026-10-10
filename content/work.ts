/**
 * Everything the site says about what DyanAI Labs has built.
 *
 * Evidence rule: every factual line cites ids from the fact sheet
 * (cortana-dashboard/server/facts/dyanailabs.yaml), the same file the Instagram
 * claim gate trusts. `node scripts/check-claims.mjs` fails on an id that isn't
 * there. Our own website is never evidence for itself.
 *
 * Release rule: a case with `cleared: false` renders on preview deploys (with
 * a "draft" ribbon naming what it waits on) and is left out of production
 * builds entirely, so merging can't publish a client before they've said yes.
 */

export type Line = { text: string; evidence: string[] };

export type Visual =
  | { kind: "shots"; desktop: string; size: [number, number]; phone?: string; alt: string }
  | { kind: "schematic"; variant: "invitation" | "agents" | "pipeline" };

export type Case = {
  slug: string;
  name: string;           // who it was for, as we're allowed to say it
  kicker: string;         // what kind of client / project
  headline: string;
  lines: Line[];
  tags: string[];
  link?: { href: string; label: string };
  visual: Visual;
  cleared: boolean;
  waitingOn?: string;     // shown on the preview ribbon while not cleared
};

export const CASES: Case[] = [
  {
    slug: "crossline",
    name: "CROSS LINE",
    kicker: "Sports management, technology & AI · Brazil / USA",
    headline: "One ball, five sports, one scroll.",
    lines: [
      {
        text: "A single 3D ball travels through volleyball, tennis, basketball, American football and soccer scenes as you scroll.",
        evidence: ["site-crossline-journey"],
      },
      {
        text: "The camera rides a path tied to the scroll, with every bounce and score pinned to a point along it.",
        evidence: ["site-crossline-camera-path"],
      },
      {
        text: "Next.js and Three.js, rendered live in the browser. English, Portuguese and Spanish, with a phone layout where the 3D still runs.",
        evidence: ["site-crossline-stack", "site-crossline-languages", "site-crossline-phone"],
      },
    ],
    tags: ["Next.js", "Three.js", "3 languages"],
    link: { href: "https://www.crosslinesports.ai", label: "crosslinesports.ai" },
    visual: {
      kind: "shots",
      desktop: "/work/crossline/desktop.webp",
      size: [1200, 750],
      phone: "/work/crossline/phone.webp",
      alt: "The CROSS LINE homepage: a stadium at dusk behind the headline “The engine behind performance.”",
    },
    cleared: false,
    waitingOn: "Carol's OK to name CROSS LINE and show screenshots",
  },
  {
    slug: "dj-essence",
    name: "DJ Essence",
    kicker: "Working DJ & MC",
    headline: "A record that turns as you scroll.",
    lines: [
      {
        text: "A vinyl record spins with the scroll, and each turn steps to the next section of the site.",
        evidence: ["site-dj-essence-vinyl"],
      },
      {
        text: "Reach the booking section and the record coasts to a stop; the request form opens out to full width.",
        evidence: ["site-dj-essence-end-of-side"],
      },
      {
        text: "Clients pick a package and add-ons in the booking form, and the events wall is fed from the DJ's Instagram.",
        evidence: ["site-dj-essence-booking", "site-dj-essence-events-feed"],
      },
    ],
    tags: ["Next.js", "Scroll-driven", "Booking"],
    link: { href: "https://dj-essence.com", label: "dj-essence.com" },
    visual: {
      kind: "shots",
      desktop: "/work/dj-essence/desktop.webp",
      size: [1200, 700],
      alt: "The DJ Essence site: three booking packages beside a large spinning vinyl record.",
    },
    cleared: false,
    waitingOn: "test review taken down + Arman's OK",
  },
  {
    slug: "wedding-demo",
    name: "Wedding invitation (demo)",
    kicker: "Interactive 3D invitation",
    headline: "A four-act invitation guests walk through.",
    lines: [
      {
        text: "An interactive four-act Three.js invitation that guests move through like a place, not a page.",
        evidence: ["site-wedding"],
      },
    ],
    tags: ["Three.js", "GSAP", "RSVP"],
    visual: { kind: "schematic", variant: "invitation" },
    cleared: false,
    waitingOn: "the demo copy (fictional couple, no real details) to be built",
  },
  {
    slug: "agents",
    name: "Our own agents",
    kicker: "Internal tooling",
    headline: "We run agents in production before we sell them.",
    lines: [
      {
        text: "AI agents and automation running in production on our own infrastructure.",
        evidence: ["service-agents"],
      },
    ],
    tags: ["AI agents", "Automation", "Self-hosted"],
    link: { href: "https://www.instagram.com/dyanailabs", label: "@dyanailabs" },
    visual: { kind: "schematic", variant: "agents" },
    cleared: true,
  },
  {
    slug: "sports-analytics",
    name: "A sports analytics client",
    kicker: "Data & machine learning",
    headline: "From raw data to a scored, shared platform.",
    lines: [
      {
        text: "Data pipelines, a machine-learning scoring system, cloud infrastructure and databases.",
        evidence: ["service-data-ai"],
      },
    ],
    tags: ["Data pipelines", "ML", "Cloud"],
    visual: { kind: "schematic", variant: "pipeline" },
    cleared: false,
    waitingOn: "Dennis to confirm the NDA allows an anonymised mention",
  },
];

export type Capability = {
  title: string;
  body: Line;
  proof: string[];        // case slugs shown as chips
};

export const CAPABILITIES: Capability[] = [
  {
    title: "Websites & interactive 3D",
    body: {
      text: "Custom sites designed from scratch, for businesses and private clients. When a project calls for it, we add 3D and motion that runs live in the browser, phones included.",
      evidence: ["service-websites", "feature-3d", "site-crossline-phone"],
    },
    proof: ["crossline", "wedding-demo"],
  },
  {
    title: "AI agents & automation",
    body: {
      text: "Agents that take real work off your plate. Ours run in production on our own infrastructure, so we know what breaks before you do.",
      evidence: ["service-agents"],
    },
    proof: ["agents"],
  },
  {
    title: "Data & ML platforms",
    body: {
      text: "Pipelines, scoring models, cloud infrastructure and databases, built for how your data actually arrives.",
      evidence: ["service-data-ai"],
    },
    proof: ["sports-analytics"],
  },
  {
    title: "Booking & lead systems",
    body: {
      text: "Booking requests with packages and add-ons, contact forms, and calendar sync, so enquiries land somewhere you'll see them.",
      evidence: ["site-dj-essence-booking"],
    },
    proof: ["dj-essence"],
  },
];

export const ABOUT: Line = {
  text: "DyanAI Labs is an independent studio founded in March 2026 by Dennis Livshyts.",
  evidence: ["founded"],
};

/** Production builds drop uncleared cases; preview and local builds keep them. */
export const IS_PRODUCTION = process.env.VERCEL_ENV === "production";
export const visibleCases = () => CASES.filter((c) => c.cleared || !IS_PRODUCTION);
