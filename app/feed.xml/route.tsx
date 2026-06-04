import { connectDb } from "@/lib/db";
import Post from "@/lib/models/Posts";
import { localizedUrl, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

function esc(s = "") {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
}

export async function GET() {
    await connectDb();

    const posts = await Post.find({
        status: "published",
    })
     .sort({ createdAt: -1 })
     .limit(50)
     .select("title slug excerpt coverImage createdAt updatedAt locale").lean();

     const items = posts
          .map((p: any) => {
            const link = localizedUrl(`/${p.slug}`, p.locale || "en");
            const img = p.coverImage || "";
            return `
            <item>
        <title>${esc(p.title)}</title>
        <link>${link}</link>
        <guid isPermaLink="true">${link}</guid>
        <pubDate>${new 
           Date(p.createdAt).toUTCString()}</pubDate>
           <description>${esc(p.excerpt || p.title)}</description>
           ${img ? `<enclosure url="${esc(img)}" type="image/jpeg"
           />
           <media:content url="${esc(img)}" medium="image" />` :
           ""}
           </item>`;
         })
      .join("");
       const xml = `<?xml version="1.0" encoding="UTF-8"?>
           <rss version="2.0"
           xmlns:media="http://search.yahoo.com/mrss/"
           xmlns:atom="http://www.w3.org/2005/Atom">
           <channel>
           <title>MyHomeStyler Blog</title>
           <link>${SITE_URL}/blog</link>
           <atom:link href="${SITE_URL}/feed.xml" rel="self"
           type="application/rss+xml" />
           <description>AI home design tips, floor plan guides, and
           product updates.</description>
           <language>en</language>
           <lastBuildDate>${new 
           Date().toUTCString()}</lastBuildDate>${items}
           </channel>
           </rss>`;
  
          return new Response(xml, {
            headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },

   });
}