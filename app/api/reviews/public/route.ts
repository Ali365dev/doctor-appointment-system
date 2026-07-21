import { NextResponse } from "next/server";
import { getPublicReviews } from "@/services/api/review";

export async function GET() {
  try {
    const result = await getPublicReviews();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
