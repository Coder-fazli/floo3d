import Stripe from "stripe";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDb } from "@/lib/db";
import User from "@/lib/models/User";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(){
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });        
    }

 
 try {
   await connectDb();
    const user: any = await User.findOne({
        clerkId: userId
    });
    if (!user?.subscriptionId) {
        return NextResponse.json({ error: "No active subscription" }, { status: 400 });
    }

   const subscription = await stripe.subscriptions.update(user.subscriptionId, { cancel_at_period_end: true });


    await User.findOneAndUpdate(
        { clerkId: userId },
        {
            $set: {
                subscriptionStatus: subscription.status,
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : user.currentPeriodEnd,
            },
        }
    );

    return NextResponse.json( {
        success: true,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        cancelAt: subscription.cancel_at,
    } );

 } catch (error) {
    return NextResponse.json({ error: "Error occurred while processing cancellation" }, { status: 500 });
 }


}

