"use client";

import { useState } from "react";

type ToggleProps = {
  checked: boolean;
  onChange: (v: boolean) => void;
};

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-outline-variant rounded-full peer-checked:bg-primary transition-all relative">
        <div
          className={`absolute top-[2px] left-[2px] bg-white border border-outline-variant/30 rounded-full h-5 w-5 transition-all duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
    </label>
  );
}

export default function SettingsContent() {
  const [twoFA, setTwoFA] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [inAppAlerts, setInAppAlerts] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [language, setLanguage] = useState("English (US)");
  const [timezone, setTimezone] = useState("(GMT-05:00) Eastern Time");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showManageAccess, setShowManageAccess] = useState(false);

  const [passwords, setPasswords] = useState({ current: "", newPw: "", confirm: "" });
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  function handlePasswordSave() {
    if (!passwords.current) { setPwError("Current password is required."); return; }
    if (passwords.newPw.length < 8) { setPwError("New password must be at least 8 characters."); return; }
    if (passwords.newPw !== passwords.confirm) { setPwError("Passwords do not match."); return; }
    setPwError("");
    setPwSaved(true);
    setTimeout(() => {
      setPwSaved(false);
      setShowPasswordForm(false);
      setPasswords({ current: "", newPw: "", confirm: "" });
    }, 2000);
  }

  return (
    <div className="max-w-[1000px] mx-auto space-y-md pb-xl">

      {/* Security Card */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div className="p-md border-b border-outline-variant/30 flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary">security</span>
          <h3 className="text-headline-md font-bold text-on-surface">Security</h3>
        </div>
        <div className="p-md space-y-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
            <div>
              <p className="font-bold text-on-surface text-body-md">Change Password</p>
              <p className="text-caption text-on-surface-variant">Update your account password regularly to stay secure.</p>
            </div>
            <button
              onClick={() => setShowPasswordForm((v) => !v)}
              className="px-md py-xs bg-surface border border-outline-variant rounded-lg text-primary font-bold text-label-md hover:bg-surface-container-low transition-colors active:scale-95"
            >
              {showPasswordForm ? "Cancel" : "Update Password"}
            </button>
          </div>

          {showPasswordForm && (
            <div className="border border-outline-variant/30 rounded-xl p-md bg-surface-container-low space-y-md">
              {["current", "newPw", "confirm"].map((key) => (
                <div key={key}>
                  <label className="block text-label-md text-on-surface-variant mb-xs capitalize">
                    {key === "current" ? "Current Password" : key === "newPw" ? "New Password" : "Confirm New Password"}
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={passwords[key as keyof typeof passwords]}
                      onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))}
                      placeholder={key === "current" ? "Enter current password" : key === "newPw" ? "At least 8 characters" : "Repeat new password"}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-sm px-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md"
                    />
                  </div>
                </div>
              ))}
              {pwError && <p className="text-caption text-error">{pwError}</p>}
              <button
                onClick={handlePasswordSave}
                className={`px-md py-sm font-bold rounded-lg transition-all flex items-center gap-xs ${
                  pwSaved ? "bg-emerald-500 text-white" : "bg-primary text-on-primary hover:brightness-110"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{pwSaved ? "check_circle" : "lock_reset"}</span>
                {pwSaved ? "Password Updated!" : "Save New Password"}
              </button>
            </div>
          )}

          <div className="h-px bg-outline-variant/30" />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-on-surface text-body-md">Two-Factor Authentication (2FA)</p>
              <p className="text-caption text-on-surface-variant">Add an extra layer of security to your account.</p>
            </div>
            <Toggle checked={twoFA} onChange={setTwoFA} />
          </div>
        </div>
      </section>

      {/* Notifications Card */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div className="p-md border-b border-outline-variant/30 flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary">notifications_active</span>
          <h3 className="text-headline-md font-bold text-on-surface">Notifications</h3>
        </div>
        <div className="p-md divide-y divide-outline-variant/30">
          {[
            {
              label: "Email Notifications",
              desc: "Receive appointment confirmations and medical updates via email.",
              checked: emailNotifs,
              onChange: setEmailNotifs,
            },
            {
              label: "SMS Notifications",
              desc: "Get critical alerts and appointment reminders on your phone.",
              checked: smsNotifs,
              onChange: setSmsNotifs,
            },
            {
              label: "In-app Alerts",
              desc: "Show real-time notifications while using the portal.",
              checked: inAppAlerts,
              onChange: setInAppAlerts,
            },
          ].map(({ label, desc, checked, onChange }) => (
            <div key={label} className="py-sm flex items-center justify-between gap-md">
              <div>
                <p className="font-bold text-on-surface text-body-md">{label}</p>
                <p className="text-caption text-on-surface-variant">{desc}</p>
              </div>
              <Toggle checked={checked} onChange={onChange} />
            </div>
          ))}
        </div>
      </section>

      {/* Privacy Card */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div className="p-md border-b border-outline-variant/30 flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary">lock</span>
          <h3 className="text-headline-md font-bold text-on-surface">Privacy</h3>
        </div>
        <div className="p-md space-y-md">
          <div className="flex items-center justify-between gap-md">
            <div>
              <p className="font-bold text-on-surface text-body-md">Medical Record Visibility</p>
              <p className="text-caption text-on-surface-variant">Choose which practitioners can view your health history.</p>
            </div>
            <button
              onClick={() => setShowManageAccess(true)}
              className="px-md py-xs bg-surface border border-outline-variant rounded-lg text-primary font-bold text-label-md hover:bg-surface-container-low transition-colors"
            >
              Manage Access
            </button>
          </div>
          <div className="h-px bg-outline-variant/30" />
          <div className="flex items-center justify-between gap-md">
            <div>
              <p className="font-bold text-on-surface text-body-md">Data Sharing for Research</p>
              <p className="text-caption text-on-surface-variant">Share anonymized data to help medical research progress.</p>
            </div>
            <Toggle checked={dataSharing} onChange={setDataSharing} />
          </div>
        </div>
      </section>

      {/* Preferences Card */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div className="p-md border-b border-outline-variant/30 flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary">tune</span>
          <h3 className="text-headline-md font-bold text-on-surface">Preferences</h3>
        </div>
        <div className="p-md grid grid-cols-1 md:grid-cols-2 gap-lg">
          <div>
            <label className="block text-label-md text-on-surface-variant mb-xs">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md outline-none"
            >
              {["English (US)", "English (UK)", "Spanish", "French", "German"].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-label-md text-on-surface-variant mb-xs">Time Zone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md outline-none"
            >
              {[
                "(GMT-05:00) Eastern Time",
                "(GMT-08:00) Pacific Time",
                "(GMT+00:00) London",
                "(GMT+01:00) Berlin",
              ].map((tz) => (
                <option key={tz}>{tz}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-error-container/30 border border-error/20 rounded-xl overflow-hidden">
        <div className="p-md border-b border-error/10 bg-error-container/20 flex items-center gap-sm">
          <span className="material-symbols-outlined text-error">warning</span>
          <h3 className="text-headline-md font-bold text-error">Danger Zone</h3>
        </div>
        <div className="p-md flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div>
            <p className="font-bold text-on-error-container text-body-md">Delete Account</p>
            <p className="text-caption text-on-error-container/80">
              Permanently remove all your medical data and account access. This action cannot be undone.
            </p>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-md py-xs bg-error text-on-error rounded-lg font-bold text-label-md hover:bg-error/90 transition-colors active:scale-95"
          >
            Delete Account
          </button>
        </div>
      </section>

      {/* Manage Access Modal */}
      {showManageAccess && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-md">
          <div className="bg-surface-container-lowest rounded-xl p-lg shadow-xl max-w-md w-full border border-outline-variant">
            <div className="flex items-center justify-between mb-md">
              <h3 className="text-headline-md font-bold text-on-surface">Medical Record Access</h3>
              <button onClick={() => setShowManageAccess(false)} className="text-on-surface-variant hover:text-on-surface p-xs rounded hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-sm text-body-md mb-lg">
              {[
                { name: "Dr. Alexander Specialist", role: "Primary Physician", access: true },
                { name: "Dr. Sarah Chen", role: "Dermatologist", access: true },
                { name: "Dr. Mark Williams", role: "Cardiologist", access: false },
              ].map((doc) => (
                <div key={doc.name} className="flex items-center justify-between border-b border-outline-variant/20 pb-sm">
                  <div>
                    <p className="font-bold text-on-surface text-label-md">{doc.name}</p>
                    <p className="text-caption text-on-surface-variant">{doc.role}</p>
                  </div>
                  <span className={`text-label-md font-bold px-sm py-xs rounded-full ${doc.access ? "bg-emerald-50 text-emerald-600" : "bg-surface-container-high text-on-surface-variant"}`}>
                    {doc.access ? "Has Access" : "No Access"}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowManageAccess(false)}
              className="w-full py-sm bg-primary text-on-primary rounded-lg font-bold hover:brightness-110 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-md">
          <div className="bg-surface-container-lowest rounded-xl p-lg shadow-xl max-w-sm w-full border border-error/30">
            <div className="flex items-center gap-sm mb-md">
              <span className="material-symbols-outlined text-error text-[32px]">warning</span>
              <h3 className="text-headline-md font-bold text-on-surface">Delete Account?</h3>
            </div>
            <p className="text-body-md text-on-surface-variant mb-lg">
              All your medical records, appointment history, and personal data will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-sm justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-md py-sm border border-outline-variant rounded-lg text-on-surface font-bold hover:bg-surface-container-low transition-colors"
              >
                Keep Account
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-md py-sm bg-error text-on-error rounded-lg font-bold hover:bg-error/90 transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
