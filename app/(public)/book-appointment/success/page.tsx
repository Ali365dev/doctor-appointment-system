import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Payment Submitted | Dr. Specialist",
  description: "Your payment receipt has been submitted successfully.",
};

export default function PaymentSuccessPage() {
  return (
    <main className="max-w-[1280px] mx-auto px-gutter py-16 pt-28">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Success Content */}
        <div className="lg:col-span-8 space-y-10">
          {/* Success hero */}
          <div className="flex flex-col md:flex-row items-center gap-10 bg-surface-container-low p-10 rounded-xl border border-outline-variant/30">
            <div className="relative w-24 h-24 shrink-0">
              <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse shadow-[0_0_40px_rgba(0,74,198,0.15)]" />
              <div className="relative w-full h-full flex items-center justify-center bg-primary rounded-full text-white">
                <span
                  className="material-symbols-outlined text-[48px]"
                  style={{ fontVariationSettings: "'wght' 700" }}
                >
                  check
                </span>
              </div>
            </div>
            <div>
              <h1 className="text-headline-lg font-bold text-primary mb-2">
                Payment Submitted Successfully
              </h1>
              <p className="text-body-lg text-on-surface-variant max-w-2xl">
                Your payment receipt has been received and is being verified by our team.
              </p>
            </div>
          </div>

          {/* Verification Progress */}
          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-10 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-headline-md font-semibold text-on-surface">Verification Progress</h2>
              <span className="text-[14px] font-semibold text-outline">Ref: #APT-202600123</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="bg-surface-container-low p-6 rounded-lg flex items-center justify-between">
                <span className="text-[14px] font-semibold text-on-surface-variant">Appointment Status</span>
                <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-4 py-1 rounded-full text-[14px] font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">pending</span>
                  Waiting for Verification
                </span>
              </div>
              <div className="bg-surface-container-low p-6 rounded-lg flex items-center justify-between">
                <span className="text-[14px] font-semibold text-on-surface-variant">Payment Status</span>
                <span className="bg-secondary-fixed text-on-secondary-fixed-variant px-4 py-1 rounded-full text-[14px] font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                  Receipt Submitted
                </span>
              </div>
            </div>
            <div className="flex gap-6 bg-primary-fixed/30 p-6 rounded-lg border border-primary/10">
              <span
                className="material-symbols-outlined text-primary shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                info
              </span>
              <p className="text-body-md text-on-primary-fixed-variant">
                Verification usually takes <strong>5–30 minutes</strong> during working hours.
                Once approved, you&apos;ll receive a confirmation SMS and email.
              </p>
            </div>
          </div>

          {/* QR + Actions */}
          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-10 shadow-sm flex flex-col items-center text-center space-y-6">
            <div className="bg-white p-6 rounded-lg border border-outline-variant/20 shadow-sm">
              <div className="w-48 h-48 flex items-center justify-center">
                <Image
                  src="https://lh3.googleusercontent.com/aida/AP1WRLt6pkOvOtafcSIAdLmZcVEEcBXQg85NMxfIf5YIX2UxDaFbv1S4LAe2tocCpwshp41uKNwx7Jlm__fkZ5gGljDwZJEDwpzRrIxDxIudQOZwKHnTzLVW5girDO06eWuzXY5p1n0XvbpLK2fwpZY4iDcoSLmYUpex8l4PDzrdU14D9U-cXP8v52sTvG69LUv532Y2E4bc1m9LEzISRmy6x0RJR6i8NsvWPumYamBtlHZVmdJzqJ9ENmdVJgc"
                  alt="Appointment QR Code"
                  width={192}
                  height={192}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              </div>
            </div>
            <div className="flex flex-col items-center gap-6">
              <p className="text-body-md text-on-surface-variant max-w-md">
                Download or save this QR code and present it at the clinic. The doctor or clinic
                staff will scan it to verify your appointment.
              </p>
              <button className="bg-primary text-on-primary text-[14px] font-semibold px-10 py-6 rounded-xl hover:opacity-90 transition-all active:scale-[0.98] shadow-md flex items-center gap-2">
                <span className="material-symbols-outlined">download</span>
                Download QR Ticket
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-6 w-full">
              <Link
                href="/patient"
                className="flex-1 bg-surface-container-high text-primary border border-outline-variant text-[14px] font-semibold py-10 rounded-xl hover:bg-surface-container-highest transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                View Appointment Status
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <Link
                href="/"
                className="flex-1 bg-primary text-on-primary text-[14px] font-semibold py-10 rounded-xl hover:opacity-90 transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">dashboard</span>
                Go to Dashboard
              </Link>
            </div>

            {/* Bento info cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 w-full text-left">
              <div className="bg-surface-container border border-outline-variant/30 p-6 rounded-xl">
                <span className="material-symbols-outlined text-primary mb-2 block">verified_user</span>
                <h3 className="text-[18px] font-semibold text-on-surface mb-2">Secure Processing</h3>
                <p className="text-body-md text-on-surface-variant">
                  Your transaction is protected by 256-bit SSL encryption. All medical records
                  remain confidential and HIPAA compliant.
                </p>
              </div>
              <div className="bg-surface-container border border-outline-variant/30 p-6 rounded-xl">
                <span className="material-symbols-outlined text-primary mb-2 block">support_agent</span>
                <h3 className="text-[18px] font-semibold text-on-surface mb-2">Need Help?</h3>
                <p className="text-body-md text-on-surface-variant">
                  Our concierge support team is available 24/7 for payment-related inquiries.
                  Contact us via chat or phone.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sticky Summary */}
        <aside className="lg:col-span-4 sticky top-24">
          <div className="bg-surface-container-highest border border-outline-variant/50 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-primary p-6 text-on-primary">
              <h3 className="text-[20px] font-semibold">Appointment Summary</h3>
            </div>
            <div className="p-6 space-y-6">
              {[
                { icon: "medical_services", label: "Service", name: "Cardiology Consultation", sub: null },
                { icon: "person", label: "Specialist", name: "Dr. Julian Sterling", sub: "Cardiology Specialist" },
              ].map(({ icon, label, name, sub }) => (
                <div key={label} className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-surface-container-lowest rounded-lg flex items-center justify-center border border-outline-variant shrink-0">
                    <span className="material-symbols-outlined text-primary">{icon}</span>
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-outline uppercase tracking-wider">{label}</p>
                    <p className="text-[16px] font-semibold text-on-surface">{name}</p>
                    {sub && <p className="text-caption text-on-surface-variant">{sub}</p>}
                  </div>
                </div>
              ))}

              <div className="border-t border-outline-variant/30 pt-6 space-y-2">
                {[
                  { label: "Date", value: "Jun 30, 2026" },
                  { label: "Time", value: "10:30 AM (PKT)" },
                  { label: "Location", value: "Faisal Hospital, Block B" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-body-md text-on-surface-variant">{label}</span>
                    <span className="text-[14px] font-semibold text-on-surface">{value}</span>
                  </div>
                ))}
              </div>

              <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/30 flex justify-between items-center">
                <div>
                  <p className="text-[14px] font-semibold text-outline uppercase tracking-wider">Amount Paid</p>
                  <p className="text-[24px] font-bold text-primary">Rs. 2,000</p>
                </div>
                <div className="text-right">
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded text-[10px] font-bold">
                    PRE-PAID
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-low p-6">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXkE7NRrXn7DomcHVW73Z2Go2OW7CMqP6gy2IHuLodoZFAfGMvd6G9xVHAEAlKnG8wJD_XTpr0_r8vvNNlK7z5dLDcdWNefzDHEwAs7RY8VG1Tof0LDfPvfnkQ-b38w28C42rYcjvuTz_Rb7xy88P5ItnMLVhvZKzBho76ys3SKnu147HGZBQcMaEMUALHrXvh9uNlYt6zYVyWU01R3bQ0Ezgd82pTutH_caqvkOKNil34nvo2y_9p8eYSBV2vKkiSCJfPCOVz1D0"
                alt="Clinic location map"
                width={400}
                height={128}
                className="w-full h-32 object-cover rounded-lg border border-outline-variant"
                unoptimized
              />
            </div>
          </div>
        </aside>
      </div>

    </main>
  );
}
