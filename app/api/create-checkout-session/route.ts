import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { isValidObjectId } from "@/lib/validators";
import { createPaymentForAppointment, PaymentServiceError } from "@/services/api/payment";
import { AppointmentServiceError } from "@/services/api/appointment";
import { updatePaymentStripeSession } from "@/services/mongodb/repositories/payment.repository";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-06-24.dahlia",
});

export async function POST(req: NextRequest) {
  try {
    const { amount, description, appointmentId } = await req.json();

    if (!amount || typeof amount !== "number") {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // appointmentId is optional for now (existing booking flow doesn't create an
    // Appointment record yet) — when present, a Payment is created up front so the
    // webhook/verification step below has something concrete to mark as verified.
    let paymentId: string | undefined;
    if (appointmentId !== undefined) {
      if (!isValidObjectId(appointmentId)) {
        return NextResponse.json({ error: "Invalid appointmentId" }, { status: 400 });
      }
      const payment = await createPaymentForAppointment({ appointmentId, method: "stripe" });
      paymentId = String(payment._id);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "pkr",
            product_data: {
              name: description ?? "Consultation Fee – Dr. Zaid Gul",
              description: "Specialist Gastroenterology Consultation",
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_method_types: ["card"],
      metadata: paymentId ? { paymentId, appointmentId } : undefined,
      success_url: `${appUrl}/book-appointment/success?payment=stripe&session_id={CHECKOUT_SESSION_ID}${
        appointmentId ? `&appointmentId=${appointmentId}` : ""
      }`,
      cancel_url: `${appUrl}/book-appointment/step-5`,
    });

    if (paymentId) {
      await updatePaymentStripeSession(paymentId, session.id);
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (err instanceof PaymentServiceError || err instanceof AppointmentServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
