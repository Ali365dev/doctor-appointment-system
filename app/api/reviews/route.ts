import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { validateReviewBody } from "@/lib/validators";
import { submitReview, getReviewsForPatient, getAllReviewsForAdmin, ReviewServiceError } from "@/services/api/review";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.role === "doctor") {
      const reviews = await getAllReviewsForAdmin();
      return NextResponse.json({ reviews });
    }

    const reviews = await getReviewsForPatient(session.userId);
    return NextResponse.json({ reviews });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "patient") {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const error = validateReviewBody(body);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const review = await submitReview({
      patientId: session.userId,
      appointmentId: body.appointmentId,
      rating: body.rating,
      comment: body.comment,
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    if (err instanceof ReviewServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
