import { notFound } from "next/navigation";
import ProcedureDetailContent from "@/components/public/ProcedureDetailContent";
import { findProcedureBySlug } from "@/services/mongodb/repositories/procedure.repository";
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

  return (
    <ProcedureDetailContent
      procedure={{
        id: String(procedure._id),
        name: procedure.name,
        fullDescription: procedure.fullDescription,
        shortDescription: procedure.shortDescription,
        pricePkr: startingPrice,
        durationMinutes: procedure.durationMinutes,
        image: procedure.image ?? undefined,
        benefits: procedure.benefits ?? [],
        risks: procedure.risks ?? [],
        preparationInstructions: procedure.preparationInstructions,
        recoveryTime: procedure.recoveryTime,
        faqs: procedure.faqs ?? [],
      }}
      clinics={clinics}
    />
  );
}
