import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { isValidObjectId } from "@/lib/validators";
import { removeReviewAsAdmin, removeOwnReview, ReviewServiceError } from "@/services/api/review";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid review id" }, { status: 400 });
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.role === "doctor") {
      await removeReviewAsAdmin(id);
    } else {
      await removeOwnReview(id, session.userId);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ReviewServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
