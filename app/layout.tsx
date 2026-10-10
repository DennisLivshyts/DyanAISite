import type { Metadata } from "next";
import "./globals.css";
import MouseSpotlight from "@/components/MouseSpotlight";
import SpaceBackground from "@/components/SpaceBackground";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Decide before first paint whether this visit gets the launch screen:
            first visit this session, motion allowed, landing on the home page
            top, not a review link. Hard cap: the overlay goes away by 3.5s no matter what. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement;if(sessionStorage.getItem('dl-launched'))return;if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;if(location.pathname!=='/'||location.hash||location.search.indexOf('orbit=')>-1)return;d.classList.add('launching');setTimeout(function(){d.classList.remove('launching');try{sessionStorage.setItem('dl-launched','1')}catch(e){}},3500)}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased">
        {/* launch screen — shown only while <html> has the `launching` class */}
        <div id="launch" aria-hidden="true">
          <svg width="100%" height="100%">
            <path id="launch-trail" fill="none" stroke="#67E8F9" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" />
            {/* pad + ignition run in CSS from the first paint, so the screen is never idle while JS loads */}
            <circle id="launch-pad" cx="50%" cy="96%" r="12" fill="none" stroke="#2DD4BF" strokeWidth="1" />
            <circle id="launch-glow" cx="50%" cy="96%" r="9" fill="#67E8F9" />
            <circle id="launch-craft" cx="50%" cy="96%" r="3.5" fill="#A5F3FC" />
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
