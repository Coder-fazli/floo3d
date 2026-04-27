import Stripe from "stripe";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDb } from "@/lib/db";
import PricingSettings from "@/lib/models/PricingSettings";
import User from "@/lib/models/User";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { plan, returnUrl, price: customPrice, credits: customCredits } = await request.json();
    if (!["starter", "pro", "elite", "custom"].includes(plan)) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

    if (plan === "custom") {
      if (!customPrice || customPrice <= 0 || !customCredits || customCredits <= 0) {
        return NextResponse.json({ error: "Custom price and credits must be greater than 0" }, { status: 400 });
      }
      await connectDb();
      const user: any = await User.findOne({ clerkId: userId }).lean();
      const origin = request.headers.get("origin") ?? "http://localhost:3000";
      const session = await stripe.checkout.sessions.create({
         mode: "subscription",
         customer: user?.stripeCustomerId || undefined,
         customer_email: user?.stripeCustomerId ? undefined : (user?.email || undefined),
         line_items: [{
         quantity: 1,
         price_data: {
         currency: "usd",
         unit_amount: Math.round(customPrice * 100),
         recurring: { interval: "month" },
         product_data: {
         name: `Custom Pack — ${customCredits} Credits`,
         description: `${customCredits} credits refreshed every month. ${Math.floor(customCredits / 2)} AI renders/mo.`,
          },
        },
      }],
      metadata: { userId, plan: "custom", credits:
  customCredits.toString() },
      success_url: `${returnUrl ??
  origin}?success=1&plan=custom`,
      cancel_url: `${origin}/pricing?canceled=1`,
    });
    return NextResponse.json({ url: session.url });
    }
  
    await connectDb();
    const pricing: any = await PricingSettings.findOne().lean() ?? {};
    const user: any = await User.findOne({ clerkId: userId }).lean();
    const PLANS = {
      starter: { credits: pricing.starterCredits ?? 100, amount: Math.round((pricing.starterPrice ?? 9.99) * 100),  label: `Starter — ${pricing.starterCredits ?? 100} Credits` },
      pro:     { credits: pricing.proCredits ?? 300,     amount: Math.round((pricing.proPrice ?? 24.99) * 100),     label: `Pro — ${pricing.proCredits ?? 300} Credits` },
      elite:   { credits: pricing.eliteCredits ?? 300,   amount: Math.round((pricing.elitePrice ?? 49.99) * 100),   label: `Elite — ${pricing.eliteCredits ?? 300} Credits` },
    };
    const planData = PLANS[plan as keyof typeof PLANS];

    const origin = request.headers.get("origin") ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: user?.stripeCustomerId || undefined,
      customer_email: user?.stripeCustomerId ? undefined : (user?.email || undefined),
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: planData.amount,
            recurring: { interval: "month" },
            product_data: {
              name: planData.label,
              description: `${planData.credits} AI credits refreshed monthly for MyHomeStyler.`,
            },
          },
        },
      ],
      metadata: {
        userId,
        plan,
        credits: planData.credits.toString(),
      },
      success_url: `${returnUrl ?? origin}?success=1&plan=${plan}`,
      cancel_url:  `${returnUrl ?? `${origin}/pricing`}?canceled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error?.message);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
