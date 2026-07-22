import { Suspense } from "react";
import BookingStepper from "@/components/appointment/BookingStepper";
import BookingStep1Form from "@/components/appointment/BookingStep1Form";
import ClinicClosedBanner from "@/components/appointment/ClinicClosedBanner";
import { getCmsProfile } from "@/services/mongodb/repositories/cms.repository";

export async function generateMetadata() {
  const doctor = await getCmsProfile();
  return {
    title: `Book Appointment – Step 1 | ${doctor.name}`,
    description: "Select your appointment type and preferred visit method.",
  };
}

export default async function BookAppointmentStep1() {
  const doctor = await getCmsProfile();

  return (
    <main className="grow pt-32 pb-20 px-8 lg:px-20 max-w-[1280px] mx-auto w-full">
      <BookingStepper currentStep={1} />

      <header className="mb-12">
        <h1 className="text-display font-bold leading-[1.1] tracking-[-0.02em] text-on-surface">
          Select Appointment &amp; Visit Type
        </h1>
        <p className="text-body-lg text-on-surface-variant mt-2">
          Begin your booking by choosing your preferred consultation method with {doctor.name}.
        </p>
      </header>

      <ClinicClosedBanner />

      <Suspense>
        <BookingStep1Form />
      </Suspense>
    </main>
  );
}
