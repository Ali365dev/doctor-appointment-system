"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "react-toastify";
import QRCode from "react-qr-code";
import { useBookingStore } from "@/store/bookingStore";
import { doctor } from "@/lib/data";

const JAZZCASH_NUMBER = "03001234567";
const EASYPAISA_NUMBER = "03457654321";

type Tab = "stripe" | "jazzcash" | "easypaisa" | "reception" | "whatsapp";

// ── Wallet tab (JazzCash / Easypaisa) ─────────────────────────────────────────
function WalletTab({
  label,
  method,
  number,
  accentBorder,
  fee,
}: {
  label: string;
  method: "jazzcash" | "easypaisa";
  number: string;
  accentBorder: string;
  fee: number;
}) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const setPaymentMethod = useBookingStore((s) => s.setPaymentMethod);

  const handleCopy = () => {
    navigator.clipboard.writeText(number).catch(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinueToReceipt = () => {
    setPaymentMethod(method);
    router.push("/book-appointment/upload-receipt");
  };

  const qrValue = `${label}:${number}?amount=${fee}`;

  return (
    <div className="space-y-6">
      {/* Step 1 — pay */}
      <div>
        <p className="text-caption font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
          Step 1 — Send Payment
        </p>
        <div className={`flex flex-col sm:flex-row gap-6 p-5 rounded-xl border ${accentBorder} bg-surface-container-lowest`}>
          {/* QR */}
          <div className="p-3 bg-white rounded-xl shadow-sm border border-outline-variant/20 self-start shrink-0">
            <QRCode value={qrValue} size={136} fgColor="#1c1b1f" bgColor="#ffffff" />
            <p className="text-caption text-center text-outline mt-2">Scan with {label}</p>
          </div>

          {/* Number + instructions */}
          <div className="flex-1 space-y-3">
            <p className="text-body-md text-on-surface-variant">
              Open <strong>{label}</strong> app → tap <strong>Send Money</strong> or{" "}
              <strong>Scan QR</strong> → enter the amount <strong>Rs. {fee.toLocaleString()}</strong>.
            </p>

            <div className="space-y-1">
              <p className="text-caption text-outline uppercase tracking-wider font-semibold">
                Account Number
              </p>
              <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2.5 rounded-lg border border-outline-variant/30">
                <span className="text-body-lg font-bold text-primary flex-1">{number}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label="Copy"
                  className="text-outline hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {copied ? "check" : "content_copy"}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <p className="text-caption text-outline uppercase tracking-wider font-semibold">
                Account Title
              </p>
              <p className="text-body-md font-semibold text-on-surface mt-0.5">{doctor.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2 — receipt upload happens on the shared upload-receipt page */}
      <div className="p-5 rounded-xl border border-outline-variant/30 bg-surface-container-low flex items-start gap-3">
        <span className="material-symbols-outlined text-primary shrink-0">cloud_upload</span>
        <p className="text-caption text-on-surface-variant">
          Step 2 — Once you&apos;ve sent the payment, upload your receipt on the next screen so our
          team can verify it and confirm your appointment.
        </p>
      </div>

      <button
        type="button"
        onClick={handleContinueToReceipt}
        className="w-full py-4 rounded-xl bg-primary text-on-primary text-[14px] font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined">receipt_long</span>
        I&apos;ve Sent the Payment — Upload Receipt
      </button>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function BookingStep5Content() {
  const router = useRouter();
  const { selectedClinic, selectedDate, selectedTime, visitType, patientInfo, appointmentId, appointmentNumber } =
    useBookingStore();
  const [activeTab, setActiveTab] = useState<Tab>("stripe");
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState("");
  const [receptionLoading, setReceptionLoading] = useState(false);

  // Payment requires an appointment to already exist (created at the end of Step 4).
  useEffect(() => {
    if (!appointmentId) {
      router.replace("/book-appointment/step-4");
    }
  }, [appointmentId, router]);

  const fee = selectedClinic?.fee_pkr ?? doctor.fee_summary.min_fee_pkr;

  const formattedDate = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  // ── Stripe Checkout redirect ──
  const handleStripeCheckout = async () => {
    if (!appointmentId) return;
    setStripeLoading(true);
    setStripeError("");
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: fee,
          description: `Consultation – ${selectedClinic?.name ?? "Clinic"} · ${formattedDate}`,
          appointmentId,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setStripeError(data.error ?? "Could not start payment. Try again.");
        setStripeLoading(false);
      }
    } catch {
      setStripeError("Network error. Please try again.");
      setStripeLoading(false);
    }
  };

  // ── Pay at Reception ──
  const handleReceptionConfirm = async () => {
    if (!appointmentId) return;
    setReceptionLoading(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, method: "reception" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not confirm booking. Please try again.");
        return;
      }
      router.push(`/book-appointment/success?payment=reception&appointmentId=${appointmentId}`);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setReceptionLoading(false);
    }
  };

  // ── WhatsApp pre-filled message ──
  const waMessage = encodeURIComponent(
    `*New Appointment Request*\n\n` +
      `👨‍⚕️ Doctor: ${doctor.name}\n` +
      `🏥 Clinic: ${selectedClinic?.name ?? "—"}\n` +
      `📅 Date: ${formattedDate}\n` +
      `⏰ Time: ${selectedTime ?? "—"}\n` +
      `🩺 Visit Type: ${visitType === "online" ? "Online Consultation" : "In-Clinic Visit"}\n` +
      `👤 Patient: ${patientInfo.fullName || "—"}\n` +
      `📞 Phone: ${patientInfo.phone || "—"}\n` +
      `🔖 Condition: ${patientInfo.condition || "—"}\n` +
      `${appointmentNumber ? `🔢 Appointment #: ${appointmentNumber}\n` : ""}\n` +
      `Please confirm my appointment. Thank you.`
  );

  const waNumber =
    new URL(doctor.contact.whatsapp).searchParams.get("phone")?.replace("+", "") ?? "923326568897";
  const waLink = `https://wa.me/${waNumber}?text=${waMessage}`;

  const summaryRows = [
    { label: "Clinic", value: selectedClinic?.name ?? "—" },
    { label: "Date", value: formattedDate },
    { label: "Time", value: selectedTime ?? "—" },
    { label: "Patient", value: patientInfo.fullName || "—" },
  ];

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "stripe", label: "Card (Stripe)", icon: "credit_card" },
    { id: "jazzcash", label: "JazzCash", icon: "account_balance_wallet" },
    { id: "easypaisa", label: "Easypaisa", icon: "account_balance_wallet" },
    { id: "reception", label: "Pay at Reception", icon: "storefront" },
    { id: "whatsapp", label: "WhatsApp", icon: "chat" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      {/* ── Left: Payment ── */}
      <div className="lg:col-span-8 space-y-6">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface mb-2">Complete Payment</h1>
          <p className="text-body-md text-on-surface-variant">
            Choose how you&apos;d like to pay for your appointment.
          </p>
          {appointmentNumber && (
            <p className="text-caption text-primary font-semibold mt-2">
              Appointment #{appointmentNumber}
            </p>
          )}
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-outline-variant/30 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[80px] flex flex-col items-center justify-center gap-1 py-4 px-2 text-[12px] font-semibold transition-all border-b-2 ${
                  activeTab === tab.id
                    ? "border-primary text-primary bg-primary/3"
                    : "border-transparent text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                <span className="text-center leading-tight">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab body */}
          <div className="p-6 md:p-8">
            {/* ── Stripe ── */}
            {activeTab === "stripe" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <span
                    className="material-symbols-outlined text-blue-600 text-[22px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified_user
                  </span>
                  <p className="text-caption text-blue-700">
                    You&apos;ll be redirected to <strong>Stripe&apos;s secure checkout</strong>. Payment is verified{" "}
                    <strong>instantly</strong> upon completion — no receipt upload required.
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-outline-variant/30 bg-surface-container-low space-y-3">
                  <p className="text-caption text-outline uppercase tracking-wider font-semibold">
                    You are paying
                  </p>
                  <p className="text-[28px] font-bold text-primary">
                    Rs. {fee.toLocaleString()}
                  </p>
                  <p className="text-body-md text-on-surface-variant">
                    Consultation with {doctor.name}
                    {selectedClinic?.name ? ` · ${selectedClinic.name}` : ""}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {["Visa", "Mastercard", "Amex", "UnionPay"].map((b) => (
                    <span
                      key={b}
                      className="px-3 py-1 bg-surface-container-low rounded border border-outline-variant/30 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant"
                    >
                      {b}
                    </span>
                  ))}
                </div>

                {stripeError && (
                  <p className="text-caption text-error flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    {stripeError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleStripeCheckout}
                  disabled={stripeLoading}
                  className="w-full py-4 rounded-xl bg-primary text-on-primary text-[14px] font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {stripeLoading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                      Redirecting to Stripe…
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">lock</span>
                      Pay Rs. {fee.toLocaleString()} with Stripe
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2 justify-center text-caption text-outline">
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                  Secured by Stripe · 256-bit SSL · PCI DSS compliant
                </div>
              </div>
            )}

            {/* ── JazzCash ── */}
            {activeTab === "jazzcash" && (
              <WalletTab
                label="JazzCash"
                method="jazzcash"
                number={JAZZCASH_NUMBER}
                accentBorder="border-red-100"
                fee={fee}
              />
            )}

            {/* ── Easypaisa ── */}
            {activeTab === "easypaisa" && (
              <WalletTab
                label="Easypaisa"
                method="easypaisa"
                number={EASYPAISA_NUMBER}
                accentBorder="border-green-100"
                fee={fee}
              />
            )}

            {/* ── Pay at Reception ── */}
            {activeTab === "reception" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <span
                    className="material-symbols-outlined text-amber-600 text-[22px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    storefront
                  </span>
                  <p className="text-caption text-amber-700">
                    Pay in person at the clinic reception on your visit day. Your slot is reserved{" "}
                    <strong>without needing a receipt upload</strong>.
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-outline-variant/30 bg-surface-container-low space-y-3">
                  <p className="text-caption text-outline uppercase tracking-wider font-semibold">
                    Amount payable at reception
                  </p>
                  <p className="text-[28px] font-bold text-primary">
                    Rs. {fee.toLocaleString()}
                  </p>
                  <p className="text-body-md text-on-surface-variant">
                    Consultation with {doctor.name}
                    {selectedClinic?.name ? ` · ${selectedClinic.name}` : ""}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleReceptionConfirm}
                  disabled={receptionLoading}
                  className="w-full py-4 rounded-xl bg-primary text-on-primary text-[14px] font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  {receptionLoading ? "Confirming…" : "Confirm Booking · Pay at Reception"}
                </button>
              </div>
            )}

            {/* ── WhatsApp ── */}
            {activeTab === "whatsapp" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                  <span
                    className="material-symbols-outlined text-green-600 text-[22px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    chat
                  </span>
                  <p className="text-caption text-green-700">
                    This opens WhatsApp with your appointment details pre-filled. The clinic will{" "}
                    <strong>confirm your slot instantly</strong> during working hours.
                  </p>
                </div>

                {/* Message preview */}
                <div className="bg-surface-container-low rounded-xl border border-outline-variant/30 p-5 space-y-2">
                  <p className="text-caption text-outline uppercase tracking-wider font-semibold mb-3">
                    Message preview
                  </p>
                  {[
                    ["Doctor", doctor.name],
                    ["Clinic", selectedClinic?.name ?? "—"],
                    ["Date", formattedDate],
                    ["Time", selectedTime ?? "—"],
                    ["Visit", visitType === "online" ? "Online" : "In-Clinic"],
                    ["Patient", patientInfo.fullName || "—"],
                    ["Phone", patientInfo.phone || "—"],
                    ...(patientInfo.condition ? [["Condition", patientInfo.condition]] : []),
                  ].map(([label, value]) => (
                    <div key={label} className="flex gap-2 text-body-md">
                      <span className="text-on-surface-variant w-20 shrink-0">{label}:</span>
                      <span className="font-semibold text-on-surface">{value}</span>
                    </div>
                  ))}
                </div>

                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 rounded-xl bg-[#25D366] text-white text-[14px] font-bold shadow-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                  Book Appointment on WhatsApp
                </a>

                <p className="text-center text-caption text-outline">
                  Opens WhatsApp with {doctor.contact.helpline}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-start">
          <button
            type="button"
            onClick={() => router.push("/book-appointment/step-4")}
            className="px-8 py-3 rounded-xl border border-outline-variant text-[14px] font-semibold text-on-surface-variant hover:bg-surface-container-high transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back
          </button>
        </div>
      </div>

      {/* ── Right: Summary ── */}
      <div className="lg:col-span-4 sticky top-32">
        <div className="bg-white border border-outline-variant/50 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 bg-primary/5 border-b border-outline-variant/30">
            <h3 className="text-body-lg font-semibold text-primary">Appointment Summary</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
                <Image
                  src={doctor.profile_image}
                  alt={doctor.name}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              <div>
                <p className="text-caption text-primary font-semibold">Your Doctor</p>
                <h3 className="text-body-lg font-semibold leading-tight text-on-surface">
                  {doctor.name}
                </h3>
                <p className="text-caption text-on-surface-variant">
                  {doctor.specialization[0]}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {summaryRows.map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-4">
                  <span className="text-caption uppercase tracking-wider text-on-surface-variant">
                    {label}
                  </span>
                  <span className="text-[13px] font-semibold text-on-surface text-right max-w-[60%] truncate">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-outline-variant/30 pt-5 space-y-3">
              <div className="flex justify-between text-body-md text-on-surface-variant">
                <span>Consultation Fee</span>
                <span>Rs. {fee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-body-md text-on-surface-variant">
                <span>Booking Fee</span>
                <span>Rs. 0</span>
              </div>
              <div className="flex justify-between pt-2 text-body-lg font-semibold text-on-surface">
                <span>Total</span>
                <span className="text-primary">Rs. {fee.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-outline text-caption">
              <span className="material-symbols-outlined text-[16px]">lock</span>
              <p>Payments are secure and encrypted</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
