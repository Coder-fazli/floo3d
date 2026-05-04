import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";
import { connectDb } from "@/lib/db";
import User from "@/lib/models/User";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
    try {
        const { userId, sessionClaims } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
         
        const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
        if (role !== "admin") {
           return NextResponse.json({ error: "Forbidden" }, { status: 403 });  
        }
   
         const { clerkId } = await request.json();
         if (!clerkId) {
            return NextResponse.json({ error: "Missing clerkId" }, { status: 400 });
         }

        await connectDb();

        const targetUser = await User.findOne({ clerkId });
        if (!targetUser) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
         }

         if (!targetUser.subscriptionId) {
            return NextResponse.json({ error: "User has no active subscription" }, { status: 400 });
         }

         const subscription = await stripe.subscriptions.update(targetUser.subscriptionId, {
            cancel_at_period_end: true
         });

         await User.findOneAndUpdate(
            { clerkId }, 
            {
               $set: { 
                subscriptionStatus: subscription.status,
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                cancelAt: subscription.cancel_at
                  ? new Date(subscription.cancel_at * 1000)
                  : targetUser.currentPeriodEnd,
            },
         }
        );
         return NextResponse.json(
            {
                ok: true,
                message: "Subscription canceled successfully",
                clerkId,
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                cancelAt: subscription.cancel_at,
            }, 
                { status: 200 }
            );


    } catch (error: any) {
        console.error("[admin-cancel-user-subscription]", error?.message ?? error);
       return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 });
    }
}