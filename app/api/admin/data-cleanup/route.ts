import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { previewDataCleanup, runDataCleanup, DataCleanupError } from "@/services/api/dataCleanup";

/** Preview (and export source data for) appointments+payments in a date range, before deleting. */
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const from = req.nextUrl.searchParams.get("from") ?? "";
    const to = req.nextUrl.searchParams.get("to") ?? "";
    const preview = await previewDataCleanup(from, to);
    return NextResponse.json({ preview });
  } catch (err) {
    if (err instanceof DataCleanupError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Permanently deletes appointments (and their linked payments) with date in [from, to]. */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { from, to } = body as { from?: string; to?: string };
    const result = await runDataCleanup(from ?? "", to ?? "");
    return NextResponse.json({ result });
  } catch (err) {
    if (err instanceof DataCleanupError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
