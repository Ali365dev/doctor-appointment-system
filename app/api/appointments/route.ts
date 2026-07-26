import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { validateCreateAppointmentBody } from "@/lib/validators";
import {
  createAppointment,
  getAllAppointments,
  getAppointmentsForPatient,
  AppointmentServiceError,
} from "@/services/api/appointment";
import type { AppointmentStatus } from "@/types/appointment";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.role === "doctor") {
      const statusParam = req.nextUrl.searchParams.get("status") as AppointmentStatus | null;
      const appointments = await getAllAppointments(statusParam ? { status: statusParam } : undefined);
      return NextResponse.json({ appointments });
    }

    const appointments = await getAppointmentsForPatient(session.userId);
    return NextResponse.json({ appointments });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validationError = validateCreateAppointmentBody(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const session = await getSession();

    const patient = {
      ...body.patient,
      email: body.patient?.email || (session?.role === "patient" ? session.email : undefined),
    };

    const appointment = await createAppointment({
      patientId: session?.role === "patient" ? session.userId : undefined,
      clinicId: body.clinicId,
      visitType: body.visitType,
      date: body.date,
      time: body.time,
      reason: body.reason,
      patient,
      paymentMethod: body.paymentMethod,
      appointmentType: body.appointmentType,
      procedureId: body.procedureId,
      referralDoctor: body.referralDoctor,
      medicalReportUrl: body.medicalReportUrl,
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (err) {
    if (err instanceof AppointmentServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
