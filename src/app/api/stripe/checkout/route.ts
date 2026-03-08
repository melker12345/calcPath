import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { email, amount } = (await req.json()) as {
      email?: string;
      amount?: number;
    };

    if (!amount || amount < 100) {
      return NextResponse.json(
        { error: "Minimum donation is $1." },
        { status: 400 },
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ...(email ? { customer_email: email } : {}),
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "CalcPath Donation" },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${req.nextUrl.origin}/?donated=thanks`,
      cancel_url: `${req.nextUrl.origin}/`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe donation checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create donation checkout." },
      { status: 500 },
    );
  }
}
