import { connectDb } from "@/lib/db";
import Post from "@/lib/models/Posts";

export async function GET() {
  await connectDb();
  const posts = await Post.find({ status: "published" })
    .select("title slug excerpt")
    .lean() as any[];

  const postLines = posts
    .map((p) => `- [${p.title}](https://myhomestyler.com/${p.slug})${p.excerpt ? `: ${p.excerpt}` : ""}`)
    .join("\n");

  const body = [
    "# MyHomeStyler",
    "",
    "> AI-powered floor plan generator and home design tool. Convert 2D floor plans to 3D instantly.",
    "",
    "## Pages",
    "- [Home](https://myhomestyler.com): AI floor plan generator",
    "- [2D to 3D Converter](https://myhomestyler.com/2d-to-3d-floor-plan-converter): Upload and convert floor plans",
    "- [Floor Plan Generator](https://myhomestyler.com/floor-plan-generator): Generate floor plans with AI",
    "- [Pricing](https://myhomestyler.com/pricing): Plans and credits",
    "- [Blog](https://myhomestyler.com/blog): Design tips and AI insights",
    "",
    "## Blog Posts",
    postLines,
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
