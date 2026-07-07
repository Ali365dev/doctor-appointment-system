import { NextResponse } from "next/server";
import { isValidObjectId } from "@/lib/validators";
import { findClinicById } from "@/services/mongodb/repositories/clinic.repository";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid clinic id" }, { status: 400 });
    }

    const clinic = await findClinicById(id);
    if (!clinic || !clinic.isActive) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
    }

    return NextResponse.json({ clinic });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
