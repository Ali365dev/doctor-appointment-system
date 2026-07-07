import { NextResponse } from "next/server";
import { isValidObjectId } from "@/lib/validators";
import { getAppointmentConfirmation, AppointmentServiceError } from "@/services/api/appointment";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid appointment id" }, { status: 400 });
    }

    const confirmation = await getAppointmentConfirmation(id);
    return NextResponse.json({ confirmation });
  } catch (err) {
    if (err instanceof AppointmentServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
