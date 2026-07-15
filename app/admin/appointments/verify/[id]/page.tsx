import AppointmentVerificationDetailContent from "@/components/admin/AppointmentVerificationDetailContent";

export const metadata = { title: "Appointment Details | MedClinical" };

export default async function VerifyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AppointmentVerificationDetailContent appointmentId={id} />;
}
