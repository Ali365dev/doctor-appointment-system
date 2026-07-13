import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { validateProcedureBody, deriveProcedurePrice, slugify } from "@/lib/validators";
import {
  findActiveProcedures,
  findAllProcedures,
  createProcedure,
  isSlugTaken,
} from "@/services/mongodb/repositories/procedure.repository";

export async function GET() {
  try {
    const session = await getSession();
    const procedures =
      session?.role === "doctor" ? await findAllProcedures() : await findActiveProcedures();
    return NextResponse.json({ procedures });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const error = validateProcedureBody(body);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const discountPercent = body.discountPercent ?? 0;
    const pricePkr = body.pricePkr ?? deriveProcedurePrice(body.originalPricePkr, discountPercent);

    const slug = body.slug?.trim() ? slugify(body.slug) : slugify(body.name);
    if (!slug) {
      return NextResponse.json({ error: "Could not derive a slug from the name" }, { status: 400 });
    }
    if (await isSlugTaken(slug)) {
      return NextResponse.json({ error: "A procedure with this slug already exists" }, { status: 409 });
    }

    const procedure = await createProcedure({
      name: body.name.trim(),
      slug,
      shortDescription: body.shortDescription?.trim() ?? "",
      fullDescription: body.fullDescription?.trim() ?? "",
      location: body.location.trim(),
      pricePkr,
      originalPricePkr: body.originalPricePkr,
      discountPercent,
      isActive: body.isActive ?? true,
      isArchived: body.isArchived ?? false,
      order: body.order ?? 0,
      durationMinutes: body.durationMinutes ?? 30,
      benefits: body.benefits ?? [],
      risks: body.risks ?? [],
      preparationInstructions: body.preparationInstructions?.trim() ?? "",
      recoveryTime: body.recoveryTime?.trim() ?? "",
      faqs: body.faqs ?? [],
    });

    return NextResponse.json({ procedure }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
