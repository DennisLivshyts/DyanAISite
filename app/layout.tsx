import type { Metadata } from "next";
import "./globals.css";
import MouseSpotlight from "@/components/MouseSpotlight";
import SpaceBackground from "@/components/SpaceBackground";

export const metadata: Metadata = {
  title: "DyanAI Labs — Business Integrations for a Modern Era",
  description:
    "DyanAI Labs builds custom websites and deploys intelligent AI agents for marketing, outreach, and booking — so your business runs smarter, not harder.",
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
    <html lang="en">
      <body className="antialiased">
        <SpaceBackground />
        <MouseSpotlight />
        {children}
      </body>
    </html>
  );
}
