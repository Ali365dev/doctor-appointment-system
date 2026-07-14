import { notFound } from "next/navigation";
import ProcedureDetailContent from "@/components/public/ProcedureDetailContent";
import { findActiveProcedures, findProcedureBySlug } from "@/services/mongodb/repositories/procedure.repository";
import { findAssignmentsForProcedure } from "@/services/mongodb/repositories/clinicProcedure.repository";

export const dynamic = "force-dynamic";

export default async function ProcedureDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const procedure = await findProcedureBySlug(slug);
  if (!procedure || procedure.isArchived) {
    notFound();
  }

  const assignments = await findAssignmentsForProcedure(String(procedure._id));
  const clinics = assignments
    .filter((a) => a.isActive && a.clinicId && typeof a.clinicId === "object")
    .map((a) => {
      const clinic = a.clinicId as unknown as { _id: unknown; name: string; city: string; address?: string };
      return {
        id: String(clinic._id),
        name: clinic.name,
        city: clinic.city,
        address: clinic.address,
        priceOverridePkr: a.priceOverridePkr ?? undefined,
      };
    });

  const startingPrice = clinics.length
    ? Math.min(procedure.pricePkr, ...clinics.map((c) => c.priceOverridePkr ?? procedure.pricePkr))
    : procedure.pricePkr;

  const allProcedures = await findActiveProcedures();
  const related = allProcedures
    .filter((p) => String(p._id) !== String(procedure._id))
    .slice(0, 3)
    .map((p) => ({
      id: String(p._id),
      name: p.name,
      slug: p.slug,
      shortDescription: p.shortDescription,
      fullDescription: p.fullDescription,
      location: p.location,
      pricePkr: p.pricePkr,
      originalPricePkr: p.originalPricePkr,
      discountPercent: p.discountPercent,
      durationMinutes: p.durationMinutes,
      image: p.image ?? undefined,
    }));

  return (
    <ProcedureDetailContent
      procedure={{
        id: String(procedure._id),
        name: procedure.name,
        fullDescription: procedure.fullDescription,
        shortDescription: procedure.shortDescription,
        pricePkr: startingPrice,
        originalPricePkr: procedure.originalPricePkr,
        discountPercent: procedure.discountPercent,
        durationMinutes: procedure.durationMinutes,
        image: procedure.image ?? undefined,
        benefits: procedure.benefits ?? [],
        risks: procedure.risks ?? [],
        preparationInstructions: procedure.preparationInstructions,
        recoveryTime: procedure.recoveryTime,
        faqs: procedure.faqs ?? [],
      }}
      clinics={clinics}
      related={related}
    />
  );
}
