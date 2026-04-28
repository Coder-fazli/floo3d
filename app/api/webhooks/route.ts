  import Stripe from "stripe";
  import { NextResponse } from "next/server";
  import { connectDb } from "@/lib/db";
  import User from "@/lib/models/User";
  import Order from "@/lib/models/Order";
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

          // Idempotency check — skip if this exact event was already processed
          const alreadyProcessed = await User.findOne({ lastInvoiceEventId: event.id }).lean();
          if (alreadyProcessed) return NextResponse.json({ received: true });

          const subscriptionId = typeof (invoice as any).subscription === "string" ? (invoice as any).subscription : null;
          const user = await User.findOne({ stripeCustomerId: customerId }).lean() ??  (subscriptionId ? await User.findOne({
            subscriptionId }).lean() : null);
          if (user) {
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
                currentPeriodEnd: periodEnd, lastInvoiceEventId: event.id } }
             );

             // Record payment so analytics can track subscription revenue
             const amountPaid = invoice.amount_paid ?? 0;
             if (amountPaid > 0) {
               await Order.findOneAndUpdate(
                 { stripeSessionId: invoice.id },
                 {
                   $setOnInsert: {
                     userId: (user as any).clerkId,
                     email: (user as any).email ?? invoice.customer_email,
                     plan: (user as any).subscriptionPlan,
                     amount: amountPaid,
                     credits,
                     stripeSessionId: invoice.id,
                     currency: invoice.currency,
                   }
                 },
                 { upsert: true }
               );
             }
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



    

   