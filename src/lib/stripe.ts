import "server-only";
import Stripe from "stripe";

// Server-only Stripe client. The secret key must never reach the browser, so
// this module guards against client imports via `server-only`.
let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (cached) return cached;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable.");
  }

  cached = new Stripe(secretKey);
  return cached;
}
