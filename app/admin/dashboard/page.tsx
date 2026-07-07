import DashboardContent from "@/components/admin/DashboardContent";
import { getAllAppointments } from "@/services/api/appointment";
import { getAllPayments } from "@/services/api/payment";

export const metadata = { title: "Overview | MedClinical" };

export default async function DashboardOverviewPage() {
  const [appointments, payments] = await Promise.all([getAllAppointments(), getAllPayments()]);

  // Server → Client component props must be plain JSON — this normalizes
  // ObjectId/Date instances from the lean() Mongo documents into strings.
  const appointmentsJson = JSON.parse(JSON.stringify(appointments));
  const paymentsJson = JSON.parse(JSON.stringify(payments));

  return <DashboardContent appointments={appointmentsJson} payments={paymentsJson} />;
}
