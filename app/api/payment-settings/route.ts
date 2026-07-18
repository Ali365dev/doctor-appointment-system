import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { validatePaymentSettingsBody } from "@/lib/validators";
import { getPaymentSettings, updatePaymentSettings } from "@/services/mongodb/repositories/paymentSettings.repository";

/** Public — the booking flow needs these numbers to show patients where to send payment. */
export async function GET() {
  try {
    const settings = await getPaymentSettings();
    return NextResponse.json({ settings });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const error = validatePaymentSettingsBody(body);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const settings = await updatePaymentSettings(body);
    return NextResponse.json({ settings });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
