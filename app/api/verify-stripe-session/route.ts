import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { findPaymentByStripeSessionId } from "@/services/mongodb/repositories/payment.repository";
import { markStripePaymentVerified, markStripePaymentFailed, attachStripePaymentIntent } from "@/services/api/payment";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-06-24.dahlia",
});

/**
 * Server-side source of truth for a Stripe Checkout Session's outcome.
 * The success page's `?payment=stripe` query param must never be trusted
 * on its own — this route (or the eventual webhook) is what actually
 * flips the linked Payment/Appointment to confirmed.
 */
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid";

    const payment = await findPaymentByStripeSessionId(sessionId);
    if (payment && payment.status !== "verified") {
      if (paid) {
        if (typeof session.payment_intent === "string") {
          await attachStripePaymentIntent(String(payment._id), session.payment_intent);
        }
        await markStripePaymentVerified(String(payment._id));
      } else if (session.status === "expired") {
        await markStripePaymentFailed(String(payment._id));
      }
    }

    return NextResponse.json({
      status: session.payment_status,
      paid,
      amount: session.amount_total,
      currency: session.currency,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
