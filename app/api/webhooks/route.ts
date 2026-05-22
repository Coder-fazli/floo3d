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

          // Idempotency check — skip credits if this exact event was already processed,
          // but still ensure the Order record exists (it may have failed on first attempt)
          const alreadyProcessed = await User.findOne({ lastInvoiceEventId: event.id }).lean();
          if (alreadyProcessed) {
            const amountPaidCheck = (invoice.amount_paid ?? 0);
            if (amountPaidCheck > 0) {
              const existingOrder = await Order.findOne({ stripeSessionId: invoice.id }).lean();
              if (!existingOrder) {
                await Order.create({
                  userId: (alreadyProcessed as any).clerkId,
                  email: (alreadyProcessed as any).email ?? invoice.customer_email,
                  plan: (alreadyProcessed as any).subscriptionPlan,
                  amount: amountPaidCheck,
                  credits: (alreadyProcessed as any).subscriptionCredits ?? 0,
                  stripeSessionId: invoice.id,
                  currency: invoice.currency,
                });
              }
            }
            return NextResponse.json({ received: true });
          }

          const subscriptionId = typeof (invoice as any).subscription === "string" ? (invoice as any).subscription : null;
          let user: any = await User.findOne({ stripeCustomerId: customerId }).lean() ??  (subscriptionId ? await User.findOne({
            subscriptionId }).lean() : null);

          // Race-condition fallback: Stripe can deliver invoice.paid before
          // checkout.session.completed, so the user may not yet have
          // stripeCustomerId/subscriptionId set. Recover by matching the
          // Stripe customer email, then self-heal by linking the IDs.
          if (!user) {
            try {
              const customer: any = await stripe.customers.retrieve(customerId);
              const custEmail = customer?.email || invoice.customer_email;
              if (custEmail) {
                user = await User.findOne({ email: custEmail }).lean();
                if (user) {
                  await User.findByIdAndUpdate(user._id, {
                    $set: {
                      stripeCustomerId: customerId,
                      ...(subscriptionId ? { subscriptionId } : {}),
                    },
                  });
                }
              }
            } catch (e) {
              console.error("invoice.paid fallback lookup failed:", (e as Error).message);
            }
          }

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

      // Subscription cancellation handling
       if (event.type === "customer.subscription.updated") {
          const subscription = event.data.object as Stripe.Subscription;

          await connectDb();
          await User.findOneAndUpdate(
            { subscriptionId: subscription.id },
            {
              $set:{
                subscriptionStatus: subscription.status,
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                cancelAt: subscription.cancel_at
                ? new Date(subscription.cancel_at * 1000)
                : null,
                currentPeriodEnd: ( subscription as any).current_period_end
                ? new Date(( subscription as any ).current_period_end * 1000)
                : null,
              },
            }
          );
       }
         
      // Subscripiton deleting handling
      if (event.type === "customer.subscription.deleted") {
         const subscription = event.data.object as Stripe.Subscription;
      
          await connectDb();
          await User.findOneAndUpdate(
            { subscriptionId: subscription.id}, 
            { 
            $set: { 
              subscriptionStatus: "canceled",
              subscriptionId: null,
              hasPurchased: false,
              subscriptionPlan: null,
              currentPeriodEnd: null,
              subscriptionCredits: null,
              cancelAtPeriodEnd: false,
              cancelAt: null,
            } }
          );
      }
       return NextResponse.json({ received: true });

       
    }


    

   