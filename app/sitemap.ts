import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://www.dyanailabs.com", changeFrequency: "monthly", priority: 1 }];
}
