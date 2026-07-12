import ClinicFormContent from "@/components/admin/ClinicFormContent";

export const metadata = {
  title: "Edit Clinic | Admin",
};

export default async function AdminEditClinicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClinicFormContent clinicId={id} />;
}
