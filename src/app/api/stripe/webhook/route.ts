import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

// Disable body parsing — Stripe needs the raw body for signature verification
export const dynamic = "force-dynamic";

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

/**
 * Given a Stripe subscription, update the Supabase profile.
 */
async function upsertSubscription(subscription: Stripe.Subscription) {
  const supabase = getAdminSupabase();
  const userId =
    subscription.metadata?.supabase_user_id ??
    (typeof subscription.customer === "string"
      ? await resolveUserByCustomer(subscription.customer)
      : null);

  if (!userId) {
    console.error("Webhook: could not resolve supabase user for subscription", subscription.id);
    return;
  }

  const status = subscription.status; // "active", "trialing", "past_due", "canceled", "unpaid", etc.
  const isActive = status === "active" || status === "trialing";

  const currentPeriodEnd = subscription.items.data[0]?.current_period_end;
  const proUntil = currentPeriodEnd
    ? new Date(currentPeriodEnd * 1000).toISOString()
    : null;

  const { error } = await supabase
    .from("profiles")
    .update({
      plan: isActive ? "pro" : "free",
      pro_until: isActive ? proUntil : null,
      stripe_subscription_id: subscription.id,
    })
    .eq("id", userId);

  if (error) {
    console.error("Webhook: failed to update profile:", error.message);
  } else {
    console.log(`Webhook: updated user ${userId} → plan=${isActive ? "pro" : "free"}, until=${proUntil}`);
  }
}

/**
 * Look up Supabase user ID by Stripe customer ID.
 */
async function resolveUserByCustomer(customerId: string): Promise<string | null> {
  const supabase = getAdminSupabase();
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.id ?? null;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  // If we have a webhook secret, verify the signature. Otherwise accept (dev mode).
  let event: Stripe.Event;

  if (process.env.STRIPE_WEBHOOK_SECRET) {
    if (!sig) {
      return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
    }
    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } else {
    // Dev mode: parse the event without verifying
    event = JSON.parse(body) as Stripe.Event;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await upsertSubscription(subscription);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await upsertSubscription(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = (invoice as unknown as { subscription?: string }).subscription ?? null;
        if (subId) {
          const subscription = await stripe.subscriptions.retrieve(subId);
          await upsertSubscription(subscription);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn("Payment failed for invoice:", invoice.id);
        // The subscription status will be updated via customer.subscription.updated
        break;
      }

      default:
        // Unhandled event type — that's fine
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
