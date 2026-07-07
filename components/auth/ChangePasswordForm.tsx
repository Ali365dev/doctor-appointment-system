"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

const MIN_PASSWORD_LENGTH = 8;

export default function ChangePasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFirstLogin = searchParams.get("firstLogin") === "1";
  const redirectTo = searchParams.get("redirectTo") ?? undefined;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const inputCls =
    "w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-body-md";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      toast.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: isFirstLogin ? undefined : currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401 && data.error === "Not authenticated") {
          toast.error("Your session has expired. Please log in again.");
          router.push("/login");
          return;
        }
        toast.error(data.error ?? "Could not update password.");
        return;
      }

      toast.success("Password updated successfully!");
      router.push(redirectTo ?? "/patient/dashboard");
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {!isFirstLogin && (
        <div className="space-y-2">
          <label className="block text-label-lg font-semibold text-text-secondary px-1">
            Current Password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            className={inputCls}
          />
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-label-lg font-semibold text-text-secondary px-1">
          New Password
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="••••••••"
          className={inputCls}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-label-lg font-semibold text-text-secondary px-1">
          Confirm New Password
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          className={inputCls}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-primary hover:bg-primary-container text-on-primary text-label-lg font-semibold rounded-xl transition-all active:scale-[0.98] shadow-md shadow-primary/20 disabled:opacity-60"
      >
        {loading ? "Saving…" : "Update Password"}
      </button>
    </form>
  );
}
