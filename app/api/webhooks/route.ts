  import Stripe from "stripe";
  import { NextResponse } from "next/server";
  import { connectDb } from "@/lib/db";
  import User from "@/lib/models/User";

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
      }
    }   

        return NextResponse.json({ received: true });
    }