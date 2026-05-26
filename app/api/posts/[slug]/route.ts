import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import Post from "@/lib/models/Posts";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        await connectDb();
        const post = await Post.findOne({
            slug,
            status: "published",
         }).lean();

         if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
            return NextResponse.json({ post });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch post"
   },
    { status: 500 });
    }
}