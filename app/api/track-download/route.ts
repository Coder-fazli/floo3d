import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Project from "@/lib/models/Project";
import { connectDb } from "@/lib/db";

export async function POST(request: Request) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { projectId } = await request.json();
    if (!projectId || !/^[a-f\d]{24}$/i.test(projectId))
        return NextResponse.json({ ok: false });
    await connectDb();
    await Project.findByIdAndUpdate(projectId, { downloadedAt: new Date() });
    return NextResponse.json({ ok: true });
}
