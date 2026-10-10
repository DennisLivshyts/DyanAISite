import type { Metadata } from "next";
import "./globals.css";
import MouseSpotlight from "@/components/MouseSpotlight";
import SpaceBackground from "@/components/SpaceBackground";
import OrbitMount from "@/components/orbit/OrbitMount";

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
    <html lang="en">
      <body className="antialiased">
        {/* behind the content: stars, then the gravity-assist scene */}
        <SpaceBackground />
        <OrbitMount />
        <MouseSpotlight />
        {children}
      </body>
    </html>
  );
}
