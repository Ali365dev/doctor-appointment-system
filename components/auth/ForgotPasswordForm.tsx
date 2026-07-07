"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import type { ConfirmationResult } from "firebase/auth";
import { sendPhoneOtp, resetRecaptcha } from "@/services/firebase/phone-auth";

const RECAPTCHA_CONTAINER_ID = "recaptcha-container";
const MIN_PASSWORD_LENGTH = 8;

type Step = "phone" | "otp" | "newPassword";

interface ForgotPasswordFormProps {
  initialPhone?: string;
  redirectTo?: string;
  onBack: () => void;
}

export default function ForgotPasswordForm({ initialPhone, redirectTo, onBack }: ForgotPasswordFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [idToken, setIdToken] = useState("");
  const [loading, setLoading] = useState(false);

  const inputCls =
    "w-full pl-12 pr-4 py-3 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-body-md";

  const handleSendOtp = async () => {
    if (!phone.trim().startsWith("+")) {
      toast.error("Enter your phone number in international format, e.g. +923001234567");
      return;
    }
    setLoading(true);
    try {
      const checkRes = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const checkData = await checkRes.json();

      if (!checkData.exists) {
        toast.error("No account found for this phone number.");
        return;
      }

      resetRecaptcha();
      const result = await sendPhoneOtp(phone.trim(), RECAPTCHA_CONTAINER_ID);
      setConfirmation(result);
      setStep("otp");
      toast.success("OTP sent via SMS.");
    } catch {
      resetRecaptcha();
      toast.error("Could not send OTP. Check the number and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmation) return;
    if (otp.trim().length !== 6) {
      toast.error("Enter the 6-digit OTP sent to your phone.");
      return;
    }

    setLoading(true);
    try {
      const credential = await confirmation.confirm(otp.trim());
      const token = await credential.user.getIdToken();
      setIdToken(token);
      setStep("newPassword");
    } catch {
      toast.error("Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
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
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Could not reset password.");
        return;
      }

      toast.success("Password updated. You're logged in!");
      router.push(redirectTo ?? (data.user.role === "doctor" ? "/admin/dashboard" : "/patient/dashboard"));
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "newPassword") {
    return (
      <form className="space-y-4" onSubmit={handleResetPassword}>
        <p className="text-body-md text-text-secondary">Set a new password for your account.</p>
        <div className="space-y-2">
          <label className="block text-label-lg font-semibold text-text-secondary px-1">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            className={inputCls}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-label-lg font-semibold text-text-secondary px-1">Confirm Password</label>
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
          {loading ? "Saving…" : "Reset Password"}
        </button>
      </form>
    );
  }

  if (step === "otp") {
    return (
      <form className="space-y-4" onSubmit={handleVerifyOtp}>
        <p className="text-body-md text-text-secondary">
          Enter the 6-digit code sent to <span className="font-semibold text-text">{phone}</span>
        </p>
        <div className="space-y-2">
          <label className="block text-label-lg font-semibold text-text-secondary px-1">Verification Code</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            className={`${inputCls} tracking-[0.5em]`}
          />
        </div>
        <div id={RECAPTCHA_CONTAINER_ID} />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary hover:bg-primary-container text-on-primary text-label-lg font-semibold rounded-xl transition-all active:scale-[0.98] shadow-md shadow-primary/20 disabled:opacity-60"
        >
          {loading ? "Verifying…" : "Verify Code"}
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-body-md text-text-secondary">
        Enter your phone number and we&apos;ll send you a verification code to reset your password.
      </p>
      <div className="space-y-2">
        <label className="block text-label-lg font-semibold text-text-secondary px-1">Phone Number</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+923001234567"
          className={inputCls}
        />
      </div>
      <div id={RECAPTCHA_CONTAINER_ID} />
      <button
        type="button"
        onClick={handleSendOtp}
        disabled={loading}
        className="w-full py-3 bg-primary hover:bg-primary-container text-on-primary text-label-lg font-semibold rounded-xl transition-all active:scale-[0.98] shadow-md shadow-primary/20 disabled:opacity-60"
      >
        {loading ? "Sending…" : "Send OTP"}
      </button>
      <button
        type="button"
        onClick={onBack}
        className="w-full text-label-lg font-semibold text-text-secondary hover:underline transition-all"
      >
        Back to login
      </button>
    </div>
  );
}
