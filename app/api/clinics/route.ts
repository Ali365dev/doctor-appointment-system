import { NextResponse } from "next/server";
import { findActiveClinics } from "@/services/mongodb/repositories/clinic.repository";

export async function GET() {
  try {
    const clinics = await findActiveClinics();
    return NextResponse.json({ clinics });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
