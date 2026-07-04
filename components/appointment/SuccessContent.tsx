"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useBookingStore } from "@/store/bookingStore";
import { doctor } from "@/lib/data";

type PaymentMethod = "stripe" | "jazzcash" | "easypaisa" | "reception" | "receipt";

const STATUS_CONFIG: Record<PaymentMethod, {
  heroClass: string;
  iconGlowClass: string;
  iconBgClass: string;
  icon: string;
  title: string;
  description: (doctorName: string) => string;
  appointmentStatus: { label: string; icon: string; className: string };
  paymentStatus: { label: string; icon: string; className: string };
  amountBadge: string;
}> = {
  stripe: {
    heroClass: "bg-green-50 border-green-200",
    iconGlowClass: "bg-green-100 shadow-[0_0_40px_rgba(22,163,74,0.2)]",
    iconBgClass: "bg-green-600",
    icon: "verified",
    title: "Payment Confirmed!",
    description: (name) => `Your card payment was processed instantly by Stripe. Your appointment with ${name} is confirmed.`,
    appointmentStatus: { label: "Confirmed", icon: "check_circle", className: "bg-green-100 text-green-700" },
    paymentStatus: { label: "Paid via Stripe", icon: "verified", className: "bg-green-100 text-green-700" },
    amountBadge: "PRE-PAID",
  },
  jazzcash: {
    heroClass: "bg-surface-container-low border-outline-variant/30",
    iconGlowClass: "bg-primary/10 shadow-[0_0_40px_rgba(0,74,198,0.15)]",
    iconBgClass: "bg-primary",
    icon: "check",
    title: "Payment Submitted Successfully",
    description: (name) => `Your JazzCash payment receipt has been received. ${name}'s team will verify and confirm your appointment shortly.`,
    appointmentStatus: { label: "Pending Verification", icon: "pending", className: "bg-tertiary-fixed text-on-tertiary-fixed-variant" },
    paymentStatus: { label: "Receipt Submitted", icon: "receipt_long", className: "bg-secondary-fixed text-on-secondary-fixed-variant" },
    amountBadge: "PRE-PAID",
  },
  easypaisa: {
    heroClass: "bg-surface-container-low border-outline-variant/30",
    iconGlowClass: "bg-primary/10 shadow-[0_0_40px_rgba(0,74,198,0.15)]",
    iconBgClass: "bg-primary",
    icon: "check",
    title: "Payment Submitted Successfully",
    description: (name) => `Your Easypaisa payment receipt has been received. ${name}'s team will verify and confirm your appointment shortly.`,
    appointmentStatus: { label: "Pending Verification", icon: "pending", className: "bg-tertiary-fixed text-on-tertiary-fixed-variant" },
    paymentStatus: { label: "Receipt Submitted", icon: "receipt_long", className: "bg-secondary-fixed text-on-secondary-fixed-variant" },
    amountBadge: "PRE-PAID",
  },
  reception: {
    heroClass: "bg-amber-50 border-amber-200",
    iconGlowClass: "bg-amber-100 shadow-[0_0_40px_rgba(217,119,6,0.2)]",
    iconBgClass: "bg-amber-600",
    icon: "storefront",
    title: "Booking Confirmed!",
    description: (name) => `Your slot with ${name} is reserved. Please pay at the clinic reception on your visit day — no receipt needed.`,
    appointmentStatus: { label: "Confirmed", icon: "check_circle", className: "bg-green-100 text-green-700" },
    paymentStatus: { label: "Pay at Reception", icon: "storefront", className: "bg-amber-100 text-amber-700" },
    amountBadge: "PAY AT CLINIC",
  },
  receipt: {
    heroClass: "bg-surface-container-low border-outline-variant/30",
    iconGlowClass: "bg-primary/10 shadow-[0_0_40px_rgba(0,74,198,0.15)]",
    iconBgClass: "bg-primary",
    icon: "check",
    title: "Payment Submitted Successfully",
    description: (name) => `Your payment receipt has been received. ${name}'s team will verify and confirm your appointment shortly.`,
    appointmentStatus: { label: "Pending Verification", icon: "pending", className: "bg-tertiary-fixed text-on-tertiary-fixed-variant" },
    paymentStatus: { label: "Receipt Submitted", icon: "receipt_long", className: "bg-secondary-fixed text-on-secondary-fixed-variant" },
    amountBadge: "PRE-PAID",
  },
};

