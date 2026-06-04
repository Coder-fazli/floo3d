import { blogFeedResponse } from "@/lib/rss";

export const revalidate = 3600;

// English blog feed. Spanish/Arabic feeds live at /es/feed.xml and /ar/feed.xml.
export async function GET() {
  return blogFeedResponse("en");
}
