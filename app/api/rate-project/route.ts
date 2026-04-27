import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDb } from "@/lib/db";
import Project from "@/lib/models/Project";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { projectId, rating } = await req.json();
    if (!projectId) return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    await connectDb();
    await Project.findByIdAndUpdate(projectId, { rating: rating ?? null });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save rating" }, { status: 500 });
  }
}