export default function SuccessContent() {
  const { selectedClinic, selectedDate, selectedTime, patientInfo, reset } = useBookingStore();
  const searchParams = useSearchParams();
  // Stripe/wallet/reception routes always append their own `payment` param — trust it directly
  const paymentParam = searchParams.get("payment");
  const method: PaymentMethod =
    paymentParam === "stripe" || paymentParam === "jazzcash" || paymentParam === "easypaisa" || paymentParam === "reception"
      ? paymentParam
      : "receipt";
  const isStripe = method === "stripe";
  const isReception = method === "reception";
  const config = STATUS_CONFIG[method];

  const fee = selectedClinic?.fee_pkr ?? doctor.fee_summary.min_fee_pkr;

  const formattedDate = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric",
      })
    : "—";

  const [refNumber] = useState(() => `#APT-${Date.now().toString().slice(-6)}`);

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
          <div className={`flex flex-col md:flex-row items-center gap-10 p-10 rounded-xl border ${config.heroClass}`}>
            <div className="relative w-24 h-24 shrink-0">
              <div className={`absolute inset-0 rounded-full animate-pulse ${config.iconGlowClass}`} />
              <div className={`relative w-full h-full flex items-center justify-center rounded-full text-white ${config.iconBgClass}`}>
                <span className="material-symbols-outlined text-display" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>
                  {config.icon}
                </span>
              </div>
            </div>
            <div>
              <h1 className={`text-headline-lg font-bold mb-2 ${isStripe ? "text-green-700" : isReception ? "text-amber-700" : "text-primary"}`}>
                {config.title}
              </h1>
              <p className="text-body-lg text-on-surface-variant max-w-2xl">
                {config.description(doctor.name)}
              </p>
            </div>
          </div>

          {/* Verification Progress */}
          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-10 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-headline-md font-semibold text-on-surface">
                {isStripe ? "Payment Details" : isReception ? "Booking Details" : "Verification Progress"}
              </h2>
              <span className="text-[14px] font-semibold text-outline">Ref: {refNumber}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="bg-surface-container-low p-6 rounded-lg flex items-center justify-between">
                <span className="text-[14px] font-semibold text-on-surface-variant">Appointment Status</span>
                <span className={`${config.appointmentStatus.className} px-4 py-1 rounded-full text-[14px] font-semibold flex items-center gap-2`}>
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {config.appointmentStatus.icon}
                  </span>
                  {config.appointmentStatus.label}
                </span>
              </div>
              <div className="bg-surface-container-low p-6 rounded-lg flex items-center justify-between">
                <span className="text-[14px] font-semibold text-on-surface-variant">Payment Status</span>
                <span className={`${config.paymentStatus.className} px-4 py-1 rounded-full text-[14px] font-semibold flex items-center gap-2`}>
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {config.paymentStatus.icon}
                  </span>
                  {config.paymentStatus.label}
                </span>
              </div>
            </div>
            {isStripe ? (
              <div className="flex gap-6 bg-green-50 p-6 rounded-lg border border-green-200">
                <span className="material-symbols-outlined text-green-600 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified_user
                </span>
                <p className="text-body-md text-green-800">
                  Your payment was <strong>instantly verified</strong> by Stripe. No further action is
                  required. You will receive a confirmation on WhatsApp shortly.
                </p>
              </div>
            ) : isReception ? (
              <div className="flex gap-6 bg-amber-50 p-6 rounded-lg border border-amber-200">
                <span className="material-symbols-outlined text-amber-600 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                  storefront
                </span>
                <p className="text-body-md text-amber-800">
                  No receipt or online payment needed — simply pay <strong>Rs. {fee.toLocaleString()}</strong> at
                  the clinic reception when you arrive for your visit.
                </p>
              </div>
            ) : (
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
            )}
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
              <Link href="patient/dashboard"
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
                  {config.amountBadge}
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
