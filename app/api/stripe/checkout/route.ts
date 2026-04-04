import Stripe from "stripe";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PLANS = {
  starter: { credits: 100, amount: 999,  label: "Starter — 100 Credits" },
  pro:     { credits: 300, amount: 2499, label: "Pro — 300 Credits" },
};

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { plan } = await request.json();
    const planData = PLANS[plan as keyof typeof PLANS];
    if (!planData) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

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
      success_url: `${origin}/pricing?success=1&plan=${plan}`,
      cancel_url:  `${origin}/pricing?canceled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error?.message);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
