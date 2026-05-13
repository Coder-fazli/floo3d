import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(request: Request) {
    const { userId, sessionClaims } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
    if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { audience, specificUserId } = await request.json();

    await connectDb();

    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const audienceFilters: Record<string, any> = {
        all:      { email: { $ne: "" } },
        free:     { hasPurchased: false, email: { $ne: "" } },
        inactive: { updatedAt: { $lt: sevenDaysAgo }, email: { $ne: "" } },
        new:      { credits: 2, hasPurchased: false, email: { $ne: "" } },
        paid:     { hasPurchased: true, email: { $ne: "" } },
        specific: { clerkId: specificUserId, email: { $ne: "" } },
    };

    const filter = {
        ...audienceFilters[audience] ?? audienceFilters.all,
        $or: [
            { lastCampaignEmailAt: null },
            { lastCampaignEmailAt: { $lt: threeDaysAgo } },
        ],
    };

    const count = await User.countDocuments(filter);
    return NextResponse.json({ count });
}
