import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendConfirmationEmail } from "@/lib/email";

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
        const justPaid = await markRegistrationPaid(event.data.object);
        // Only email on a real pending -> paid transition, so Stripe's webhook
        // retries never send duplicate confirmations. Email is best-effort and
        // never fails the webhook (payment is already recorded).
        if (justPaid) {
          await sendConfirmationEmail({
            to: justPaid.parent_email,
            studentFirstName: justPaid.student_first_name,
            studentLastName: justPaid.student_last_name,
            className: justPaid.class_title,
            amountCents: justPaid.amount_cents,
          });
        }
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

type PaidRegistration = {
  parent_email: string;
  student_first_name: string;
  student_last_name: string;
  amount_cents: number;
  class_title: string;
};

// Flips a registration to paid. Returns the registration details only when it
// actually transitioned from a non-paid state (so callers can send a one-time
// confirmation email); returns null if it was already paid or not found.
async function markRegistrationPaid(
  session: Stripe.Checkout.Session,
): Promise<PaidRegistration | null> {
  const registrationId = session.metadata?.registration_id;

  // Only act on fully-paid sessions we can trace back to a registration.
  if (!registrationId || session.payment_status !== "paid") return null;

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("registrations")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId,
    })
    .eq("id", registrationId)
    // The `neq` guard means retries (row already paid) match nothing and
    // return no row — our idempotency signal for the confirmation email.
    .neq("status", "paid")
    .select(
      "parent_email, student_first_name, student_last_name, amount_cents, classes ( title )",
    )
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to mark registration paid: ${error.message}`);
  }
  if (!data) return null;

  const classes = (data as { classes: unknown }).classes;
  const classTitle = Array.isArray(classes)
    ? ((classes[0] as { title?: string })?.title ?? "your class")
    : ((classes as { title?: string } | null)?.title ?? "your class");

  return {
    parent_email: data.parent_email,
    student_first_name: data.student_first_name,
    student_last_name: data.student_last_name,
    amount_cents: data.amount_cents,
    class_title: classTitle,
  };
}
