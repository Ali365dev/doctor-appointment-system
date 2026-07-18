"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { toast } from "react-toastify";

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
  { id: "security", label: "Security", icon: "lock" },
];

const sessions = [
  { device: "MacBook Pro 16\"", os: "macOS 14.2", location: "Karachi, Pakistan", icon: "laptop_mac", current: true },
  { device: "iPhone 15 Pro", os: "iOS 17.2", location: "Karachi, Pakistan", icon: "smartphone", current: false },
];

export default function SettingsContent() {
  const [activeTab, setActiveTab] = useState("payment");
  const [notifications, setNotifications] = useState({
    confirmEmail: true, confirmSMS: true,
    reminderEmail: true, reminderSMS: false,
    surveyPush: true,
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

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

        {/* Tab: Security */}
        {activeTab === "security" && (
          <div className="space-y-lg">
            {/* Password Change */}
            <section className="bg-surface border border-outline-variant rounded-2xl p-md shadow-sm">
              <h3 className="text-headline-md font-semibold mb-md flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary">key</span> Change Password
              </h3>
              <div className="space-y-md max-w-md">
                {[["Current Password","Enter current password"],["New Password","At least 12 characters"],["Confirm New Password","Repeat new password"]].map(([label, ph]) => (
                  <div key={label}>
                    <label className="block text-label-md text-on-surface-variant mb-xs">{label}</label>
                    <div className="relative">
                      <input type="password" placeholder={ph} className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-sm pr-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                      <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-outline cursor-pointer hover:text-on-surface">visibility</span>
                    </div>
                  </div>
                ))}
                <button className="bg-primary text-on-primary px-md py-sm rounded-xl font-bold hover:brightness-110 transition-all shadow-sm">Update Password</button>
              </div>
            </section>

            {/* Active Sessions */}
            <section className="bg-surface border border-outline-variant rounded-2xl p-md shadow-sm">
              <h3 className="text-headline-md font-semibold mb-md flex items-center gap-sm">
                <span className="material-symbols-outlined text-secondary">devices</span> Active Sessions
              </h3>
              <div className="space-y-sm">
                {sessions.map((s) => (
                  <div key={s.device} className={`flex items-center gap-md p-md rounded-xl border transition-colors ${s.current ? "border-primary/30 bg-primary/5" : "border-outline-variant bg-surface-container-lowest"}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.current ? "bg-primary/10 text-primary" : "bg-surface-container-high text-on-surface-variant"}`}>
                      <span className="material-symbols-outlined text-[28px]">{s.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-xs">
                        <p className="font-semibold text-on-surface">{s.device}</p>
                        {s.current && <span className="text-[10px] font-bold px-xs py-[1px] bg-primary/10 text-primary rounded-full uppercase tracking-wide">Current</span>}
                      </div>
                      <p className="text-caption text-on-surface-variant">{s.os} · {s.location}</p>
                    </div>
                    {!s.current && (
                      <button className="text-sm text-error font-semibold border border-error/30 px-sm py-xs rounded-lg hover:bg-error/5 transition-colors">Log Out</button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
