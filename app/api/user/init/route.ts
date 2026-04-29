import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import User from "@/lib/models/User";
import geoip from "geoip-lite";

export const dynamic = 'force-dynamic';                  
                                            

export async function POST(request: Request) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: false },
        { status: 401 });

        const ip =
           request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
           request.headers.get("x-real-ip") ?? null;

        const country = ip ? (geoip.lookup(ip)?.country ?? "") : "";

           await connectDb();

           const user = await User.findOne({ clerkId: userId });
           if (!user) return NextResponse.json({ ok: false });


           // Already initilized
           if (user.signupIp !== null) return NextResponse.json({ ok: true });

           const whitelisted = process.env.WHITELISTED_IPS?.split(",").map(s => s.trim()).includes(ip ?? "");

           const ipAlreadyUsed =
            !whitelisted &&
            ip &&
                (await User.exists({ signupIp: ip, clerkId: {
                $ne: userId } }));

                const credits = ipAlreadyUsed ? 0 : 2;

                await User.findOneAndUpdate(
                    { clerkId: userId },
                    { $set: { signupIp: ip ?? "unknown", credits, ...(country && { country }) } }
                );
                 return NextResponse.json({ ok: true, credits });

}