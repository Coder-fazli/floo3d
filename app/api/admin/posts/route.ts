import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import Post from "@/lib/models/Posts";


function isAdmin(sessionClaims: any) {
    return (sessionClaims?.publicMetadata as { role?: string })?.role === "admin";
}

function toSlug(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

export async function GET() {
    try {
         const { userId, sessionClaims } = await auth();
         if (!userId || !isAdmin(sessionClaims))
         return NextResponse.json({ error: "Forbidden" }, {
         status: 403 });

         await connectDb();
         const posts = await Post.find({}).sort({ createdAt: -1 }).lean();
         return NextResponse.json({ posts });
    } 
      catch (error) {
      console.error("GET /api/admin/posts error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: Request) {

    try {
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
        status,
        metaTitle,
        metaDescription,
        focusKeyword,
      } = await request.json() as {
        title?: string;
        content?: string;
        excerpt?: string;
        coverImage?: string;
        tags?: string[];
        status?: string;
        metaTitle?: string;
        metaDescription?: string;
        focusKeyword?: string;
      };

      if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

      await connectDb();

      let slug = toSlug(title);
      const existing = await Post.findOne({ slug }).lean();
      if (existing) slug = `${slug}-${Date.now()}`;

      const post = await Post.create({ title, slug, content, excerpt, coverImage, tags, status, metaTitle, metaDescription, focusKeyword });
      return NextResponse.json({ post }, { status: 201 });

      
    } catch (error) {
      console.error("POST /api/admin/posts error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  
}