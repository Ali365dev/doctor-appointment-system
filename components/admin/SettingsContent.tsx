"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { getClinicDateString, addDaysToDateString } from "@/lib/timezone";
import { useDoctorProfile } from "@/lib/context/DoctorProfileContext";
import { createLetterheadPdf } from "@/lib/pdf/letterhead";

type QrMethod = "bank" | "jazzcash" | "easypaisa";

function QrUploadField({
  qrUrl,
  uploading,
  inputRef,
  onSelect,
}: {
  qrUrl?: string;
  uploading: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onSelect: (file: File) => void;
}) {
  return (
    <div>
      <label className="block text-label-md text-on-surface-variant mb-xs">QR Code</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
        }}
      />
      {qrUrl ? (
        <div className="flex items-center gap-md">
          <div className="relative w-20 h-20 rounded-xl border border-outline-variant overflow-hidden bg-surface-container-lowest shrink-0">
            <Image src={qrUrl} alt="QR code" fill className="object-contain p-xs" unoptimized />
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="text-sm text-primary font-semibold hover:underline disabled:opacity-60"
          >
            {uploading ? "Uploading…" : "Replace QR Code"}
          </button>
        </div>
      ) : (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          className="border-2 border-dashed border-outline-variant rounded-xl p-lg flex flex-col items-center justify-center gap-xs cursor-pointer hover:border-primary transition-colors group bg-surface-container-lowest"
        >
          <span className="material-symbols-outlined text-2xl text-outline group-hover:text-primary">
            {uploading ? "progress_activity" : "qr_code_2"}
          </span>
          <p className="text-sm text-on-surface-variant">
            {uploading ? "Uploading…" : (<>Drop QR image here or <span className="text-primary font-semibold">browse</span></>)}
          </p>
          <p className="text-caption text-outline">PNG, JPG, or WEBP, max 5 MB</p>
        </div>
      )}
    </div>
  );
}

const tabs = [
  { id: "payment", label: "Payment Settings", icon: "payments" },
  { id: "notifications", label: "Notifications", icon: "notifications" },
  { id: "digest", label: "Daily Digest", icon: "mail" },
  { id: "security", label: "Security", icon: "lock" },
  { id: "cleanup", label: "Data Cleanup", icon: "delete_sweep" },
];

interface CleanupAppointmentRow {
  _id: string;
  appointmentNumber: string;
  date: string;
  time: string;
  status: string;
  feeSnapshotPkr: number;
  patientSnapshot: { fullName: string; phone: string; email?: string };
  clinicId: { name?: string } | string;
  paymentId?: { method?: string; status?: string; amountPkr?: number } | string;
}

interface CleanupPreview {
  appointmentCount: number;
  paymentCount: number;
  totalAmountPkr: number;
  appointments: CleanupAppointmentRow[];
}

// Uses the clinic's own timezone (Asia/Karachi) rather than the browser's/server's local
// clock or raw UTC — otherwise "today" can silently land on the wrong calendar day
// depending on where this page happens to be viewed from or rendered.
function isoDaysAgo(days: number): string {
  return addDaysToDateString(getClinicDateString(), -days);
}

const CLEANUP_PRESETS = [
  { label: "Last Week", days: 7 },
  { label: "Last Month", days: 30 },
  { label: "Last 3 Months", days: 90 },
  { label: "Last 6 Months", days: 180 },
  { label: "Last Year", days: 365 },
  { label: "Last 2 Years", days: 730 },
];

