import { MetadataRoute } from "next";
import { connectDb } from "@/lib/db";
import Post from "@/lib/models/Posts";

const BASE = "https://myhomestyler.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  // Pages that exist in BOTH English and Arabic (real distinct URLs).
  const bilingual = [
    { path: "/", priority: 1 },
    { path: "/2d-to-3d-floor-plan-converter", priority: 0.9 },
    { path: "/floor-plan-generator", priority: 0.9 },
  ];

  const staticRoutes: MetadataRoute.Sitemap = [
    // Multilingual pages — emit each locale, all cross-linked via hreflang.
    ...bilingual.flatMap(({ path, priority }) => {
      const en = path === "/" ? BASE : `${BASE}${path}`;
      const ar = path === "/" ? `${BASE}/ar` : `${BASE}/ar${path}`;
      const es = path === "/" ? `${BASE}/es` : `${BASE}/es${path}`;
      const languages = { en, "ar-AE": ar, "es-ES": es };
      return [
        { url: en, lastModified: now, changeFrequency: "weekly" as const, priority, alternates: { languages } },
        { url: ar, lastModified: now, changeFrequency: "weekly" as const, priority, alternates: { languages } },
        { url: es, lastModified: now, changeFrequency: "weekly" as const, priority, alternates: { languages } },
      ];
    }),
    // English-only pages (Arabic served on same URL via cookie — single canonical).
    { url: `${BASE}/showcase`,         lastModified: now, changeFrequency: "daily",  priority: 0.8 },
    { url: `${BASE}/blog`,             lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/pricing`,          lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/privacy-policy`,   lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE}/terms-of-service`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE}/refund-policy`,    lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE}/contact`,          lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];

  try {
    await connectDb();
    const posts = await Post.find({ status: "published" })
      .select("slug locale updatedAt createdAt")
      .lean() as Array<{ slug: string; locale?: string; updatedAt?: Date; createdAt?: Date }>;

    // Each post appears once, at its own locale's URL.
    const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
      url: p.locale === "ar" ? `${BASE}/ar/${p.slug}` : p.locale === "es" ? `${BASE}/es/${p.slug}` : `${BASE}/${p.slug}`,
      lastModified: p.updatedAt ?? p.createdAt ?? new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...postRoutes];
  } catch {
    return staticRoutes;
  }
}
