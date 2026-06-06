import { connectDb } from "@/lib/db";
import Post from "@/lib/models/Posts";
import Project from "@/lib/models/Project";
import { localizedUrl, SITE_URL } from "@/lib/seo";
import { routing } from "@/i18n/routing";

function esc(s = "") {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const CHANNEL: Record<string, { title: string; desc: string }> = {
  en: { title: "MyHomeStyler Blog", desc: "AI home design tips, floor plan guides, and product updates." },
  es: { title: "Blog de MyHomeStyler", desc: "Consejos de diseño con IA, guías de planos y novedades del producto." },
  ar: { title: "مدونة MyHomeStyler", desc: "نصائح تصميم المنازل بالذكاء الاصطناعي، أدلة المخططات، وتحديثات المنتج." },
};

// Builds a valid RSS 2.0 feed of published blog posts for ONE locale.
export async function blogFeedResponse(locale: string): Promise<Response> {
  const loc = (routing.locales as readonly string[]).includes(locale) ? locale : "en";
  await connectDb();

  // English feed includes legacy posts with no locale set; others match exactly.
  const filter =
    loc === "en"
      ? { status: "published", locale: { $in: ["en", null, undefined] } }
      : { status: "published", locale: loc };

  const posts = (await Post.find(filter)
    .sort({ createdAt: -1 })
    .limit(50)
    .select("title slug excerpt coverImage createdAt updatedAt locale")
    .lean()) as any[];

  const items = posts
    .map((p) => {
      const link = localizedUrl(`/${p.slug}`, p.locale || loc);
      const img = p.coverImage || "";
      return `
    <item>
      <title>${esc(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(p.createdAt).toUTCString()}</pubDate>
      <description>${esc(p.excerpt || p.title)}</description>
      ${img ? `<enclosure url="${esc(img)}" type="image/jpeg" />
      <media:content url="${esc(img)}" medium="image" />` : ""}
    </item>`;
    })
    .join("");

  const ch = CHANNEL[loc] ?? CHANNEL.en;
  const selfLink = loc === "en" ? `${SITE_URL}/feed.xml` : `${SITE_URL}/${loc}/feed.xml`;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(ch.title)}</title>
    <link>${SITE_URL}/blog</link>
    <atom:link href="${selfLink}" rel="self" type="application/rss+xml" />
    <description>${esc(ch.desc)}</description>
    <language>${loc}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

const TYPE_LABEL: Record<string, string> = {
  "floor-plan": "3D Floor Plan",
  "interior-design": "Interior Design",
  outdoor: "Outdoor & Garden Design",
  "empty-room": "Empty Room",
  "virtual-staging": "Virtual Staging",
  "floor-plan-generator": "Floor Plan",
};

// Builds an RSS 2.0 feed of admin-featured renders for Pinterest auto-pinning.
export async function showcaseFeedResponse(): Promise<Response> {
  await connectDb();

  const projects = (await Project.find({ featured: true, renderedImageUrl: { $ne: null } })
    .sort({ featuredAt: -1 })
    .limit(100)
    .select("renderedImageUrl renderStyle inputType featuredAt createdAt")
    .lean()) as any[];

  const items = projects
    .map((p) => {
      const id = String(p._id).slice(-8);
      const style = p.renderStyle || "Modern";
      const type = TYPE_LABEL[p.inputType] || "AI Render";
      const link = `${SITE_URL}/showcase#render-${id}`;
      const img = p.renderedImageUrl;
      const date = new Date(p.featuredAt || p.createdAt).toUTCString();
      return `
    <item>
      <title>${esc(`${style} ${type} — AI 3D Render`)}</title>
      <link>${link}</link>
      <guid isPermaLink="false">showcase-${id}</guid>
      <pubDate>${date}</pubDate>
      <description>${esc(`${style} ${type} created with MyHomeStyler AI home design. Create your own free.`)}</description>
      <enclosure url="${esc(img)}" type="image/jpeg" />
      <media:content url="${esc(img)}" medium="image" />
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>MyHomeStyler Showcase</title>
    <link>${SITE_URL}/showcase</link>
    <atom:link href="${SITE_URL}/showcase.xml" rel="self" type="application/rss+xml" />
    <description>Featured AI-generated interior designs, 3D floor plans, and room makeovers from MyHomeStyler.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