function downloadCsv(filename: string, headers: string[], rows: (string | number)[][], preamble: string[][] = []) {
  const csv = [...preamble, headers, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const MIN_PASSWORD_LENGTH = 8;

export default function SettingsContent() {
  const doctor = useDoctorProfile();
  const [activeTab, setActiveTab] = useState("payment");
  const [notifications, setNotifications] = useState({
    confirmEmail: true, confirmSMS: true,
    reminderEmail: true, reminderSMS: false,
    surveyPush: true,
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState({ current: false, new: false, confirm: false });
  const [changingPassword, setChangingPassword] = useState(false);

  const EARLIEST_RECORD_DATE = "2000-01-01"; // stand-in for "no start limit" — Mongo query lower bound
  const [cleanupFrom, setCleanupFrom] = useState(EARLIEST_RECORD_DATE);
  const [cleanupFromAllTime, setCleanupFromAllTime] = useState(true);
  const [cleanupTo, setCleanupTo] = useState(isoDaysAgo(0));
  const [cleanupPreview, setCleanupPreview] = useState<CleanupPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function applyCleanupPreset(days: number) {
    // A preset targets just that trailing window (e.g. "Last Week" = the last
    // 7 days) — for a true "delete everything before some date" wipe, use the
    // "All time" toggle on the From field instead.
    setCleanupFromAllTime(false);
    setCleanupFrom(isoDaysAgo(days));
    setCleanupTo(isoDaysAgo(0));
    setCleanupPreview(null);
  }

  async function handlePreviewCleanup() {
    if (!cleanupFrom || !cleanupTo) {
      toast.error("Choose a date range first");
      return;
    }
    setPreviewLoading(true);
    setCleanupPreview(null);
    try {
      const res = await fetch(`/api/admin/data-cleanup?from=${cleanupFrom}&to=${cleanupTo}`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not load preview");
        return;
      }
      setCleanupPreview(data.preview);
      if (data.preview.appointmentCount === 0) {
        toast.info("No records found in that date range");
      }
    } catch {
      toast.error("Network error loading preview");
    } finally {
      setPreviewLoading(false);
    }
  }

  function handleExportCleanupCsv() {
    if (!cleanupPreview) return;
    const clinicName = (c: CleanupAppointmentRow["clinicId"]) => (typeof c === "string" ? c : c?.name ?? "—");
    const payment = (p: CleanupAppointmentRow["paymentId"]) => (typeof p === "object" && p ? p : null);

    downloadCsv(
      `appointments-payments_${cleanupFrom}_to_${cleanupTo}.csv`,
      ["Appointment #", "Date", "Time", "Patient", "Phone", "Email", "Clinic", "Status", "Fee (Rs.)", "Payment Method", "Payment Status", "Payment Amount (Rs.)"],
      cleanupPreview.appointments.map((a) => {
        const p = payment(a.paymentId);
        return [
          a.appointmentNumber,
          a.date,
          a.time,
          a.patientSnapshot.fullName,
          a.patientSnapshot.phone,
          a.patientSnapshot.email ?? "—",
          clinicName(a.clinicId),
          a.status,
          a.feeSnapshotPkr,
          p?.method ?? "—",
          p?.status ?? "—",
          p?.amountPkr ?? "—",
        ];
      }),
      [
        ["Date Range", `${cleanupFromAllTime ? "All time" : cleanupFrom} to ${cleanupTo}`],
        ["Generated", new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })],
        [],
      ]
    );
    toast.success("Exported — you can now safely delete these records");
  }

  async function handleExportCleanupPdf() {
    if (!cleanupPreview) return;
    const clinicName = (c: CleanupAppointmentRow["clinicId"]) => (typeof c === "string" ? c : c?.name ?? "—");
    const payment = (p: CleanupAppointmentRow["paymentId"]) => (typeof p === "object" && p ? p : null);

    const { doc, headerHeight, renderTable, drawSectionTitle, drawFooter } = await createLetterheadPdf(doctor, {
      title: "Deleted Records Backup",
    });
    const range = cleanupFromAllTime ? `All time to ${cleanupTo}` : `${cleanupFrom} to ${cleanupTo}`;
    const tableStartY = drawSectionTitle(`Date Range: ${range}`, headerHeight + 6);
    renderTable({
      startY: tableStartY,
      headers: ["Appointment #", "Date", "Time", "Patient", "Phone", "Email", "Clinic", "Status", "Fee (Rs.)", "Payment Method", "Payment Status", "Payment Amount (Rs.)"],
      rows: cleanupPreview.appointments.map((a) => {
        const p = payment(a.paymentId);
        return [
          a.appointmentNumber,
          a.date,
          a.time,
          a.patientSnapshot.fullName,
          a.patientSnapshot.phone,
          a.patientSnapshot.email ?? "—",
          clinicName(a.clinicId),
          a.status,
          a.feeSnapshotPkr.toLocaleString(),
          p?.method ?? "—",
          p?.status ?? "—",
          p?.amountPkr != null ? p.amountPkr.toLocaleString() : "—",
        ];
      }),
      badgeColumns: ["Status", "Payment Status"],
    });
    drawFooter();
    doc.save(`appointments-payments_${cleanupFrom}_to_${cleanupTo}.pdf`);
    toast.success("Exported — you can now safely delete these records");
  }

  async function handleConfirmDeleteCleanup() {
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/data-cleanup", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: cleanupFrom, to: cleanupTo }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not delete records");
        return;
      }
      toast.success(
        `Deleted ${data.result.appointmentsDeleted} appointment(s) and ${data.result.paymentsDeleted} payment(s)`
      );
      setCleanupPreview(null);
      setShowDeleteConfirm(false);
    } catch {
      toast.error("Network error deleting records");
    } finally {
      setDeleting(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword) {
      toast.error("Enter your current password");
      return;
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      toast.error(`New password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not update password");
        return;
      }
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Network error while updating password");
    } finally {
      setChangingPassword(false);
    }
  }

  const [digestLoading, setDigestLoading] = useState(true);
  const [digestEnabled, setDigestEnabled] = useState(true);
  const [digestSendTime, setDigestSendTime] = useState("08:00");
  const [digestEmail, setDigestEmail] = useState("");
  const [savingDigest, setSavingDigest] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/digest-settings");
        const data = await res.json();
        if (res.ok) {
          setDigestEnabled(data.settings.enabled);
          setDigestSendTime(data.settings.sendTime);
          setDigestEmail(data.settings.email ?? "");
        } else {
          toast.error(data.error ?? "Could not load digest settings");
        }
      } catch {
        toast.error("Network error loading digest settings");
      } finally {
        setDigestLoading(false);
      }
    })();
  }, []);

  async function handleSaveDigest(patch: { enabled?: boolean; sendTime?: string; email?: string | null }) {
    setSavingDigest(true);
    try {
      const res = await fetch("/api/digest-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not save digest settings");
        return;
      }
      setDigestEnabled(data.settings.enabled);
      setDigestSendTime(data.settings.sendTime);
      setDigestEmail(data.settings.email ?? "");
      toast.success("Digest settings saved");
    } catch {
      toast.error("Network error saving digest settings");
    } finally {
      setSavingDigest(false);
    }
  }

  const [paymentSettingsLoading, setPaymentSettingsLoading] = useState(true);
  const [jazzcashNumber, setJazzcashNumber] = useState("");
  const [jazzcashAccountTitle, setJazzcashAccountTitle] = useState("");
  const [easypaisaNumber, setEasypaisaNumber] = useState("");
  const [easypaisaAccountTitle, setEasypaisaAccountTitle] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountTitle, setBankAccountTitle] = useState("");
  const [qrUrls, setQrUrls] = useState<Record<QrMethod, string | undefined>>({
    bank: undefined,
    jazzcash: undefined,
    easypaisa: undefined,
  });
  const [uploadingQr, setUploadingQr] = useState<QrMethod | null>(null);
  const qrInputRefs = {
    bank: useRef<HTMLInputElement>(null),
    jazzcash: useRef<HTMLInputElement>(null),
    easypaisa: useRef<HTMLInputElement>(null),
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/payment-settings");
        const data = await res.json();
        if (res.ok) {
          setJazzcashNumber(data.settings.jazzcashNumber);
          setJazzcashAccountTitle(data.settings.jazzcashAccountTitle);
          setEasypaisaNumber(data.settings.easypaisaNumber);
          setEasypaisaAccountTitle(data.settings.easypaisaAccountTitle);
          setBankName(data.settings.bankName);
          setBankAccountNumber(data.settings.bankAccountNumber);
          setBankAccountTitle(data.settings.bankAccountTitle);
          setQrUrls({
            bank: data.settings.bankQrUrl,
            jazzcash: data.settings.jazzcashQrUrl,
            easypaisa: data.settings.easypaisaQrUrl,
          });
        } else {
          toast.error(data.error ?? "Could not load payment settings");
        }
      } catch {
        toast.error("Network error loading payment settings");
      } finally {
        setPaymentSettingsLoading(false);
      }
    })();
  }, []);

  async function handleQrUpload(method: QrMethod, file: File) {
    setUploadingQr(method);
    try {
      const formData = new FormData();
      formData.append("method", method);
      formData.append("file", file);
      const res = await fetch("/api/payment-settings/qr", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not upload QR code");
        return;
      }
      setQrUrls((prev) => ({ ...prev, [method]: data.settings[`${method}QrUrl`] }));
      toast.success("QR code updated");
    } catch {
      toast.error("Network error uploading QR code");
    } finally {
      setUploadingQr(null);
    }
  }

  async function handleSave() {
    if (activeTab !== "payment") {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/payment-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jazzcashNumber,
          jazzcashAccountTitle,
          easypaisaNumber,
          easypaisaAccountTitle,
          bankName,
          bankAccountNumber,
          bankAccountTitle,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not save payment settings");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      toast.error("Network error saving payment settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-gutter py-lg overflow-y-auto h-[calc(100vh-72px)]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-xl">
          <div>
            <h2 className="text-headline-lg font-bold text-on-surface">Settings</h2>
            <p className="text-on-surface-variant text-body-md">Manage clinic configuration, payments, and security preferences.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-md py-sm rounded-xl font-bold shadow-lg transition-all flex items-center gap-xs disabled:opacity-60 ${saved ? "bg-secondary text-on-secondary" : "bg-primary text-on-primary hover:brightness-110"}`}
          >
            <span className="material-symbols-outlined text-[20px]">{saving ? "progress_activity" : saved ? "check_circle" : "save"}</span>
            {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>

        {/* Tab Nav */}
        <div className="flex gap-xs bg-surface-container-low p-xs rounded-2xl mb-xl">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-xs px-sm py-sm rounded-xl text-label-md font-semibold transition-all ${activeTab === t.id ? "bg-surface shadow-sm text-primary" : "text-on-surface-variant hover:text-on-surface hover:bg-surface/50"}`}
            >
              <span className="material-symbols-outlined text-[20px]">{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab: Payment Settings */}
        {activeTab === "payment" && (
          <div className="space-y-lg">
            {paymentSettingsLoading ? (
              <div className="bg-surface border border-outline-variant rounded-2xl p-xl text-center text-on-surface-variant">
                <span className="material-symbols-outlined animate-spin align-middle mr-xs">progress_activity</span>
                Loading payment settings…
              </div>
            ) : (
              <>
                {/* Bank Transfer */}
                <section className="bg-surface border border-outline-variant rounded-2xl p-md shadow-sm">
                  <h3 className="text-headline-md font-semibold mb-md flex items-center gap-sm">
                    <span className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-on-primary shrink-0">
                      <span className="material-symbols-outlined text-[22px]">account_balance</span>
                    </span>
                    Bank Transfer
                  </h3>
                  <p className="text-caption text-on-surface-variant mb-md">
                    Shown to patients on the booking payment step. Manual receipt verification.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
                    <div>
                      <label className="block text-label-md text-on-surface-variant mb-xs">Bank Name</label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface"
                      />
                    </div>
                    <div>
                      <label className="block text-label-md text-on-surface-variant mb-xs">Account Number</label>
                      <input
                        type="text"
                        value={bankAccountNumber}
                        onChange={(e) => setBankAccountNumber(e.target.value)}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface"
                      />
                    </div>
                    <div>
                      <label className="block text-label-md text-on-surface-variant mb-xs">Account Title</label>
                      <input
                        type="text"
                        value={bankAccountTitle}
                        onChange={(e) => setBankAccountTitle(e.target.value)}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface"
                      />
                    </div>
                  </div>
                  <div className="mt-md">
                    <QrUploadField
                      qrUrl={qrUrls.bank}
                      uploading={uploadingQr === "bank"}
                      inputRef={qrInputRefs.bank}
                      onSelect={(file) => handleQrUpload("bank", file)}
                    />
                  </div>
                </section>

                {/* Local Payments */}
                <section className="bg-surface border border-outline-variant rounded-2xl p-md shadow-sm">
                  <h3 className="text-headline-md font-semibold mb-md flex items-center gap-sm">
                    <span className="material-symbols-outlined text-tertiary">account_balance_wallet</span> Local Payment Numbers
                  </h3>
                  <div className="space-y-md">
                    <div>
                      <label className="flex items-center gap-sm text-label-md text-on-surface-variant mb-xs">
                        <span className="w-3 h-3 rounded-full bg-[#f64c1c]" /> JazzCash Number
                      </label>
                      <input
                        type="text"
                        value={jazzcashNumber}
                        onChange={(e) => setJazzcashNumber(e.target.value)}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface mb-sm"
                      />
                      <label className="block text-label-md text-on-surface-variant mb-xs">Account Title</label>
                      <input
                        type="text"
                        value={jazzcashAccountTitle}
                        onChange={(e) => setJazzcashAccountTitle(e.target.value)}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface mb-sm"
                      />
                      <QrUploadField
                        qrUrl={qrUrls.jazzcash}
                        uploading={uploadingQr === "jazzcash"}
                        inputRef={qrInputRefs.jazzcash}
                        onSelect={(file) => handleQrUpload("jazzcash", file)}
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-sm text-label-md text-on-surface-variant mb-xs">
                        <span className="w-3 h-3 rounded-full bg-[#1db04e]" /> Easypaisa Number
                      </label>
                      <input
                        type="text"
                        value={easypaisaNumber}
                        onChange={(e) => setEasypaisaNumber(e.target.value)}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface mb-sm"
                      />
                      <label className="block text-label-md text-on-surface-variant mb-xs">Account Title</label>
                      <input
                        type="text"
                        value={easypaisaAccountTitle}
                        onChange={(e) => setEasypaisaAccountTitle(e.target.value)}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface mb-sm"
                      />
                      <QrUploadField
                        qrUrl={qrUrls.easypaisa}
                        uploading={uploadingQr === "easypaisa"}
                        inputRef={qrInputRefs.easypaisa}
                        onSelect={(file) => handleQrUpload("easypaisa", file)}
                      />
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        )}

        {/* Tab: Notifications */}
        {activeTab === "notifications" && (
          <section className="bg-surface border border-outline-variant rounded-2xl p-md shadow-sm">
            <h3 className="text-headline-md font-semibold mb-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">notifications_active</span> Notification Preferences
            </h3>
            <div className="space-y-lg">
              {[
                {
                  label: "Appointment Confirmations",
                  desc: "Sent immediately when an appointment is booked.",
                  icon: "event_available",
                  channels: [
                    { key: "confirmEmail", label: "Email" },
                    { key: "confirmSMS", label: "SMS" },
                  ],
                },
                {
                  label: "24-Hour Reminders",
                  desc: "Remind patient and doctor one day before.",
                  icon: "alarm",
                  channels: [
                    { key: "reminderEmail", label: "Email" },
                    { key: "reminderSMS", label: "SMS" },
                  ],
                },
                {
                  label: "Follow-up Surveys",
                  desc: "Post-appointment satisfaction surveys.",
                  icon: "rate_review",
                  channels: [
                    { key: "surveyPush", label: "Push Notification" },
                  ],
                },
              ].map((group) => (
                <div key={group.label} className="p-md bg-surface-container-lowest rounded-xl border border-outline-variant">
                  <div className="flex items-center gap-sm mb-md">
                    <span className="material-symbols-outlined text-primary">{group.icon}</span>
                    <div>
                      <p className="font-semibold text-on-surface">{group.label}</p>
                      <p className="text-caption text-on-surface-variant">{group.desc}</p>
                    </div>
                  </div>
                  <div className="flex gap-md flex-wrap">
                    {group.channels.map((ch) => (
                      <label key={ch.key} className={`flex items-center gap-sm px-md py-sm border-2 rounded-xl cursor-pointer transition-all ${notifications[ch.key as keyof typeof notifications] ? "border-primary bg-primary/5 text-primary" : "border-outline-variant text-on-surface-variant"}`}>
                        <input
                          type="checkbox"
                          checked={notifications[ch.key as keyof typeof notifications]}
                          onChange={() => setNotifications((prev) => ({ ...prev, [ch.key]: !prev[ch.key as keyof typeof notifications] }))}
                          className="accent-primary w-4 h-4"
                        />
                        <span className="font-semibold text-sm">{ch.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tab: Daily Digest */}
        {activeTab === "digest" && (
          <section className="bg-surface border border-outline-variant rounded-2xl p-md shadow-sm">
            <h3 className="text-headline-md font-semibold mb-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">mail</span> Daily Appointment Digest
            </h3>
            {digestLoading ? (
              <div className="text-center text-on-surface-variant py-lg">
                <span className="material-symbols-outlined animate-spin align-middle mr-xs">progress_activity</span>
                Loading digest settings…
              </div>
            ) : (
              <div className="space-y-md max-w-md">
                <p className="text-caption text-on-surface-variant">
                  Sends today&apos;s and tomorrow&apos;s full appointment lists to the admin email once a day.
                </p>

                <div className="flex items-center justify-between p-md bg-surface-container-lowest rounded-xl border border-outline-variant">
                  <div>
                    <p className="font-semibold text-on-surface">Enable Daily Digest</p>
                    <p className="text-caption text-on-surface-variant">Turn the daily email on or off.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      checked={digestEnabled}
                      onChange={(e) => handleSaveDigest({ enabled: e.target.checked })}
                      disabled={savingDigest}
                      type="checkbox"
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                  </label>
                </div>

                <div>
                  <label className="block text-label-md text-on-surface-variant mb-xs">Send Time (Asia/Karachi)</label>
                  <div className="flex items-center gap-sm">
                    <input
                      type="time"
                      value={digestSendTime}
                      onChange={(e) => setDigestSendTime(e.target.value)}
                      className="bg-surface-container-lowest border border-outline-variant rounded-xl p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface"
                    />
                    <button
                      onClick={() => handleSaveDigest({ sendTime: digestSendTime })}
                      disabled={savingDigest}
                      className="bg-primary text-on-primary px-md py-sm rounded-xl font-bold hover:brightness-110 transition-all shadow-sm disabled:opacity-60"
                    >
                      {savingDigest ? "Saving…" : "Save Time"}
                    </button>
                  </div>
                  <p className="text-caption text-outline mt-xs">Takes effect on the next check, usually within 15 minutes.</p>
                </div>

                <div>
                  <label className="block text-label-md text-on-surface-variant mb-xs">Recipient Email</label>
                  <div className="flex items-center gap-sm">
                    <input
                      type="email"
                      value={digestEmail}
                      onChange={(e) => setDigestEmail(e.target.value)}
                      placeholder="admin@example.com"
                      className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface"
                    />
                    <button
                      onClick={() => handleSaveDigest({ email: digestEmail.trim() || null })}
                      disabled={savingDigest}
                      className="bg-primary text-on-primary px-md py-sm rounded-xl font-bold hover:brightness-110 transition-all shadow-sm disabled:opacity-60"
                    >
                      {savingDigest ? "Saving…" : "Save Email"}
                    </button>
                  </div>
                  <p className="text-caption text-outline mt-xs">Leave blank to use the server default recipient.</p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Tab: Security */}
        {activeTab === "security" && (
          <div className="space-y-lg">
            {/* Password Change */}
            <section className="bg-surface border border-outline-variant rounded-2xl p-md shadow-sm">
              <h3 className="text-headline-md font-semibold mb-md flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary">key</span> Change Password
              </h3>
              <div className="space-y-md max-w-md">
                {(
                  [
                    ["current", "Current Password", "Enter current password", currentPassword, setCurrentPassword],
                    ["new", "New Password", `At least ${MIN_PASSWORD_LENGTH} characters`, newPassword, setNewPassword],
                    ["confirm", "Confirm New Password", "Repeat new password", confirmPassword, setConfirmPassword],
                  ] as const
                ).map(([key, label, ph, value, setValue]) => (
                  <div key={key}>
                    <label className="block text-label-md text-on-surface-variant mb-xs">{label}</label>
                    <div className="relative">
                      <input
                        type={passwordVisible[key] ? "text" : "password"}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={ph}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-sm pr-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      />
                      <span
                        onClick={() => setPasswordVisible((p) => ({ ...p, [key]: !p[key] }))}
                        className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-outline cursor-pointer hover:text-on-surface"
                      >
                        {passwordVisible[key] ? "visibility_off" : "visibility"}
                      </span>
                    </div>
                  </div>
                ))}
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="bg-primary text-on-primary px-md py-sm rounded-xl font-bold hover:brightness-110 transition-all shadow-sm disabled:opacity-60"
                >
                  {changingPassword ? "Updating…" : "Update Password"}
                </button>
              </div>
            </section>
          </div>
        )}

        {/* Tab: Data Cleanup */}
        {activeTab === "cleanup" && (
          <div className="space-y-lg">
            <section className="bg-surface border border-outline-variant rounded-2xl p-md shadow-sm">
              <h3 className="text-headline-md font-semibold mb-md flex items-center gap-sm">
                <span className="material-symbols-outlined text-error">delete_sweep</span> Delete Old Records
              </h3>
             

              <div className="flex flex-wrap gap-xs mb-md">
                {CLEANUP_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => applyCleanupPreset(p.days)}
                    className="px-sm py-xs rounded-full border border-outline-variant text-label-md font-semibold hover:bg-surface-container-high transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md max-w-lg mb-md">
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-xs">To</label>
                  <input
                    type="date"
                    value={cleanupTo}
                    onChange={(e) => { setCleanupTo(e.target.value); setCleanupPreview(null); }}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-xs">From</label>
                  {cleanupFromAllTime ? (
                    <div className="flex items-center gap-sm h-10.5">
                      <span className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl p-sm text-on-surface-variant">
                        All time (earliest record)
                      </span>
                      <button
                        type="button"
                        onClick={() => { setCleanupFromAllTime(false); setCleanupFrom(""); setCleanupPreview(null); }}
                        className="text-label-md font-semibold text-primary hover:underline whitespace-nowrap"
                      >
                        Set date
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-sm">
                      <input
                        type="date"
                        value={cleanupFrom}
                        onChange={(e) => { setCleanupFrom(e.target.value); setCleanupPreview(null); }}
                        className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => { setCleanupFromAllTime(true); setCleanupFrom(EARLIEST_RECORD_DATE); setCleanupPreview(null); }}
                        className="text-label-md font-semibold text-primary hover:underline whitespace-nowrap"
                      >
                        All time
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handlePreviewCleanup}
                disabled={previewLoading}
                className="bg-surface-container-high text-on-surface border border-outline-variant px-md py-sm rounded-xl font-bold hover:bg-surface-container-highest transition-all disabled:opacity-60"
              >
                {previewLoading ? "Loading…" : "Preview Records"}
              </button>

              {cleanupPreview && (
                <div className="mt-lg space-y-md">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
                    <div className="bg-surface-container-low rounded-xl p-md">
                      <p className="text-caption text-on-surface-variant">Appointments</p>
                      <p className="text-headline-md font-bold text-on-surface">{cleanupPreview.appointmentCount}</p>
                    </div>
                    <div className="bg-surface-container-low rounded-xl p-md">
                      <p className="text-caption text-on-surface-variant">Payments</p>
                      <p className="text-headline-md font-bold text-on-surface">{cleanupPreview.paymentCount}</p>
                    </div>
                    <div className="bg-surface-container-low rounded-xl p-md">
                      <p className="text-caption text-on-surface-variant">Total Fee Value</p>
                      <p className="text-headline-md font-bold text-on-surface">Rs. {cleanupPreview.totalAmountPkr.toLocaleString()}</p>
                    </div>
                  </div>

                  {cleanupPreview.appointmentCount > 0 && (
                    <div className="flex flex-wrap gap-sm">
                      <button
                        onClick={handleExportCleanupCsv}
                        className="flex items-center gap-xs bg-surface-container-high text-on-surface border border-outline-variant px-md py-sm rounded-xl font-bold hover:bg-surface-container-highest transition-all"
                      >
                        <span className="material-symbols-outlined text-[20px]">download</span>
                        Export CSV
                      </button>
                      <button
                        onClick={handleExportCleanupPdf}
                        className="flex items-center gap-xs bg-surface-container-high text-on-surface border border-outline-variant px-md py-sm rounded-xl font-bold hover:bg-surface-container-highest transition-all"
                      >
                        <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                        Export PDF
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-xs bg-error text-on-error px-md py-sm rounded-xl font-bold hover:brightness-110 transition-all"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete_forever</span>
                        Delete Records
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {/* Confirm Deletion Modal */}
      {showDeleteConfirm && cleanupPreview && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-surface rounded-2xl p-lg shadow-2xl max-w-md w-full mx-md">
            <h3 className="text-headline-md font-bold text-on-surface mb-sm">Delete these records permanently?</h3>
            <p className="text-body-md text-on-surface-variant mb-lg">
              This will permanently delete <strong>{cleanupPreview.appointmentCount} appointment(s)</strong> and{" "}
              <strong>{cleanupPreview.paymentCount} payment(s)</strong> dated between{" "}
              <strong>{cleanupFromAllTime ? "the earliest record" : cleanupFrom}</strong> and{" "}
              <strong>{cleanupTo}</strong>. This action cannot be undone — make sure you've exported a copy first.
            </p>
            <div className="flex gap-sm">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 px-md py-sm rounded-xl border border-outline-variant text-on-surface font-bold hover:bg-surface-container-high transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteCleanup}
                disabled={deleting}
                className="flex-1 px-md py-sm rounded-xl bg-error text-on-error font-bold hover:brightness-110 transition-colors disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
