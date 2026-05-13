import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import User from "@/lib/models/User";
import CampaignLog from "@/lib/models/CampaignLog";
import { Resend } from "resend";
import { CampaignEmail } from "@/lib/emails/CompaignEmail";

export const runtime = "nodejs";

function getResend() {
     return new Resend(process.env.RESEND_API_KEY)
} 

export async function POST(request: Request) {

  // 1. Check admin
    const { userId, sessionClaims} = await auth();
    if (!userId) return NextResponse.json({
        error: "Unauthorized"
    }, { status: 401 });
      const role = (sessionClaims?.publicMetadata as { role?: string })?.role;

      if (role !== "admin") return NextResponse.json({
        error: "Forbidden"
      }, { status: 403 });

    // Here we get Campaign data
    const { audience, subject, body, ctaText, ctaUrl, specificUserId, logoUrl, btnColor } = await request.json();

    if (!audience || !subject || !body) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
        await connectDb();

        // Here we build filter based on audience
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
                ...audienceFilters[audience] ??              audienceFilters.all,
                $or: 
                [
                    { lastCampaignEmailAt: null },
                    { lastCampaignEmailAt: { $lt: threeDaysAgo } },
                ],
             };

             // Find users based on filter
              const users = await User.find(filter, {
                email: 1,
                name: 1,
                clerkId: 1 }).lean() as any[];

               if (users.length === 0) {
                return NextResponse.json({ ok: true, sent: 0, message: "No users matched" });
               }

            // Send emails 
             const FROM = process.env.RESEND_FROM ?? "hello@myhomestyler.com";
             let sent = 0;

             for (let i =0; i < users.length; i += 100) {
                const batch = users.slice(i, i + 100);

                await getResend().batch.send(
                    batch.map((u) => ({
                        from: FROM,
                        to: u.email,
                        subject,
                        react: CampaignEmail({
                            name: u.name?.split(" ")[0] || "there",
                            body,
                            ctaText,
                            ctaUrl,
                            logoUrl,
                            btnColor,
                        }),
                    }))
                );

                // Mark as emailed
                await User.updateMany(
                    { clerkId: { $in: batch.map((u) => u.clerkId) } },
                    { $set: { lastCampaignEmailAt: now } }
                );
                sent += batch.length;
             }
  
        await CampaignLog.create({ audience, subject, sent, sentBy: userId });

        return NextResponse.json({ ok: true, sent });

        

    } catch (error) {
        console.error("Error sending campaign:", error);
        return NextResponse.json({ error: "Failed to send campaign" }, { status: 500 });
    }
}