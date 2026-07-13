import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { isValidObjectId, validateProcedureBody, deriveProcedurePrice, slugify } from "@/lib/validators";
import {
  findProcedureById,
  updateProcedure,
  deleteProcedure,
  isSlugTaken,
} from "@/services/mongodb/repositories/procedure.repository";
import { deleteUploadedAsset } from "@/services/cloudinary";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid procedure id" }, { status: 400 });
    }

    const procedure = await findProcedureById(id);
    if (!procedure) {
      return NextResponse.json({ error: "Procedure not found" }, { status: 404 });
    }

    return NextResponse.json({ procedure });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid procedure id" }, { status: 400 });
    }

    const session = await getSession();
    if (!session || session.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const error = validateProcedureBody(body, true);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const update: Record<string, unknown> = {};
    if (body.name !== undefined) update.name = body.name.trim();
    if (body.shortDescription !== undefined) update.shortDescription = body.shortDescription.trim();
    if (body.fullDescription !== undefined) update.fullDescription = body.fullDescription.trim();
    if (body.location !== undefined) update.location = body.location.trim();
    if (body.originalPricePkr !== undefined) update.originalPricePkr = body.originalPricePkr;
    if (body.discountPercent !== undefined) update.discountPercent = body.discountPercent;
    if (body.isActive !== undefined) update.isActive = body.isActive;
    if (body.isArchived !== undefined) update.isArchived = body.isArchived;
    if (body.order !== undefined) update.order = body.order;
    if (body.durationMinutes !== undefined) update.durationMinutes = body.durationMinutes;
    if (body.benefits !== undefined) update.benefits = body.benefits;
    if (body.risks !== undefined) update.risks = body.risks;
    if (body.preparationInstructions !== undefined) update.preparationInstructions = body.preparationInstructions.trim();
    if (body.recoveryTime !== undefined) update.recoveryTime = body.recoveryTime.trim();
    if (body.faqs !== undefined) update.faqs = body.faqs;

    if (body.slug !== undefined && body.slug.trim()) {
      const slug = slugify(body.slug);
      if (!slug) {
        return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
      }
      if (await isSlugTaken(slug, id)) {
        return NextResponse.json({ error: "A procedure with this slug already exists" }, { status: 409 });
      }
      update.slug = slug;
    }

    // Price is derived from originalPricePkr/discountPercent unless explicitly overridden.
    if (body.pricePkr !== undefined) {
      update.pricePkr = body.pricePkr;
    } else if (body.originalPricePkr !== undefined || body.discountPercent !== undefined) {
      const current = await findProcedureById(id);
      if (!current) {
        return NextResponse.json({ error: "Procedure not found" }, { status: 404 });
      }
      const originalPricePkr = body.originalPricePkr ?? current.originalPricePkr;
      const discountPercent = body.discountPercent ?? current.discountPercent;
      update.pricePkr = deriveProcedurePrice(originalPricePkr, discountPercent);
    }

    const procedure = await updateProcedure(id, update);
    if (!procedure) {
      return NextResponse.json({ error: "Procedure not found" }, { status: 404 });
    }

    return NextResponse.json({ procedure });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid procedure id" }, { status: 400 });
    }

    const session = await getSession();
    if (!session || session.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existing = await findProcedureById(id);
    const deleted = await deleteProcedure(id);
    if (!deleted) {
      return NextResponse.json({ error: "Procedure not found" }, { status: 404 });
    }
    if (existing?.imagePublicId) {
      await deleteUploadedAsset(existing.imagePublicId);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
