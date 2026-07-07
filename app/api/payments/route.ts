import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { isValidObjectId, isValidPaymentMethod } from "@/lib/validators";
import { createPaymentForAppointment, getAllPayments, PaymentServiceError } from "@/services/api/payment";
import { AppointmentServiceError } from "@/services/api/appointment";
import type { PaymentStatus } from "@/types/payment";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const statusParam = req.nextUrl.searchParams.get("status") as PaymentStatus | null;
    const payments = await getAllPayments(statusParam ? { status: statusParam } : undefined);
    return NextResponse.json({ payments });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { appointmentId, method, transactionRef, receiptUrl } = body ?? {};

    if (!isValidObjectId(appointmentId)) {
      return NextResponse.json({ error: "A valid appointmentId is required" }, { status: 400 });
    }
    if (!isValidPaymentMethod(method)) {
      return NextResponse.json({ error: "A valid payment method is required" }, { status: 400 });
    }
    if (method === "stripe") {
      return NextResponse.json(
        { error: "Stripe payments are created via /api/create-checkout-session, not this endpoint" },
        { status: 400 }
      );
    }

    const payment = await createPaymentForAppointment({
      appointmentId,
      method,
      transactionRef,
      receiptUrl,
    });

    return NextResponse.json({ payment }, { status: 201 });
  } catch (err) {
    if (err instanceof PaymentServiceError || err instanceof AppointmentServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
