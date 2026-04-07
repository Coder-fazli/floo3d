import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/lib/models/Project";

export async function POST(req: NextRequest) {
  try {
    const { projectId, rating } = await req.json();
    if (!projectId) return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    await connectDB();
    await Project.findByIdAndUpdate(projectId, { rating: rating ?? null });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save rating" }, { status: 500 });
  }
}
