"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useBookingStore } from "@/store/bookingStore";
import { doctor as staticDoctor, buildWhatsappLink } from "@/lib/data";
import { useDoctorProfile } from "@/lib/context/DoctorProfileContext";
import type { AppointmentStatus } from "@/types/appointment";
import type { PaymentStatus } from "@/types/payment";

type PaymentMethod = "bank" | "jazzcash" | "easypaisa" | "reception" | "receipt";

const HERO_CONFIG: Record<PaymentMethod, {
  heroClass: string;
  iconGlowClass: string;
  iconBgClass: string;
  icon: string;
  title: string;
  description: (doctorName: string) => string;
}> = {
  bank: {
    heroClass: "bg-surface-container-low border-outline-variant/30",
    iconGlowClass: "bg-primary/10 shadow-[0_0_40px_rgba(0,74,198,0.15)]",
    iconBgClass: "bg-primary",
    icon: "check",
    title: "Payment Submitted Successfully",
    description: (name) => `Your bank transfer receipt has been received. ${name}'s team will verify and confirm your appointment shortly.`,
  },
  jazzcash: {
    heroClass: "bg-surface-container-low border-outline-variant/30",
    iconGlowClass: "bg-primary/10 shadow-[0_0_40px_rgba(0,74,198,0.15)]",
    iconBgClass: "bg-primary",
    icon: "check",
    title: "Payment Submitted Successfully",
    description: (name) => `Your JazzCash payment receipt has been received. ${name}'s team will verify and confirm your appointment shortly.`,
  },
  easypaisa: {
    heroClass: "bg-surface-container-low border-outline-variant/30",
    iconGlowClass: "bg-primary/10 shadow-[0_0_40px_rgba(0,74,198,0.15)]",
    iconBgClass: "bg-primary",
    icon: "check",
    title: "Payment Submitted Successfully",
    description: (name) => `Your Easypaisa payment receipt has been received. ${name}'s team will verify and confirm your appointment shortly.`,
  },
  reception: {
    heroClass: "bg-amber-50 border-amber-200",
    iconGlowClass: "bg-amber-100 shadow-[0_0_40px_rgba(217,119,6,0.2)]",
    iconBgClass: "bg-amber-600",
    icon: "storefront",
    title: "Booking Confirmed!",
    description: (name) => `Your slot with ${name} is reserved. Please pay at the clinic reception on your visit day — no receipt needed.`,
  },
  receipt: {
    heroClass: "bg-surface-container-low border-outline-variant/30",
    iconGlowClass: "bg-primary/10 shadow-[0_0_40px_rgba(0,74,198,0.15)]",
    iconBgClass: "bg-primary",
    icon: "check",
    title: "Payment Submitted Successfully",
    description: (name) => `Your payment receipt has been received. ${name}'s team will verify and confirm your appointment shortly.`,
  },
};

