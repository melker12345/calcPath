import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { userId } = (await req.json()) as { userId?: string };

    if (!userId) {
      return NextResponse.json({ error: "Must be signed in." }, { status: 401 });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Server misconfigured." },
        { status: 500 },
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } },
    );

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .maybeSingle();

    const customerId = profile?.stripe_customer_id as string | null;

    if (!customerId) {
      return NextResponse.json({ invoices: [], note: "no_customer" });
    }

    let invoices;
    try {
      invoices = await stripe.invoices.list({
        customer: customerId,
        limit: 24,
      });
    } catch (stripeErr) {
      console.error("Stripe invoices list error:", stripeErr);
      return NextResponse.json(
        { error: "Could not retrieve invoices. This may be a test/live key mismatch." },
        { status: 502 },
      );
    }

    const items = invoices.data.map((inv) => ({
      id: inv.id,
      number: inv.number,
      date: inv.created,
      amountDue: inv.amount_due,
      amountPaid: inv.amount_paid,
      currency: inv.currency,
      status: inv.status,
      hostedUrl: inv.hosted_invoice_url,
      pdfUrl: inv.invoice_pdf,
    }));

    return NextResponse.json({ invoices: items });
  } catch (err) {
    console.error("Stripe invoices error:", err);
    return NextResponse.json(
      { error: "Failed to fetch invoices." },
      { status: 500 },
    );
  }
}
