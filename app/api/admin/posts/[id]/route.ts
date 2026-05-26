import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import Post from "@/lib/models/Posts";

function isAdmin(sessionClaims: any){
  return (sessionClaims?.publicMetadata as { role?: string })?.role === "admin";
}

export async function PUT(request: Request, { params }: {
    params: Promise<{ id: string }> }) {
    const { userId, sessionClaims } = await auth();
    if (!userId || !isAdmin(sessionClaims))
    return NextResponse.json({ error: "Forbidden" }, {
    status: 403 });

       const {
        title,
        content,
        excerpt,
        coverImage,
        tags,
        status
         } = await request.json() as {
        title?: string;
        content?: string;
        excerpt?: string;
        coverImage?: string;
        tags?: string[];
        status?: string;
      };

      const { id } = await params;
      await connectDb();

      const post = await Post.findByIdAndUpdate(
        id,
        { $set: 
          {title, content, excerpt, coverImage, tags,
          status, updatedAt: new Date() } },
          { new: true }
        );
       if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
       return NextResponse.json({ post });
}


export async function DELETE(_: Request, { params }: {
    params: Promise<{ id: string }> }) {
    const { userId, sessionClaims } = await auth();
    if (!userId || !isAdmin(sessionClaims))
    return NextResponse.json({ error: "Forbidden" }, {
    status: 403 });

    const { id } = await params;
    await connectDb();
    await Post.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  }
