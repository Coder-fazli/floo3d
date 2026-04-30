import Stripe from "stripe";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDb } from "@/lib/db";
import User from "@/lib/models/User";
import Order from "@/lib/models/Order";
import PricingSettings from "@/lib/models/PricingSettings";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const runtime = "nodejs";

export async function POST() {
    const { userId } = await auth();
    if (!userId) 
    return NextResponse.json({ error: "Unauthorized" }, 
    { status: 401 });


await connectDb();
const user = await User.findOne({ clerkId: userId }).lean() as any;
   if (!user?.stripeCustomerId) return NextResponse.json({ error: "No payment method"}, { status: 400 });
   if (!user.autoTopUp) return NextResponse.json({ error: "Auto top-up not enabled" }, { status: 400 });

   const pricing: any = await PricingSettings.findOne().lean() ?? {};
   const pricePerCredit = pricing.topUpPricePerCredit ?? 0.5;
   const credits = user.autoTopUpCredits ?? 10;
   const amount = Math.round(pricePerCredit * credits * 100); 


const paymentMethods = await stripe.paymentMethods.list({
     customer: user.stripeCustomerId,
     type: "card",
});

const pm = paymentMethods.data[0];
if (!pm) return NextResponse.json({ error: "No saved card" },
  { status: 400 });

    let paymentIntent: Stripe.PaymentIntent;
    try {
        paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: "usd",
            customer: user.stripeCustomerId,
            payment_method: pm.id,
            confirm: true,
            off_session: true,
        });
    } catch (err: any) {
        console.error("[AutoTopUp] Stripe charge failed:", err?.message ?? err);
        return NextResponse.json(
            { error: "Payment failed: " + (err?.message ?? "card declined") },
            { status: 402 }
        );
    }

    await Promise.all([
        User.findOneAndUpdate({ clerkId: userId }, { $inc: { credits } }),
        Order.create({
            userId,
            email: user.email,
            plan: "topup",
            amount,
            credits,
            stripeSessionId: paymentIntent.id,
            currency: "usd",
        }),
    ]);

    return NextResponse.json({ ok: true, credits });
}