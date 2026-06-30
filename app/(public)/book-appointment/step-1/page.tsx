import BookingStepper from "@/components/appointment/BookingStepper";
import BookingStep1Form from "@/components/appointment/BookingStep1Form";

export const metadata = {
  title: "Book Appointment – Step 1 | Dr. Specialist",
  description: "Select your appointment type and preferred visit method.",
};

export default function BookAppointmentStep1() {
  return (
    <main className="grow pt-32 pb-20 px-8 lg:px-20 max-w-[1280px] mx-auto w-full">
      <BookingStepper currentStep={1} />

      <header className="mb-12">
        <h1 className="text-display font-bold leading-[1.1] tracking-[-0.02em] text-on-surface">
          Select Appointment &amp; Visit Type
        </h1>
        <p className="text-body-lg text-on-surface-variant mt-2">
          Begin your booking by choosing your preferred consultation method with Dr. Sterling.
        </p>
      </header>

      <BookingStep1Form />
    </main>
  );
}
