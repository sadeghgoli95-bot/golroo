import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://golroo.com";
  return [
    { url: base, priority: 1, changeFrequency: "weekly" },
    { url: `${base}/journal`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${base}/about`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${base}/contact`, priority: 0.7, changeFrequency: "monthly" },
  ];
}
