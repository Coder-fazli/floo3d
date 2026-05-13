import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import User from "@/lib/models/User";

export async function GET(request: Request) {
    const { userId, sessionClaims } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
    if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) return NextResponse.json({ users: [] });

    await connectDb();

    const users = await User.find({
        $or: [
            { name:  { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
        ],
        email: { $ne: "" },
    }, { name: 1, email: 1, clerkId: 1, imageUrl: 1 })
    .limit(8)
    .lean();

    return NextResponse.json({ users });
}
