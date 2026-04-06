import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DyanAI Labs — Business Integrations for a Modern Era",
  description:
    "DyanAI Labs builds custom websites and deploys intelligent AI agents for marketing, outreach, and booking — so your business runs smarter, not harder.",
  metadataBase: new URL("https://dyanailabs.com"),
  openGraph: {
    title: "DyanAI Labs",
    description: "Business Integrations for a Modern Era",
    url: "https://dyanailabs.com",
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
