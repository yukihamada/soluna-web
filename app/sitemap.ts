export const dynamic = "force-static";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://solun.art";
  const now = new Date("2026-02-01");

  return [
    { url: base,           lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${base}/vip`,  lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/lineup`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/info`,  lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/guide`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`,   lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