const APPOINTMENT_STATUS_CONFIG: Record<AppointmentStatus, { label: string; icon: string; className: string }> = {
  pending_payment: { label: "Pending Payment", icon: "hourglass_empty", className: "bg-amber-100 text-amber-700" },
  payment_submitted: { label: "Payment Submitted", icon: "receipt_long", className: "bg-tertiary-fixed text-on-tertiary-fixed-variant" },
  payment_verification: { label: "Pending Verification", icon: "pending", className: "bg-tertiary-fixed text-on-tertiary-fixed-variant" },
  confirmed: { label: "Confirmed", icon: "check_circle", className: "bg-green-100 text-green-700" },
  completed: { label: "Completed", icon: "task_alt", className: "bg-surface-container-highest text-on-surface-variant" },
  cancelled: { label: "Cancelled", icon: "cancel", className: "bg-error/10 text-error" },
  rejected: { label: "Rejected", icon: "block", className: "bg-error/10 text-error" },
  rescheduled: { label: "Rescheduled", icon: "event_repeat", className: "bg-primary/10 text-primary" },
  no_show: { label: "No Show", icon: "person_off", className: "bg-error/10 text-error" },
};

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; icon: string; className: string }> = {
  pending: { label: "Pending", icon: "schedule", className: "bg-amber-100 text-amber-700" },
  submitted: { label: "Receipt Submitted", icon: "receipt_long", className: "bg-secondary-fixed text-on-secondary-fixed-variant" },
  verified: { label: "Verified", icon: "verified", className: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", icon: "block", className: "bg-error/10 text-error" },
  failed: { label: "Failed", icon: "error", className: "bg-error/10 text-error" },
  refunded: { label: "Refunded", icon: "undo", className: "bg-surface-container-highest text-on-surface-variant" },
};

interface Confirmation {
  appointmentNumber: string;
  status: AppointmentStatus;
  clinicName: string;
  procedureName?: string;
  date: string;
  time: string;
  patientName: string;
  feeSnapshotPkr: number;
  paymentMethod?: string;
  paymentStatus?: PaymentStatus;
  visitType?: string;
  meetingLink?: string;
}

export default function SuccessContent() {
  const doctor = useDoctorProfile();
  const { patientInfo, visitType, reset } = useBookingStore();
  const searchParams = useSearchParams();
  const paymentParam = searchParams.get("payment");
  const appointmentId = searchParams.get("appointmentId");

  const method: PaymentMethod =
    paymentParam === "bank" || paymentParam === "jazzcash" || paymentParam === "easypaisa" || paymentParam === "reception"
      ? paymentParam
      : "receipt";
  const hero = HERO_CONFIG[method];

  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchConfirmation = async (): Promise<Confirmation | null> => {
      if (!appointmentId) return null;
      const res = await fetch(`/api/appointments/${appointmentId}/confirmation`);
      const data = await res.json();
      return res.ok ? data.confirmation : null;
    };

    (async () => {
      try {
        const result = await fetchConfirmation();
        if (!cancelled) setConfirmation(result);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [appointmentId]);

  const fee = confirmation?.feeSnapshotPkr ?? staticDoctor.fee_summary.min_fee_pkr;
  const clinicName = confirmation?.clinicName ?? "—";
  const patientName = confirmation?.patientName ?? patientInfo.fullName ?? "—";
  const refNumber = confirmation?.appointmentNumber ?? "—";

  const formattedDate = confirmation?.date
    ? new Date(confirmation.date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric",
      })
    : "—";

  const appointmentStatusBadge = confirmation
    ? APPOINTMENT_STATUS_CONFIG[confirmation.status]
    : { label: "Processing…", icon: "hourglass_empty", className: "bg-surface-container-highest text-on-surface-variant" };
  const paymentStatusBadge = confirmation?.paymentStatus
    ? PAYMENT_STATUS_CONFIG[confirmation.paymentStatus]
    : { label: method === "reception" ? "Pay at Reception" : "Processing…", icon: "schedule", className: "bg-surface-container-highest text-on-surface-variant" };

  const isReception = method === "reception";
  const isOnline = (confirmation?.visitType ?? visitType) === "online";

  const handleDownload = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const { default: QRCode } = await import("qrcode");
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 16;
    const contentWidth = pageWidth - margin * 2;

    const NAVY: [number, number, number] = [10, 36, 71];
    const TEXT_DARK: [number, number, number] = [24, 28, 38];
    const TEXT_MUTED: [number, number, number] = [110, 114, 130];
    const BORDER: [number, number, number] = [222, 226, 234];
    const BAND_BG: [number, number, number] = [244, 247, 250];

    const initials = doctor.name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "DR";
    const generatedAt = new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });

    // ---- Letterhead ----
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...NAVY);
    doc.circle(margin + 8, 20, 8, "S");
    doc.setTextColor(...NAVY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(initials, margin + 8, 21.5, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(doctor.name, margin + 20, 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(doctor.designation, margin + 20, 20.5);
    if (doctor.verification) doc.text(doctor.verification, margin + 20, 25);
    doc.setFontSize(8);
    doc.text(
      [doctor.contactPhone, doctor.contactEmail].filter(Boolean).join("   ·   "),
      margin + 20,
      doctor.verification ? 29.5 : 25
    );

    doc.setDrawColor(...BORDER);
    doc.line(margin, 34, pageWidth - margin, 34);

    // ---- Title band ----
    doc.setFillColor(...BAND_BG);
    doc.rect(margin, 38, contentWidth, 9, "F");
    doc.setTextColor(...NAVY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("APPOINTMENT CONFIRMATION", pageWidth / 2, 44, { align: "center" });

    // ---- Meta row ----
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_DARK);
    doc.text(`Appointment No.: ${refNumber}`, margin, 53);
    doc.text(`Generated: ${generatedAt}`, pageWidth - margin, 53, { align: "right" });

    let y = 59;

    function drawSection(title: string, rows: [string, string][]): void {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(...NAVY);
      doc.text(title, margin, y);
      doc.setDrawColor(...BORDER);
      doc.line(margin, y + 2, pageWidth - margin, y + 2);

      autoTable(doc, {
        startY: y + 5,
        body: rows,
        theme: "plain",
        styles: { fontSize: 9.5, textColor: TEXT_DARK, cellPadding: { top: 1.3, bottom: 1.3, left: 0, right: 2 } },
        columnStyles: { 0: { fontStyle: "bold", cellWidth: 45, textColor: TEXT_MUTED }, 1: { textColor: TEXT_DARK } },
        margin: { left: margin, right: margin },
      });
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
    }

    drawSection("Patient Information", [
      ["Patient Name", patientName],
      ["Age / Gender", [patientInfo.age && `${patientInfo.age} Years`, patientInfo.gender].filter(Boolean).join(" / ") || "—"],
      ["Phone", patientInfo.phone || "—"],
      ["CNIC", patientInfo.cnic || "—"],
    ]);

    drawSection("Appointment Details", [
      ["Doctor", doctor.name],
      ["Visit Type", isOnline ? "Online Consultation" : "In-Clinic Consultation"],
      isOnline ? ["Video Call Link", confirmation?.meetingLink || "Sent by email once confirmed"] : ["Clinic", clinicName],
      ...(isOnline ? [] : [["Location", [doctor.city, doctor.country].filter(Boolean).join(", ") || "—"] as [string, string]]),
      ["Date", formattedDate],
      ["Time", confirmation?.time ?? "—"],
      ["Procedure", confirmation?.procedureName ?? "Consultation"],
      ["Consultation Fee", `Rs. ${fee.toLocaleString()}`],
      ["Payment Status", paymentStatusBadge.label],
    ]);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...NAVY);
    doc.text("Instructions", margin, y);
    doc.setDrawColor(...BORDER);
    doc.line(margin, y + 2, pageWidth - margin, y + 2);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_DARK);
    const instructions = isOnline
      ? [
          "Check your email for the Google Meet link once your appointment is confirmed.",
          "Join the call a few minutes before your scheduled time.",
          "Ensure a stable internet connection, camera, and microphone.",
          "Keep previous reports and medications handy for reference during the call.",
        ]
      : [
          "Please arrive 15 minutes before your appointment.",
          "Bring previous reports and medications.",
          "Wear a face mask if required.",
          "Carry your original CNIC.",
          "Late arrival may require rescheduling.",
        ];
    for (const line of instructions) {
      doc.text(`•  ${line}`, margin, y);
      y += 5.5;
    }
    y += 3;

    drawSection("Emergency Contact", [
      ["Phone", doctor.contactPhone || "—"],
      ["Email", doctor.contactEmail || "—"],
    ]);

    // ---- Footer: QR + signature placeholders ----
    const pageHeight = doc.internal.pageSize.getHeight();
    const footerY = Math.max(y + 6, pageHeight - 46);
    doc.setDrawColor(...BORDER);
    doc.line(margin, footerY, pageWidth - margin, footerY);

    const boxSize = 22;
    const qrDataUrl = await QRCode.toDataURL(
      "https://drzaidgul.com/",
      { margin: 0, width: 256 }
    );
    doc.addImage(qrDataUrl, "PNG", margin, footerY + 6, boxSize, boxSize);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...TEXT_MUTED);
    doc.text("Scan to Visit Website", margin + boxSize / 2, footerY + 6 + boxSize + 4, { align: "center" });

    const sigX = pageWidth - margin - boxSize * 2.4;
    doc.line(sigX, footerY + 6 + boxSize - 4, sigX + boxSize * 2.4, footerY + 6 + boxSize - 4);
    doc.text("Doctor Signature", sigX + (boxSize * 2.4) / 2, footerY + 6 + boxSize + 4, { align: "center" });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(
      "This document is electronically generated and does not require a physical signature.",
      pageWidth / 2,
      pageHeight - 14,
      { align: "center" }
    );

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...TEXT_MUTED);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 8, { align: "right" });
    }

    doc.save(`appointment-${refNumber}.pdf`);
  };

  return (
    <main className="max-w-[1280px] mx-auto px-gutter py-16 pt-28">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left */}
        <div className="lg:col-span-8 space-y-10">
          {/* Success hero */}
          <div className={`flex flex-col md:flex-row items-center gap-10 p-10 rounded-xl border ${hero.heroClass}`}>
            <div className="relative w-24 h-24 shrink-0">
              <div className={`absolute inset-0 rounded-full animate-pulse ${hero.iconGlowClass}`} />
              <div className={`relative w-full h-full flex items-center justify-center rounded-full text-white ${hero.iconBgClass}`}>
                <span className="material-symbols-outlined text-display" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>
                  {hero.icon}
                </span>
              </div>
            </div>
            <div>
              <h1 className={`text-headline-lg font-bold mb-2 ${isReception ? "text-amber-700" : "text-primary"}`}>
                {hero.title}
              </h1>
              <p className="text-body-lg text-on-surface-variant max-w-2xl">
                {hero.description(doctor.name)}
              </p>
            </div>
          </div>

          {/* Verification Progress */}
          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-10 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-headline-md font-semibold text-on-surface">
                {isReception ? "Booking Details" : "Verification Progress"}
              </h2>
              <span className="text-[14px] font-semibold text-outline">
                {loading ? "Loading…" : `Ref: ${refNumber}`}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="bg-surface-container-low p-6 rounded-lg flex items-center justify-between">
                <span className="text-[14px] font-semibold text-on-surface-variant">Appointment Status</span>
                <span className={`${appointmentStatusBadge.className} px-4 py-1 rounded-full text-[14px] font-semibold flex items-center gap-2`}>
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {appointmentStatusBadge.icon}
                  </span>
                  {appointmentStatusBadge.label}
                </span>
              </div>
              <div className="bg-surface-container-low p-6 rounded-lg flex items-center justify-between">
                <span className="text-[14px] font-semibold text-on-surface-variant">Payment Status</span>
                <span className={`${paymentStatusBadge.className} px-4 py-1 rounded-full text-[14px] font-semibold flex items-center gap-2`}>
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {paymentStatusBadge.icon}
                  </span>
                  {paymentStatusBadge.label}
                </span>
              </div>
            </div>
            {isReception ? (
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
                  Contact via <a href={buildWhatsappLink(doctor.contactWhatsapp)} target="_blank" rel="noopener noreferrer"
                    className="text-primary underline">WhatsApp</a> or call{" "}
                  <a href={`tel:${doctor.contactPhone}`} className="text-primary underline">
                    {doctor.contactPhone}
                  </a> for immediate assistance.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-10 shadow-sm flex flex-col items-center text-center space-y-6">
            <span className="material-symbols-outlined text-primary text-[64px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isOnline ? "videocam" : "event_available"}
            </span>
            <div>
              <h3 className="text-headline-md font-bold text-on-surface mb-2">
                {isOnline ? "Your online consultation is reserved" : "Your slot is reserved"}
              </h3>
              <p className="text-body-md text-on-surface-variant max-w-md">
                {isOnline
                  ? "Once confirmed, we'll email you a Google Meet link — check your inbox around your appointment time to join."
                  : (<>Present your reference number <strong>{refNumber}</strong> at the clinic for check-in.</>)}
              </p>
            </div>

            {isOnline && confirmation?.meetingLink && (
              <a
                href={confirmation.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-secondary text-on-secondary text-[14px] font-semibold px-10 py-4 rounded-xl hover:opacity-90 transition-all active:scale-[0.98] shadow-md flex items-center gap-2"
              >
                <span className="material-symbols-outlined">videocam</span>
                Join Google Meet
              </a>
            )}

            <button
              onClick={handleDownload}
              className="bg-primary text-on-primary text-[14px] font-semibold px-10 py-4 rounded-xl hover:opacity-90 transition-all active:scale-[0.98] shadow-md flex items-center gap-2"
            >
              <span className="material-symbols-outlined">download</span>
              Download Booking Confirmation
            </button>

            <div className="flex flex-col sm:flex-row gap-6 pt-6 w-full">
              <Link href="/patient/appointments"
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
                  <Image src={doctor.profileImage} alt={doctor.name} width={64} height={64}
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
                  ...(confirmation?.procedureName ? [{ label: "Procedure", value: confirmation.procedureName }] : []),
                  { label: "Patient", value: patientName },
                  { label: "Clinic", value: clinicName },
                  { label: "Date", value: formattedDate },
                  { label: "Time", value: confirmation?.time ?? "—" },
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
                  {isReception ? "PAY AT CLINIC" : "PRE-PAID"}
                </span>
              </div>

              {confirmation?.visitType === "online" && confirmation.meetingLink && (
                <a
                  href={confirmation.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-xs bg-secondary text-on-secondary font-bold py-sm rounded-lg hover:opacity-90 transition-all"
                >
                  <span className="material-symbols-outlined text-body-lg">videocam</span>
                  Join Google Meet
                </a>
              )}
            </div>
            <div className="p-6 bg-surface-container-low border-t border-outline-variant/20 flex gap-3">
              <a href={buildWhatsappLink(doctor.contactWhatsapp)} target="_blank" rel="noopener noreferrer"
                className="flex-1 bg-primary text-on-primary text-caption font-bold py-xs rounded-lg flex items-center justify-center gap-xs hover:opacity-90 transition-all">
                <span className="material-symbols-outlined text-[16px]">chat</span> WhatsApp
              </a>
              <a href={`tel:${doctor.contactPhone}`}
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
