"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useBookingStore } from "@/store/bookingStore";
import { doctor } from "@/lib/data";

export default function BookingStep5Content() {
  const router = useRouter();
  const { selectedClinic, selectedDate, selectedTime, patientInfo } = useBookingStore();

  const fee = selectedClinic?.fee_pkr ?? doctor.fee_summary.min_fee_pkr;

  const formattedDate = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      })
    : "—";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => null);
  };

  const summaryRows = [
    { label: "Specialist", value: doctor.name },
    { label: "Clinic", value: selectedClinic?.name ?? "—" },
    { label: "Date", value: formattedDate },
    { label: "Time", value: selectedTime ?? "—" },
    { label: "Patient", value: patientInfo.fullName || "—" },
  ];

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

        {/* Option 1: WhatsApp / Direct Booking */}
        {doctor.contact.whatsapp && (
          <div className="group relative bg-white border border-outline-variant/50 rounded-xl p-6 shadow-sm transition-all hover:border-primary/40">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[28px]">chat</span>
                </div>
                <div>
                  <h3 className="text-body-lg font-semibold text-on-surface">Pay via WhatsApp</h3>
                  <p className="text-on-surface-variant text-caption">
                    Send payment details directly to the clinic
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified_user
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider">Recommended</span>
              </div>
            </div>
            <a
              href={doctor.contact.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-primary text-white text-[14px] font-bold py-4 rounded-lg shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Confirm Booking on WhatsApp
              <span className="material-symbols-outlined">open_in_new</span>
            </a>
          </div>
        )}

        {/* Option 2: Mobile Wallets — JazzCash / Easypaisa */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-6 transition-all">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-secondary-container/20 rounded-lg flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[28px]">account_balance_wallet</span>
            </div>
            <div>
              <h3 className="text-body-lg font-semibold text-on-surface">Pay with JazzCash or Easypaisa</h3>
              <p className="text-on-surface-variant text-caption">Manual transfer for local mobile wallets</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { label: "JazzCash", number: "0300-1234567", raw: "03001234567" },
              { label: "Easypaisa", number: "0345-7654321", raw: "03457654321" },
            ].map(({ label, number, raw }) => (
              <div key={label} className="bg-white p-4 rounded-lg border border-outline-variant/30 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary text-[28px]">
                    account_balance_wallet
                  </span>
                </div>
                <div className="w-full space-y-2">
                  <span className="font-bold text-on-surface text-[14px] uppercase tracking-wider">{label}</span>
                  <div className="flex items-center justify-center gap-2 bg-surface-container-low py-2 px-3 rounded-md border border-outline-variant/30">
                    <span className="text-body-lg font-semibold text-primary">{number}</span>
                    <button
                      onClick={() => handleCopy(raw)}
                      className="text-outline hover:text-primary transition-colors"
                      aria-label={`Copy ${label} number`}
                    >
                      <span className="material-symbols-outlined text-[18px]">content_copy</span>
                    </button>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[11px] text-outline uppercase font-semibold">Account Title</span>
                    <span className="text-[14px] font-semibold text-on-surface">{doctor.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-secondary-container/10 rounded-lg border border-secondary-container/20">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary text-[20px]">info</span>
              <p className="text-caption text-on-secondary-container">
                <strong>Manual Verification Required:</strong> After transfer, upload your receipt
                in the next step. Verification takes up to 2 hours during business hours.
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

        {/* Call option */}
        {doctor.contact.helpline && (
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[28px]">call</span>
              </div>
              <div>
                <h3 className="text-body-lg font-semibold text-on-surface">Book by Phone</h3>
                <p className="text-caption text-on-surface-variant">Call the clinic directly</p>
              </div>
            </div>
            <a
              href={`tel:${doctor.contact.helpline}`}
              className="px-md py-xs border border-primary text-primary rounded-lg text-label-md font-semibold hover:bg-primary/5 transition-all flex items-center gap-xs"
            >
              <span className="material-symbols-outlined text-[18px]">call</span>
              {doctor.contact.helpline}
            </a>
          </div>
        )}
      </div>

      {/* Right: Summary */}
      <div className="lg:col-span-4 sticky top-32">
        <div className="bg-white border border-outline-variant/50 rounded-xl p-6 shadow-sm">
          <h3 className="text-body-lg font-semibold text-on-surface mb-6">Appointment Summary</h3>
          <div className="space-y-4 mb-8">
            {summaryRows.map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-on-surface-variant text-caption uppercase tracking-wider">{label}</span>
                <span className="text-[14px] font-semibold text-on-surface text-right max-w-[60%] truncate">{value}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-outline-variant/30 pt-6 space-y-3">
            <div className="flex justify-between text-on-surface-variant">
              <span className="text-body-md">Consultation Fee</span>
              <span className="text-body-md">Rs. {fee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span className="text-body-md">Booking Service Fee</span>
              <span className="text-body-md">Rs. 0</span>
            </div>
            <div className="flex justify-between pt-3 text-on-surface">
              <span className="text-body-lg font-semibold">Total Amount</span>
              <span className="text-body-lg font-semibold text-primary">Rs. {fee.toLocaleString()}</span>
            </div>
          </div>
          <div className="mt-8 flex items-center gap-3 text-outline text-caption leading-tight">
            <span className="material-symbols-outlined text-[18px]">lock</span>
            <p>Your payment information is handled securely.</p>
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
            <span className="text-[11px] font-semibold uppercase">PMDC Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
