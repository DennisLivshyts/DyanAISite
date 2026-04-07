import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import MouseSpotlight from "@/components/MouseSpotlight";
import SpaceBackground from "@/components/SpaceBackground";

export const metadata: Metadata = {
  title: "DyanAI Labs — Business Integrations for a Modern Era",
  description:
    "DyanAI Labs builds custom websites and deploys intelligent AI agents for marketing, outreach, and booking — so your business runs smarter, not harder.",
  metadataBase: new URL("https://calendly.com/livshytsd-dyanailabs"),
  openGraph: {
    title: "DyanAI Labs",
    description: "Business Integrations for a Modern Era",
    url: "https://calendly.com/livshytsd-dyanailabs",
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
    <html lang="en">
      <head>
        <link
          href="https://assets.calendly.com/assets/external/widget.css"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <SpaceBackground />
        <MouseSpotlight />
        {children}
        <Script
          src="https://assets.calendly.com/assets/external/widget.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
