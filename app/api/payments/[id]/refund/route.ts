import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSession } from "@/lib/auth/getSession";
import { isValidObjectId } from "@/lib/validators";
import { getPaymentById, markPaymentAsRefunded, PaymentServiceError } from "@/services/api/payment";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-06-24.dahlia",
});

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid payment id" }, { status: 400 });
    }

    const session = await getSession();
    if (!session || session.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const payment = await getPaymentById(id);
    if (payment.method !== "stripe") {
      return NextResponse.json({ error: "Only Stripe payments can be refunded here" }, { status: 400 });
    }
    if (payment.status !== "verified") {
      return NextResponse.json({ error: "Only a verified (paid) payment can be refunded" }, { status: 400 });
    }
    if (!payment.stripePaymentIntentId) {
      return NextResponse.json({ error: "No Stripe payment intent recorded for this payment" }, { status: 400 });
    }

    await stripe.refunds.create({ payment_intent: payment.stripePaymentIntentId });

    const updated = await markPaymentAsRefunded(id, session.userId);
    return NextResponse.json({ payment: updated });
  } catch (err) {
    if (err instanceof PaymentServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Refund failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
