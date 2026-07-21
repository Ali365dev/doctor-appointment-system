import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { isValidObjectId, isValidReviewStatus } from "@/lib/validators";
import { moderateReview, ReviewServiceError } from "@/services/api/review";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid review id" }, { status: 400 });
    }

    const session = await getSession();
    if (!session || session.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    if (!isValidReviewStatus(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const review = await moderateReview(id, body.status);
    return NextResponse.json({ review });
  } catch (err) {
    if (err instanceof ReviewServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
