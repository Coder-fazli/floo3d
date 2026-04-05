  import Stripe from "stripe";
  import { NextResponse } from "next/server";
  import { connectDb } from "@/lib/db";
  import User from "@/lib/models/User";
  import Order from "@/lib/models/Order";

  export const runtime = "nodejs";

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!) 
  
  
  export async function POST(request: Request)
  {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");
    if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (error) {
        return NextResponse.json({ error: "Invalid signature: " + (error as Error).message }, { status: 400 });
    }

     if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const credits = parseInt(session.metadata?.credits ?? "0");

        if (userId && credits > 0) {
            await connectDb();
            await User.findOneAndUpdate(
              { clerkId: userId },
              { $inc: { credits }, $set: { hasPurchased: true } }
            );

            // Fetch charge details from payment intent
            let country = null, paymentMethod = null, receiptUrl = null, paymentIntent = null, currency = null;
            try {
              if (session.payment_intent) {
                const pi = await stripe.paymentIntents.retrieve(session.payment_intent as string, { expand: ["latest_charge"] });
                const charge = pi.latest_charge as any;
                country = charge?.billing_details?.address?.country ?? null;
                paymentMethod = charge?.payment_method_details?.type ?? null;
                receiptUrl = charge?.receipt_url ?? null;
                currency = charge?.currency ?? null;
                paymentIntent = pi.id;
              }
            } catch {}

            await Order.create({
                   userId,
                   email: session.customer_details?.email,
                   plan: session.metadata?.plan,
                   amount: session.amount_total,
                   credits,
                   stripeSessionId: session.id,
                   paymentIntent,
                   paymentMethod,
                   country,
                   receiptUrl,
                   currency,
            })
      }
    }   

        return NextResponse.json({ received: true });
    }