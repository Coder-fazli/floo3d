import { showcaseFeedResponse } from "@/lib/rss";

export const revalidate = 3600;

// RSS feed of featured renders → Pinterest auto-pins, linking back to /showcase.
export async function GET() {
  return showcaseFeedResponse();
}
