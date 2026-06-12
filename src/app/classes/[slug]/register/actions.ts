"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { getClassBySlug } from "@/lib/classes";
import { registrationSchema } from "@/lib/validation";

export type RegisterState = {
  fieldErrors?: Record<string, string[]>;
  formError?: string;
};

// Build an absolute base URL for Stripe success/cancel links. Prefer an
// explicit env var; otherwise derive it from the incoming request headers.
async function getOrigin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = registrationSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const input = parsed.data;

  // Re-fetch the class server-side: never trust the price (or that the class
  // is open) from the submitted form.
  const klass = await getClassBySlug(input.slug);
  if (!klass) {
    return { formError: "This class is no longer available." };
  }
  if (klass.status === "draft" || klass.status === "closed") {
    return { formError: "Registration for this class is closed." };
  }

  const supabase = createAdminClient();
  const { data: inserted, error } = await supabase
    .from("registrations")
    .insert({
      class_id: klass.id,
      parent_first_name: input.parent_first_name,
      parent_last_name: input.parent_last_name,
      parent_email: input.parent_email,
      parent_phone: input.parent_phone,
      student_first_name: input.student_first_name,
      student_last_name: input.student_last_name,
      student_grade: input.student_grade,
      emergency_contact_name: input.emergency_contact_name || null,
      emergency_contact_phone: input.emergency_contact_phone || null,
      amount_cents: klass.price_cents,
      status: "pending_payment",
    })
    .select("id")
    .single();

  if (error) {
    return {
      formError: `We couldn't save your registration. Please try again. (${error.message})`,
    };
  }

  // Create a Stripe Checkout Session for this registration. Price is taken from
  // our DB (klass.price_cents), never from the client.
  const origin = await getOrigin();
  let checkoutUrl: string;

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: input.parent_email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: klass.price_cents,
            product_data: {
              name: klass.title,
              description: `Tuition for ${input.student_first_name} ${input.student_last_name}`,
            },
          },
        },
      ],
      metadata: {
        registration_id: inserted.id,
        class_id: klass.id,
        slug: input.slug,
      },
      success_url: `${origin}/classes/${input.slug}/register/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/classes/${input.slug}/register?canceled=1`,
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }
    checkoutUrl = session.url;

    // Persist the session id so the webhook (and success page) can match the
    // payment back to this registration.
    await supabase
      .from("registrations")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", inserted.id);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return {
      formError: `We saved your registration but couldn't start checkout: ${message}`,
    };
  }

  // redirect() throws, so it must live outside the try/catch above.
  redirect(checkoutUrl);
}
