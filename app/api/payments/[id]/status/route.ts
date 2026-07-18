import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { isValidObjectId } from "@/lib/validators";
import { setPaymentStatus, PaymentServiceError } from "@/services/api/payment";
import { PAYMENT_STATUSES } from "@/types/payment";

/**
 * Generic payment-status setter for the admin Appointment Details panel.
 * Does not cascade to the appointment's status — admins manage both
 * independently. Approve/reject flows for manual receipts should keep
 * using /verify instead, since that intentionally cascades to the
 * appointment status.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid payment id" }, { status: 400 });
    }

    const session = await getSession();
    if (!session || session.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { status } = await req.json();
    if (typeof status !== "string" || !(PAYMENT_STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json({ error: "A valid payment status is required" }, { status: 400 });
    }

    const payment = await setPaymentStatus(id, status as (typeof PAYMENT_STATUSES)[number], session.userId);
    return NextResponse.json({ payment });
  } catch (err) {
    if (err instanceof PaymentServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
