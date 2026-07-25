"use client";

import { useState } from "react";
import { toast } from "react-toastify";

const MIN_PASSWORD_LENGTH = 8;

export default function ChangePasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Current password is required.");
      return;
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      toast.error(`New password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Could not update password.");
        return;
      }

      toast.success("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const passwordField = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    show: boolean,
    setShow: (v: boolean) => void,
    placeholder = "••••••••"
  ) => (
    <div>
      <label className="block text-label-md text-on-surface-variant mb-xs">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-sm px-md pr-12 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
        >
          <span className="material-symbols-outlined text-[20px]">{show ? "visibility_off" : "visibility"}</span>
        </button>
      </div>
    </div>
  );

  return (
    <section className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
      <div className="p-md border-b border-outline-variant/30 flex items-center gap-sm">
        <span className="material-symbols-outlined text-primary">lock</span>
        <h3 className="text-headline-md font-bold text-on-surface">Change Password</h3>
      </div>
      <form onSubmit={handleSubmit} className="p-md grid grid-cols-1 md:grid-cols-2 gap-md">
        <div className="md:col-span-2">
          {passwordField("Current Password", currentPassword, setCurrentPassword, showCurrent, setShowCurrent)}
        </div>
        {passwordField("New Password", newPassword, setNewPassword, showNew, setShowNew)}
        {passwordField("Confirm New Password", confirmPassword, setConfirmPassword, showConfirm, setShowConfirm)}

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-lg py-sm font-bold rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-xs bg-primary text-on-primary hover:brightness-110 disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[20px]">lock_reset</span>
            {saving ? "Updating…" : "Update Password"}
          </button>
        </div>
      </form>
    </section>
  );
}
