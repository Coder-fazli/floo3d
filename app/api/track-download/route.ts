import { NextResponse } from "next/server";
import Project from "@/lib/models/Project";
import { connectDb } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: false });
    const { projectId } = await request.json();
    if (!projectId) return NextResponse.json({ ok: false });
    await connectDb();
    await Project.findByIdAndUpdate(projectId, { downloadedAt: new Date() });
     return NextResponse.json({ ok: true });
}