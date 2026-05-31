import { MetadataRoute } from "next";
import { connectDb } from "@/lib/db";
import Post from "@/lib/models/Posts";

const BASE = "https://myhomestyler.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    // English
    { url: BASE,                                         lastModified: now, changeFrequency: "weekly",  priority: 1   },
    { url: `${BASE}/2d-to-3d-floor-plan-converter`,      lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/floor-plan-generator`,               lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/blog`,                               lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/pricing`,                            lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/privacy-policy`,                     lastModified: now, changeFrequency: "yearly",  priority: 0.4 },
    { url: `${BASE}/terms-of-service`,                   lastModified: now, changeFrequency: "yearly",  priority: 0.4 },
    { url: `${BASE}/refund-policy`,                      lastModified: now, changeFrequency: "yearly",  priority: 0.4 },
    { url: `${BASE}/contact`,                            lastModified: now, changeFrequency: "yearly",  priority: 0.5 },
    // Arabic
    { url: `${BASE}/ar`,                                 lastModified: now, changeFrequency: "weekly",  priority: 1   },
    { url: `${BASE}/ar/blog`,                            lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
  ];

  try {
    await connectDb();
    const posts = await Post.find({ status: "published" })
      .select("slug updatedAt createdAt")
      .lean() as Array<{ slug: string; updatedAt?: Date; createdAt?: Date }>;

    const postRoutes: MetadataRoute.Sitemap = posts.flatMap((p) => [
      {
        url: `${BASE}/${p.slug}`,
        lastModified: p.updatedAt ?? p.createdAt ?? new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      },
      {
        url: `${BASE}/ar/${p.slug}`,
        lastModified: p.updatedAt ?? p.createdAt ?? new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      },
    ]);

    return [...staticRoutes, ...postRoutes];
  } catch {
    return staticRoutes;
  }
}
