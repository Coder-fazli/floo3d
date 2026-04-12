import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import Project from "@/lib/models/Project";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDb();
  const project = await Project.findById(id);

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (project.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await Project.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
