  import Stripe from "stripe";
  import { NextResponse } from "next/server";
  import { connectDb } from "@/lib/db";
  import User from "@/lib/models/User";
  import PricingSettings from "@/lib/models/PricingSettings";

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

     
    // Handleing the checkout session conpletion event to update user subscription status and credits 

     if(event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription") return NextResponse.json({
        received: true });

        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;

        if (userId) {
           await connectDb();
           await User.findOneAndUpdate(
            { clerkId: userId },
            { $set: {
                stripeCustomerId: session.customer as string,
                subscriptionId: session.subscription as string,
                subscriptionPlan: plan,
                subscriptionStatus: "active",
                subscriptionCredits: parseInt(session.metadata?.credits ?? "0", 10),
                hasPurchased: true,
             }}
           );
        }
     }
   
   if (event.type === "invoice.paid") {
          const invoice = event.data.object as Stripe.Invoice;
          const customerId = invoice.customer as string;
          const periodEnd = new Date(((
            invoice.lines.data[0]?.period?.end ?? 0) * 1000));

          await connectDb();
          const subscriptionId = typeof (invoice as any).subscription === "string" ? (invoice as any).subscription : null;
          const user = await User.findOne({ stripeCustomerId: customerId }).lean() ??  (subscriptionId ? await User.findOne({
            subscriptionId }).lean() : null);
          if (user ) {
            const pricing: any = await 
            PricingSettings.findOne().lean() ?? {};
            const PLAN_CREDITS: Record<string, number> = {
                starter: pricing.starterCredits ?? 100,
                pro: pricing.proCredits ?? 300,
                elite: pricing.eliteCredits ?? 300
            };
            const credits = (user as any).subscriptionPlan === "custom"
              ? ((user as any).subscriptionCredits ?? 0)
              : PLAN_CREDITS[(user as any).subscriptionPlan] ?? 0;
             await User.findByIdAndUpdate(
                (user as any)._id,
              { $set: { credits, subscriptionStatus: "active", 
                currentPeriodEnd: periodEnd } }
             );
          }
       }

          // Invoice payment failure
        if (event.type === "invoice.payment_failed") {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        await connectDb();
        await User.findOneAndUpdate(
          { stripeCustomerId: customerId },
          { $set: { subscriptionStatus: "past_due" }}
        );
      }
         
      // Subscripiton cancellation handling
      if (event.type === "customer.subscription.deleted") {
         const subscription = event.data.object as Stripe.Subscription;
      
          await connectDb();
          await User.findOneAndUpdate(
            { subscriptionId: subscription.id}, 
          { $set: { 
              subscriptionStatus: "canceled",
              subscriptionId: null,
              hasPurchased: false,
            } }
          );
      }
       return NextResponse.json({ received: true });

       
    }



    

   