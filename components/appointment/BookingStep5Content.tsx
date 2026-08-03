"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { toast } from "react-toastify";
import QRCode from "react-qr-code";
import { useBookingStore, type PatientInfo } from "@/store/bookingStore";
import { doctor as staticDoctor } from "@/lib/data";
import { useDoctorProfile } from "@/lib/context/DoctorProfileContext";

type Tab = "bank" | "jazzcash" | "easypaisa" | "reception" | "whatsapp";

// ── Wallet tab (Bank / JazzCash / Easypaisa) ─────────────────────────────────
function WalletTab({
  label,
  method,
  number,
  accountTitle,
  accentBorder,
  fee,
  extraField,
  qrImageUrl,
}: {
  label: string;
  method: "bank" | "jazzcash" | "easypaisa";
  number: string;
  accountTitle: string;
  accentBorder: string;
  fee: number;
  extraField?: { label: string; value: string };
  qrImageUrl?: string;
}) {
  const doctor = useDoctorProfile();
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

  const isBank = method === "bank";
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
            {qrImageUrl ? (
              <Image src={qrImageUrl} alt={`${label} QR code`} width={136} height={136} className="object-contain" unoptimized />
            ) : (
              <QRCode value={qrValue} size={136} fgColor="#1c1b1f" bgColor="#ffffff" />
            )}
            <p className="text-caption text-center text-outline mt-2">Scan with {label}</p>
          </div>

          {/* Number + instructions */}
          <div className="flex-1 space-y-3">
            <p className="text-body-md text-on-surface-variant">
              {isBank ? (
                <>
                  Transfer via your bank app or branch → enter the account number below → send{" "}
                  <strong>Rs. {fee.toLocaleString()}</strong>.
                </>
              ) : (
                <>
                  Open <strong>{label}</strong> app → tap <strong>Send Money</strong> or{" "}
                  <strong>Scan QR</strong> → enter the amount <strong>Rs. {fee.toLocaleString()}</strong>.
                </>
              )}
            </p>

            {extraField && (
              <div>
                <p className="text-caption text-outline uppercase tracking-wider font-semibold">
                  {extraField.label}
                </p>
                <p className="text-body-md font-semibold text-on-surface mt-0.5">{extraField.value}</p>
              </div>
            )}

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
              <p className="text-body-md font-semibold text-on-surface mt-0.5">{accountTitle || doctor.name}</p>
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
  const doctor = useDoctorProfile();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("resume");
  const { selectedClinic, selectedProcedure, selectedDate, selectedTime, visitType, patientInfo, appointmentId, appointmentNumber } =
    useBookingStore();
  const setClinic = useBookingStore((s) => s.setClinic);
  const setProcedure = useBookingStore((s) => s.setProcedure);
  const clearProcedure = useBookingStore((s) => s.clearProcedure);
  const setVisitType = useBookingStore((s) => s.setVisitType);
  const setReason = useBookingStore((s) => s.setReason);
  const setDate = useBookingStore((s) => s.setDate);
  const setTime = useBookingStore((s) => s.setTime);
  const setPatientInfo = useBookingStore((s) => s.setPatientInfo);
  const setAppointment = useBookingStore((s) => s.setAppointment);
  const [activeTab, setActiveTab] = useState<Tab>("bank");
  const [receptionLoading, setReceptionLoading] = useState(false);
  const [resuming, setResuming] = useState(!!resumeId);
  const [paymentSettings, setPaymentSettings] = useState({
    jazzcashNumber: "",
    jazzcashAccountTitle: "",
    jazzcashQrUrl: undefined as string | undefined,
    easypaisaNumber: "",
    easypaisaAccountTitle: "",
    easypaisaQrUrl: undefined as string | undefined,
    bankName: "",
    bankAccountNumber: "",
    bankAccountTitle: "",
    bankQrUrl: undefined as string | undefined,
  });

  // "Continue Booking" from the patient dashboard links here with ?resume=<id>
  // instead of relying on client store state, since the dashboard and the public
  // booking pages sit under separate root layouts — navigating between them is a
  // full page reload, which wipes the in-memory-only appointmentId/appointmentNumber
  // (see store/bookingStore.ts's partialize comment). Re-fetch the appointment from
  // the server here and re-hydrate the store from it instead.
  useEffect(() => {
    if (!resumeId) return;
    (async () => {
      try {
        const res = await fetch(`/api/appointments/${resumeId}`);
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error ?? "Could not load this appointment");
          router.replace("/book-appointment/step-4");
          return;
        }
        const appt = data.appointment;
        const clinic = appt.clinicId;
        setClinic({
          id: typeof clinic === "string" ? clinic : String(clinic._id),
          name: typeof clinic === "string" ? "" : clinic.name ?? "",
          address: typeof clinic === "string" ? null : clinic.address ?? null,
          fee_pkr: appt.feeSnapshotPkr,
          timings: {},
        });
        if (appt.procedureId && appt.procedureNameSnapshot) {
          setProcedure({
            procedureId: String(appt.procedureId),
            name: appt.procedureNameSnapshot,
            pricePkr: appt.feeSnapshotPkr,
            durationMinutes: appt.durationMinutes ?? 30,
          });
        } else {
          clearProcedure();
        }
        setVisitType(appt.visitType);
        setReason(appt.reason ?? "");
        setDate(appt.date);
        setTime(appt.time);
        setPatientInfo({
          fullName: appt.patientSnapshot.fullName,
          phone: appt.patientSnapshot.phone,
          gender: (appt.patientSnapshot.gender as PatientInfo["gender"]) ?? "Male",
          age: String(appt.patientSnapshot.age),
          cnic: appt.patientSnapshot.cnic ?? "",
          email: appt.patientSnapshot.email ?? "",
          city: appt.patientSnapshot.city,
          isExisting: appt.patientSnapshot.isExisting ?? false,
          condition: appt.patientSnapshot.condition ?? "",
          notes: appt.patientSnapshot.notes ?? "",
        });
        setAppointment(String(appt._id), appt.appointmentNumber);
      } catch {
        toast.error("Network error loading appointment");
        router.replace("/book-appointment/step-4");
      } finally {
        setResuming(false);
      }
    })();
    // Only ever needs to run once per landing on this page with a resume id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId]);

  // Payment requires an appointment to already exist (created at the end of Step 4,
  // or hydrated above from ?resume=). Skip the check while that hydration is in flight.
  useEffect(() => {
    if (resuming) return;
    if (!appointmentId) {
      router.replace("/book-appointment/step-4");
    }
  }, [appointmentId, resuming, router]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/payment-settings");
        const data = await res.json();
        if (res.ok) setPaymentSettings(data.settings);
      } catch {
        // Non-fatal — wallet tabs just show blank numbers until this loads/retries.
      }
    })();
  }, []);

  const fee = selectedProcedure?.pricePkr ?? selectedClinic?.fee_pkr ?? staticDoctor.fee_summary.min_fee_pkr;

  const formattedDate = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

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
      `${selectedProcedure ? `🩻 Procedure: ${selectedProcedure.name}\n` : ""}` +
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

  const waNumber = doctor.contactWhatsapp.replace(/\D/g, "") || "923326568897";
  const waLink = `https://wa.me/${waNumber}?text=${waMessage}`;

  const summaryRows = [
    ...(selectedProcedure ? [{ label: "Procedure", value: selectedProcedure.name }] : []),
    { label: "Clinic", value: selectedClinic?.name ?? "—" },
    { label: "Date", value: formattedDate },
    { label: "Time", value: selectedTime ?? "—" },
    { label: "Patient", value: patientInfo.fullName || "—" },
  ];

  // "Pay at Reception" only makes sense for an in-clinic visit — there's no
  // reception desk to pay at for an online consultation.
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "bank", label: "Bank Transfer", icon: "account_balance" },
    { id: "jazzcash", label: "JazzCash", icon: "account_balance_wallet" },
    { id: "easypaisa", label: "Easypaisa", icon: "account_balance_wallet" },
    ...(visitType === "online" ? [] : [{ id: "reception" as Tab, label: "Pay at Reception", icon: "storefront" }]),
    { id: "whatsapp", label: "WhatsApp", icon: "chat" },
  ];

  if (resuming) {
    return (
      <div className="flex items-center justify-center py-24 text-on-surface-variant text-body-lg">
        Loading your appointment…
      </div>
    );
  }

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
            {/* ── Bank Transfer ── */}
            {activeTab === "bank" && (
              <WalletTab
                label={paymentSettings.bankName ? `${paymentSettings.bankName} Bank` : "Bank"}
                method="bank"
                number={paymentSettings.bankAccountNumber}
                accountTitle={paymentSettings.bankAccountTitle}
                accentBorder="border-blue-100"
                fee={fee}
                extraField={{ label: "Bank Name", value: paymentSettings.bankName }}
                qrImageUrl={paymentSettings.bankQrUrl}
              />
            )}

            {/* ── JazzCash ── */}
            {activeTab === "jazzcash" && (
              <WalletTab
                label="JazzCash"
                method="jazzcash"
                number={paymentSettings.jazzcashNumber}
                accountTitle={paymentSettings.jazzcashAccountTitle}
                accentBorder="border-red-100"
                fee={fee}
                qrImageUrl={paymentSettings.jazzcashQrUrl}
              />
            )}

            {/* ── Easypaisa ── */}
            {activeTab === "easypaisa" && (
              <WalletTab
                label="Easypaisa"
                method="easypaisa"
                number={paymentSettings.easypaisaNumber}
                accountTitle={paymentSettings.easypaisaAccountTitle}
                accentBorder="border-green-100"
                fee={fee}
                qrImageUrl={paymentSettings.easypaisaQrUrl}
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
                    {selectedProcedure?.name ?? "Consultation"} with {doctor.name}
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
                  Opens WhatsApp with {doctor.contactPhone}
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
                  src={doctor.profileImage}
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
                <span>{selectedProcedure ? "Procedure Fee" : "Consultation Fee"}</span>
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
