"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

const summaryRows = [
  { label: "Specialist", value: "Dr. Julian Sterling" },
  { label: "Service", value: "Cardiology Consult" },
  { label: "Date", value: "Jun 30, 2026" },
  { label: "Time", value: "10:30 AM (PKT)" },
];

const feeRows = [
  { label: "Consultation Fee", value: "Rs. 1,800" },
  { label: "Service Fee", value: "Rs. 200" },
];

export default function BookingStep5Content() {
  const router = useRouter();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      {/* Left: Payment Methods */}
      <div className="lg:col-span-8 space-y-6">
        <div className="mb-6">
          <h1 className="text-headline-lg font-bold text-on-surface mb-2">Secure Payment</h1>
          <p className="text-on-surface-variant text-body-md">
            Choose your preferred method to confirm your specialist consultation.
          </p>
        </div>

        {/* Option 1: Card / Stripe */}
        <div className="group relative bg-white border border-outline-variant/50 rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] transition-all hover:border-primary/40 cursor-pointer">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[28px]">credit_card</span>
              </div>
              <div>
                <h3 className="text-[18px] font-semibold text-on-surface">Pay Instantly with Card</h3>
                <p className="text-on-surface-variant text-caption">
                  Supports Credit/Debit Cards, Apple Pay &amp; Google Pay
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
              <span
                className="material-symbols-outlined text-[14px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified_user
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider">Secure</span>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-8">
            <div className="flex gap-3 text-outline/50">
              <span className="material-symbols-outlined">contactless</span>
              <span className="material-symbols-outlined">payments</span>
              <span className="material-symbols-outlined">credit_card</span>
            </div>
          </div>
          <button
            onClick={() => router.push("/book-appointment/upload-receipt")}
            className="w-full bg-primary text-white text-[14px] font-bold py-4 rounded-lg shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            Complete Booking with Card
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>

        {/* Option 2: JazzCash / Easypaisa */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-6 transition-all">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-secondary-container/20 rounded-lg flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[28px]">account_balance_wallet</span>
            </div>
            <div>
              <h3 className="text-[18px] font-semibold text-on-surface">Pay with JazzCash or Easypaisa</h3>
              <p className="text-on-surface-variant text-caption">Manual transfer for local mobile wallets</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* JazzCash */}
            <div className="bg-white p-4 rounded-lg border border-outline-variant/30 flex flex-col items-center text-center">
              <div className="w-32 h-32 bg-surface-container-high rounded-md mb-4 overflow-hidden flex items-center justify-center">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbZ8TVWcta0kN0AI1Co-42Ejl3DEkFeF5x3oeEEi0YwjWYheiuhMxnjGVcg1ykg8kJyUY0oYxTSsPqOr6zWbme-M9dVdnqjESiUlT5V4FEOf9xBIY2hquWWi-YdCkqTTMmS4KTbpfZNJZnlYv18yKIZ5WoZ-q1WwnIUqLD2641lEZp3ZuzLKauMLyKvVkMMGWDrtEl_imTJ5Wyd-EmIuP0rM67CJu5u3Ib5ShvjHi66tCgugwWD7amtgGvcNkLCyBrqBZOYPtBBZA"
                  alt="JazzCash QR Code"
                  width={96}
                  height={96}
                  className="w-24 h-24 object-contain"
                  unoptimized
                />
              </div>
              <div className="w-full space-y-2">
                <span className="font-bold text-on-surface text-[14px] uppercase tracking-wider">JazzCash</span>
                <div className="flex items-center justify-center gap-2 bg-surface-container-low py-2 px-3 rounded-md border border-outline-variant/30">
                  <span className="text-[18px] font-semibold text-primary">0300-1234567</span>
                  <button
                    onClick={() => handleCopy("03001234567")}
                    className="text-outline hover:text-primary transition-colors"
                    aria-label="Copy number"
                  >
                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                  </button>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[11px] text-outline uppercase font-semibold">Account Title</span>
                  <span className="text-[14px] font-semibold text-on-surface">Dr. Specialist Clinic</span>
                </div>
              </div>
            </div>

            {/* Easypaisa */}
            <div className="bg-white p-4 rounded-lg border border-outline-variant/30 flex flex-col items-center text-center">
              <div className="w-32 h-32 bg-surface-container-high rounded-md mb-4 overflow-hidden flex items-center justify-center">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsVUapCIragvSAR6l3SxFhzdUr1ZxcwDeZGL2jgGxv40lYgCTr7tYQOIa7w2MjaTTwlvlpRZn2uEcDaRl52YdvBvljVutYR2DFMh4Dy9zMhnS7BI_Fs1tb7yO5RJ0LPi9eCTkyuWP3qbE_kOmBhcmmpZJt2SxMTL7vLeMwZB8SBKZitHhjcRUCbamld9nWdS6ii-rZIHF5K0z95ShFBv_44FqbsYHSpkKhg1-d98cnkci9StLehyYUCLEB5yvLBJOK-5FcfeQLMm8"
                  alt="Easypaisa QR Code"
                  width={96}
                  height={96}
                  className="w-24 h-24 object-contain"
                  unoptimized
                />
              </div>
              <div className="w-full space-y-2">
                <span className="font-bold text-on-surface text-[14px] uppercase tracking-wider">Easypaisa</span>
                <div className="flex items-center justify-center gap-2 bg-surface-container-low py-2 px-3 rounded-md border border-outline-variant/30">
                  <span className="text-[18px] font-semibold text-primary">0345-7654321</span>
                  <button
                    onClick={() => handleCopy("03457654321")}
                    className="text-outline hover:text-primary transition-colors"
                    aria-label="Copy number"
                  >
                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                  </button>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[11px] text-outline uppercase font-semibold">Account Title</span>
                  <span className="text-[14px] font-semibold text-on-surface">Dr. Specialist Clinic</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-secondary-container/10 rounded-lg border border-secondary-container/20">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary text-[20px]">info</span>
              <p className="text-caption text-on-secondary-container">
                <strong>Manual Verification Required:</strong> After transfer, please upload your
                receipt screenshot in the next step. Verification takes up to 2 hours during
                business hours.
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/book-appointment/upload-receipt")}
            className="mt-6 w-full border border-primary text-primary text-[14px] font-bold py-3 rounded-lg hover:bg-primary/5 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Upload Payment Receipt
            <span className="material-symbols-outlined">upload</span>
          </button>
        </div>
      </div>

      {/* Right: Summary */}
      <div className="lg:col-span-4 sticky top-32">
        <div className="bg-white border border-outline-variant/50 rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
          <h3 className="text-[18px] font-semibold text-on-surface mb-6">Appointment Summary</h3>
          <div className="space-y-4 mb-8">
            {summaryRows.map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-on-surface-variant text-caption uppercase tracking-wider">{label}</span>
                <span className="text-[14px] font-semibold text-on-surface">{value}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-outline-variant/30 pt-6 space-y-3">
            {feeRows.map(({ label, value }) => (
              <div key={label} className="flex justify-between text-on-surface-variant">
                <span className="text-body-md">{label}</span>
                <span className="text-body-md">{value}</span>
              </div>
            ))}
            <div className="flex justify-between pt-3 text-on-surface">
              <span className="text-[20px] font-semibold">Total Amount</span>
              <span className="text-[20px] font-semibold text-primary">Rs. 2,000</span>
            </div>
          </div>
          <div className="mt-8 flex items-center gap-3 text-outline text-caption leading-tight">
            <span className="material-symbols-outlined text-[18px]">lock</span>
            <p>Your payment information is encrypted and processed through secure protocols.</p>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-center gap-4 text-outline">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">shield</span>
            <span className="text-[11px] font-semibold uppercase">Safe Checkout</span>
          </div>
          <div className="w-1 h-1 bg-outline-variant rounded-full" />
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span className="text-[11px] font-semibold uppercase">PCI Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
