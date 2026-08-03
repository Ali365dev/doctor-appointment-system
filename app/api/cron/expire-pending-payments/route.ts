import { NextRequest, NextResponse } from "next/server";
import { expireStalePendingPaymentAppointments } from "@/services/api/appointment";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }
  if (req.headers.get("x-cron-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { expiredCount, expiredIds } = await expireStalePendingPaymentAppointments();
    return NextResponse.json({ expiredCount, expiredIds });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
