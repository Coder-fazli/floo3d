import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import User from "@/lib/models/User";

export async function DELETE(request: Request) {
    const { userId, sessionClaims } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
    if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { clerkId } = await request.json();
    if (!clerkId) return NextResponse.json({ error: "Missing clerkId" }, { status: 400 });

    await connectDb();

    await User.deleteOne({ clerkId });

    try {
        const client = await clerkClient();
        await client.users.deleteUser(clerkId);
    } catch (err: any) {
        console.error("[delete-user] Clerk deletion failed:", err?.message ?? err);
    }

    return NextResponse.json({ ok: true });
}
