import PatientDetailContent from "@/components/admin/PatientDetailContent";

export const metadata = { title: "Patient Details | MedClinical" };

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PatientDetailContent patientId={id} />;
}
