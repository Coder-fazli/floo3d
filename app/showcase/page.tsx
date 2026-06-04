import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MasonryGrid } from "@/components/ui/image-testimonial-grid";
import { connectDb } from "@/lib/db";
import Project from "@/lib/models/Project";
import User from "@/lib/models/User";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 600; // refresh the gallery every 10 min

export const metadata: Metadata = {
  title: "Showcase — AI Home Designs & 3D Renders | MyHomeStyler",
  description:
    "A gallery of real AI-generated interior designs, 3D floor plans, and room makeovers created with MyHomeStyler. Get inspired, then create your own free.",
  alternates: { canonical: `${SITE_URL}/showcase` },
  openGraph: {
    title: "Showcase — AI Home Designs & 3D Renders",
    description: "Real AI renders created with MyHomeStyler. Get inspired and create your own free.",
    url: `${SITE_URL}/showcase`,
    type: "website",
  },
};

type Item = {
  id: string;
  image: string;
  anchor: string;
  style: string;
  type: string;
  authorName: string;
  authorAvatar: string;
};

async function getShowcase(): Promise<Item[]> {
  await connectDb();
  const projects = (await Project.find({ featured: true, renderedImageUrl: { $ne: null } })
    .sort({ featuredAt: -1 })
    .limit(60)
    .select("renderedImageUrl renderStyle inputType userId featuredAt")
    .lean()) as any[];

  const userIds = [...new Set(projects.map((p) => p.userId))];
  const users = (await User.find({ clerkId: { $in: userIds } }, { clerkId: 1, name: 1, imageUrl: 1 }).lean()) as any[];
  const userMap: Record<string, { name: string; imageUrl: string }> = {};
  for (const u of users) userMap[u.clerkId] = { name: u.name, imageUrl: u.imageUrl };

  const TYPE_LABEL: Record<string, string> = {
    "floor-plan": "3D Floor Plan",
    "interior-design": "Interior Design",
    outdoor: "Outdoor & Garden",
    "empty-room": "Virtual Staging",
    "floor-plan-generator": "Floor Plan",
  };

  return projects.map((p) => ({
    id: String(p._id),
    image: p.renderedImageUrl,
    anchor: `render-${String(p._id).slice(-8)}`,
    style: p.renderStyle || "Modern",
    type: TYPE_LABEL[p.inputType] || "AI Render",
    authorName: userMap[p.userId]?.name?.trim() || "MyHomeStyler User",
    authorAvatar: userMap[p.userId]?.imageUrl || "",
  }));
}

export default async function ShowcasePage() {
  const items = await getShowcase();

  return (
    <div style={{ background: "#faf7f4", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pt-14 pb-8 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#fb3b01]">Community Showcase</p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-[#27282f]">
          Real AI Designs, Made by Real People
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base sm:text-lg text-slate-600">
          A handpicked gallery of 3D renders, floor plans, and room makeovers created with MyHomeStyler. Get inspired — then make your own.
        </p>
        <Link
          href="/dashboard"
          className="mt-7 inline-flex items-center justify-center bg-[#fb3b01] px-8 py-3.5 text-sm font-bold uppercase tracking-[0.15em] text-white transition hover:opacity-90"
        >
          ✦ Create Yours Free
        </Link>
      </section>

      {/* Masonry gallery */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        {items.length === 0 ? (
          <p className="py-20 text-center text-slate-400">No designs featured yet — check back soon.</p>
        ) : (
          <MasonryGrid columns={3} gap={5}>
            {items.map((it) => (
              <figure
                key={it.id}
                id={it.anchor}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm scroll-mt-24"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={it.image}
                  alt={`${it.style} ${it.type} — AI render by MyHomeStyler`}
                  loading="lazy"
                  className="block w-full h-auto"
                />
                <figcaption className="flex items-center gap-3 p-3">
                  {it.authorAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={it.authorAvatar}
                      alt={it.authorName}
                      className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow"
                    />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fb3b01] text-sm font-bold text-white">
                      {it.authorName[0]?.toUpperCase() || "M"}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#27282f]">{it.authorName}</p>
                    <p className="truncate text-xs text-slate-500">
                      {it.style} · {it.type}
                    </p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </MasonryGrid>
        )}
      </section>

      <Footer />
    </div>
  );
}
