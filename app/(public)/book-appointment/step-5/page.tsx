import BookingStepper from "@/components/appointment/BookingStepper";
import BookingStep5Content from "@/components/appointment/BookingStep5Content";
import ClinicClosedBanner from "@/components/appointment/ClinicClosedBanner";
import { getCmsProfile } from "@/services/mongodb/repositories/cms.repository";

export async function generateMetadata() {
  const doctor = await getCmsProfile();
  return {
    title: `Secure Payment – Step 5 | ${doctor.name}`,
    description: "Complete your payment to confirm your appointment.",
  };
}

export default function BookAppointmentStep5() {
  return (
    <main className="grow pt-32 pb-16 px-8 lg:px-20 max-w-[1280px] mx-auto w-full min-h-screen">
      <BookingStepper currentStep={5} />
      <ClinicClosedBanner />
      <BookingStep5Content />
    </main>
  );
}
