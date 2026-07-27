import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

// Stripe signature verification needs the raw, unparsed body and Node crypto,
// so force the Node.js runtime and read the body as text.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        await markRegistrationPaid(event.data.object);
        break;
      }
      default:
        // Ignore other event types for now.
        break;
    }
  } catch (err) {
    // Returning 500 tells Stripe to retry the delivery later.
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Error handling ${event.type}:`, message);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function markRegistrationPaid(session: Stripe.Checkout.Session) {
  const registrationId = session.metadata?.registration_id;

  // Only act on fully-paid sessions we can trace back to a registration.
  if (!registrationId || session.payment_status !== "paid") return;

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("registrations")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId,
    })
    .eq("id", registrationId);

  if (error) {
    throw new Error(`Failed to mark registration paid: ${error.message}`);
  }
}
