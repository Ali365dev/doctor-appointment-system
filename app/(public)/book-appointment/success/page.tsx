import { Suspense } from "react";
import SuccessContent from "@/components/appointment/SuccessContent";

export const metadata = {
  title: "Booking Confirmed | Dr. Zaid Gul",
  description: "Your appointment with Dr. Zaid Gul has been submitted successfully.",
};

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
