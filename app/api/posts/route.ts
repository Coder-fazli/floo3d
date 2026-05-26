import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import Post from "@/lib/models/Posts";

export async function GET(){
    try {
        await connectDb();
        const posts = await Post.find({ status: "published" })
        .sort({ createdAt: -1 })
        .select("title slug excerpt coverImage tags createdAt")
        .lean();
        return NextResponse.json({ posts });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
}

