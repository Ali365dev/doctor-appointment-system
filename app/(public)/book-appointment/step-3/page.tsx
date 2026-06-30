import BookingStepper from "@/components/appointment/BookingStepper";
import BookingStep3Content from "@/components/appointment/BookingStep3Content";

export const metadata = {
  title: "Book Appointment – Step 3 | Dr. Specialist",
  description: "Enter patient details for your appointment.",
};

export default function BookAppointmentStep3() {
  return (
    <main className="grow pt-24 pb-16 px-gutter max-w-[1280px] mx-auto w-full min-h-screen">
      <BookingStepper currentStep={3} />
      <BookingStep3Content />
    </main>
  );
}
