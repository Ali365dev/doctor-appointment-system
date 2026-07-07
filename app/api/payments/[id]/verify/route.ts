import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { isValidObjectId } from "@/lib/validators";
import { verifyManualPayment, PaymentServiceError } from "@/services/api/payment";

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

    const { approve, rejectionReason } = await req.json();
    if (typeof approve !== "boolean") {
      return NextResponse.json({ error: "'approve' must be a boolean" }, { status: 400 });
    }

    const payment = await verifyManualPayment(id, approve, session.userId, rejectionReason);
    return NextResponse.json({ payment });
  } catch (err) {
    if (err instanceof PaymentServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
