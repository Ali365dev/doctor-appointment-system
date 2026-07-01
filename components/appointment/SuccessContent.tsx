"use client";

import Image from "next/image";
import Link from "next/link";
import { useBookingStore } from "@/store/bookingStore";
import { doctor } from "@/lib/data";

export default function SuccessContent() {
  const { selectedClinic, selectedDate, selectedTime, patientInfo, reset } = useBookingStore();

  const fee = selectedClinic?.fee_pkr ?? doctor.fee_summary.min_fee_pkr;

  const formattedDate = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric",
      })
    : "—";

  const refNumber = `#APT-${Date.now().toString().slice(-6)}`;

  const handleDownload = () => {
    const content = [
      "APPOINTMENT CONFIRMATION",
      "========================",
      `Reference: ${refNumber}`,
      `Patient: ${patientInfo.fullName || "—"}`,
      `Phone: ${patientInfo.phone || "—"}`,
      `Doctor: ${doctor.name}`,
      `Clinic: ${selectedClinic?.name ?? "—"}`,
      `Date: ${formattedDate}`,
      `Time: ${selectedTime ?? "—"}`,
      `Fee: Rs. ${fee.toLocaleString()}`,
      "",
      "Present this at the clinic for check-in.",
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `appointment-${refNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="max-w-[1280px] mx-auto px-gutter py-16 pt-28">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left */}
        <div className="lg:col-span-8 space-y-10">
          {/* Success hero */}
          <div className="flex flex-col md:flex-row items-center gap-10 bg-surface-container-low p-10 rounded-xl border border-outline-variant/30">
            <div className="relative w-24 h-24 shrink-0">
              <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse shadow-[0_0_40px_rgba(0,74,198,0.15)]" />
              <div className="relative w-full h-full flex items-center justify-center bg-primary rounded-full text-white">
                <span className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: "'wght' 700" }}>
                  check
                </span>
              </div>
            </div>
            <div>
              <h1 className="text-headline-lg font-bold text-primary mb-2">
                Payment Submitted Successfully
              </h1>
              <p className="text-body-lg text-on-surface-variant max-w-2xl">
                Your payment receipt has been received. {doctor.name}&apos;s team will verify and
                confirm your appointment shortly.
              </p>
            </div>
          </div>

          {/* Verification Progress */}
          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-10 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-headline-md font-semibold text-on-surface">Verification Progress</h2>
              <span className="text-[14px] font-semibold text-outline">Ref: {refNumber}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="bg-surface-container-low p-6 rounded-lg flex items-center justify-between">
                <span className="text-[14px] font-semibold text-on-surface-variant">Appointment Status</span>
                <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-4 py-1 rounded-full text-[14px] font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">pending</span>
                  Pending Verification
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
              <span className="material-symbols-outlined text-primary shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                info
              </span>
              <p className="text-body-md text-on-primary-fixed-variant">
                Verification usually takes <strong>5–30 minutes</strong> during working hours.
                Contact via <a href={doctor.contact.whatsapp} target="_blank" rel="noopener noreferrer"
                  className="text-primary underline">WhatsApp</a> or call{" "}
                <a href={`tel:${doctor.contact.helpline}`} className="text-primary underline">
                  {doctor.contact.helpline}
                </a> for immediate assistance.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-10 shadow-sm flex flex-col items-center text-center space-y-6">
            <span className="material-symbols-outlined text-primary text-[64px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              event_available
            </span>
            <div>
              <h3 className="text-headline-md font-bold text-on-surface mb-2">Your slot is reserved</h3>
              <p className="text-body-md text-on-surface-variant max-w-md">
                Present your reference number <strong>{refNumber}</strong> at the clinic for check-in.
              </p>
            </div>

            <button
              onClick={handleDownload}
              className="bg-primary text-on-primary text-[14px] font-semibold px-10 py-4 rounded-xl hover:opacity-90 transition-all active:scale-[0.98] shadow-md flex items-center gap-2"
            >
              <span className="material-symbols-outlined">download</span>
              Download Booking Confirmation
            </button>

            <div className="flex flex-col sm:flex-row gap-6 pt-6 w-full">
              <Link href="/patient"
                className="flex-1 bg-surface-container-high text-primary border border-outline-variant text-[14px] font-semibold py-4 rounded-xl hover:bg-surface-container-highest transition-all flex items-center justify-center gap-2">
                View Appointment Status
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <Link href="/" onClick={reset}
                className="flex-1 bg-primary text-on-primary text-[14px] font-semibold py-4 rounded-xl hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">home</span>
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Sticky Summary */}
        <aside className="lg:col-span-4 sticky top-24">
          <div className="bg-surface-container-highest border border-outline-variant/50 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-primary p-6 text-on-primary">
              <h3 className="text-body-lg font-semibold">Appointment Summary</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <Image src={doctor.profile_image} alt={doctor.name} width={64} height={64}
                    className="w-full h-full object-cover" unoptimized />
                </div>
                <div>
                  <p className="text-caption text-outline uppercase tracking-wider">Specialist</p>
                  <p className="text-body-md font-bold text-on-surface">{doctor.name}</p>
                  <p className="text-caption text-on-surface-variant">{doctor.specialization.join(" & ")}</p>
                </div>
              </div>

              <div className="border-t border-outline-variant/30 pt-4 space-y-2">
                {[
                  { label: "Patient", value: patientInfo.fullName || "—" },
                  { label: "Clinic", value: selectedClinic?.name ?? "—" },
                  { label: "Date", value: formattedDate },
                  { label: "Time", value: selectedTime ?? "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-body-md text-on-surface-variant">{label}</span>
                    <span className="text-[14px] font-semibold text-on-surface text-right max-w-[55%]">{value}</span>
                  </div>
                ))}
              </div>

              <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/30 flex justify-between items-center">
                <div>
                  <p className="text-caption text-outline uppercase tracking-wider">Amount</p>
                  <p className="text-headline-md font-bold text-primary">Rs. {fee.toLocaleString()}</p>
                </div>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-[10px] font-bold">
                  PRE-PAID
                </span>
              </div>
            </div>
            <div className="p-6 bg-surface-container-low border-t border-outline-variant/20 flex gap-3">
              <a href={doctor.contact.whatsapp} target="_blank" rel="noopener noreferrer"
                className="flex-1 bg-primary text-on-primary text-caption font-bold py-xs rounded-lg flex items-center justify-center gap-xs hover:opacity-90 transition-all">
                <span className="material-symbols-outlined text-[16px]">chat</span> WhatsApp
              </a>
              <a href={`tel:${doctor.contact.helpline}`}
                className="flex-1 border border-primary text-primary text-caption font-bold py-xs rounded-lg flex items-center justify-center gap-xs hover:bg-primary/5 transition-all">
                <span className="material-symbols-outlined text-[16px]">call</span> Call
              </a>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
