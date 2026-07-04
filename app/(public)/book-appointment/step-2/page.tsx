import BookingStepper from "@/components/appointment/BookingStepper";
import BookingStep2Content from "@/components/appointment/BookingStep2Content";
import { doctor } from "@/lib/data";

export const metadata = {
  title: `Book Appointment – Step 2 | ${doctor.name}`,
  description: "Select your preferred date and time.",
};

export default function BookAppointmentStep2() {
  return (
    <main className="grow pt-32 pb-20 px-8 lg:px-20 max-w-[1280px] mx-auto w-full min-h-screen">
      <BookingStepper currentStep={2} />
      <BookingStep2Content />
    </main>
  );
}
