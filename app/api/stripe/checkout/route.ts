import Stripe from "stripe";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDb } from "@/lib/db";
import PricingSettings from "@/lib/models/PricingSettings";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { plan, returnUrl } = await request.json();
    if (!["starter", "pro", "elite"].includes(plan)) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

    await connectDb();
    const pricing: any = await PricingSettings.findOne().lean() ?? {};
    const PLANS = {
      starter: { credits: pricing.starterCredits ?? 100, amount: Math.round((pricing.starterPrice ?? 9.99) * 100),  label: `Starter — ${pricing.starterCredits ?? 100} Credits` },
      pro:     { credits: pricing.proCredits ?? 300,     amount: Math.round((pricing.proPrice ?? 24.99) * 100),     label: `Pro — ${pricing.proCredits ?? 300} Credits` },
      elite:   { credits: pricing.eliteCredits ?? 300,   amount: Math.round((pricing.elitePrice ?? 49.99) * 100),   label: `Elite — ${pricing.eliteCredits ?? 300} Credits` },
    };
    const planData = PLANS[plan as keyof typeof PLANS];

    const origin = request.headers.get("origin") ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: planData.amount,
            product_data: {
              name: planData.label,
              description: `${planData.credits} AI generation credits for MyHomeStyler. Credits never expire.`,
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
