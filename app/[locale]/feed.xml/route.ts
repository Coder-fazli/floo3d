import { blogFeedResponse } from "@/lib/rss";

export const revalidate = 3600;

// Per-locale blog feed: /es/feed.xml, /ar/feed.xml (English lives at /feed.xml).
export async function GET(_req: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return blogFeedResponse(locale);
}
