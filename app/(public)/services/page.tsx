import ServicesContent from "@/components/public/ServicesContent";
import { findActiveProcedures } from "@/services/mongodb/repositories/procedure.repository";
import { findProcedureIdsWithActiveAssignment } from "@/services/mongodb/repositories/clinicProcedure.repository";

export const metadata = {
  title: "Procedures & Pricing | Dr. Zaid Gul",
  description:
    "Specialized gastroenterology procedures with transparent pricing. Colonoscopy, Endoscopy, ERCP, and more at Faisal Hospital, Faisalabad.",
};

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const [docs, bookableIds] = await Promise.all([findActiveProcedures(), findProcedureIdsWithActiveAssignment()]);
  const procedures = docs
    .filter((p) => bookableIds.has(String(p._id)))
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

  return <ServicesContent procedures={procedures} />;
}
