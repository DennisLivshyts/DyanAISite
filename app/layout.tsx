import type { Metadata } from "next";
import { DM_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import MouseSpotlight from "@/components/MouseSpotlight";
import SpaceBackground from "@/components/SpaceBackground";

// Self-hosted at build time (no request to Google at runtime, nothing render-blocking).
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], display: "swap", variable: "--font-dm-sans" });
const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], display: "swap", variable: "--font-space-mono" });

export const metadata: Metadata = {
  title: "DyanAI Labs — Business Integrations for a Modern Era",
  description:
    "DyanAI Labs builds websites, AI agents and data platforms for businesses that need to move, and stays with them after launch.",
  metadataBase: new URL("https://www.dyanailabs.com"),
  openGraph: {
    title: "DyanAI Labs",
    description: "Business Integrations for a Modern Era",
    url: "https://www.dyanailabs.com",
    siteName: "DyanAI Labs",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning: the head script may add `launching` before React hydrates
    <html lang="en" suppressHydrationWarning className={`${dmSans.variable} ${spaceMono.variable}`}>
      <head>
        {/* Decide before first paint whether this visit gets the launch screen:
            first visit this session, motion allowed, landing on the home page
            top, not a review link. Hard cap: the overlay goes away by 3.5s no matter what.
            ?launch forces it (for reviewing) even if this tab has already seen it. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement;var force=/[?&]launch(=|&|$)/.test(location.search);if(!force&&sessionStorage.getItem('dl-launched'))return;if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;if(location.pathname!=='/'||location.hash||location.search.indexOf('orbit=')>-1)return;d.classList.add('launching');setTimeout(function(){d.classList.remove('launching');try{sessionStorage.setItem('dl-launched','1')}catch(e){}},3500)}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased">
        {/* launch screen — shown only while <html> has the `launching` class */}
        <div id="launch" aria-hidden="true">
          <svg width="100%" height="100%">
            <path id="launch-trail" fill="none" stroke="#67E8F9" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" />
            {/* pad + ignition run in CSS from the first paint, so the screen is never idle while JS loads.
                #launch-origin places the pad (globals.css); the climb starts from wherever it renders. */}
            <g id="launch-origin">
              <circle id="launch-pad" r="12" fill="none" stroke="#2DD4BF" strokeWidth="1" />
              <circle id="launch-glow" r="9" fill="#67E8F9" />
              <circle id="launch-craft" r="3.5" fill="#A5F3FC" />
            </g>
          </svg>
          <div id="launch-label">T−0 · Launch</div>
        </div>
        <SpaceBackground />
        <MouseSpotlight />
        {children}
      </body>
    </html>
  );
}
