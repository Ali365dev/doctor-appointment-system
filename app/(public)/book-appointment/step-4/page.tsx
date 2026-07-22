import BookingStepper from "@/components/appointment/BookingStepper";
import BookingStep4Content from "@/components/appointment/BookingStep4Content";
import ClinicClosedBanner from "@/components/appointment/ClinicClosedBanner";
import { getCmsProfile } from "@/services/mongodb/repositories/cms.repository";

export async function generateMetadata() {
  const doctor = await getCmsProfile();
  return {
    title: `Book Appointment – Step 4 | ${doctor.name}`,
    description: "Review your appointment details before payment.",
  };
}

export default function BookAppointmentStep4() {
  return (
    <main className="grow pt-32 pb-20 px-4 md:px-8 lg:px-20 max-w-[1280px] mx-auto w-full min-h-screen">
      <BookingStepper currentStep={4} />
      <ClinicClosedBanner />
      <BookingStep4Content />
    </main>
  );
}
