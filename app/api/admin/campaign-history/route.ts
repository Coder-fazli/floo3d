import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import CampaignLog from "@/lib/models/CampaignLog";

export async function GET() {
    const { userId, sessionClaims } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
    if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await connectDb();
    const logs = await CampaignLog.find({}).sort({ createdAt: -1 }).limit(20).lean();
    return NextResponse.json({ logs });
}
