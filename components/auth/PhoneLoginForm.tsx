"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import type { ConfirmationResult } from "firebase/auth";
import { sendPhoneOtp, resetRecaptcha } from "@/services/firebase/phone-auth";

const RECAPTCHA_CONTAINER_ID = "recaptcha-container";

type Step = "phone" | "otp" | "registered";

interface PhoneLoginFormProps {
  /** Called after a brand-new account is created, so the parent can switch to password-login mode. */
  onRegistered?: (phone: string) => void;
  /** Where to send the user after a successful login (e.g. back to /book-appointment/step-1). */
  redirectTo?: string;
}

export default function PhoneLoginForm({ onRegistered, redirectTo }: PhoneLoginFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [registeredMessage, setRegisteredMessage] = useState("");

  const handleSendOtp = async () => {
    if (!phone.trim().startsWith("+")) {
      toast.error("Enter your phone number in international format, e.g. +923001234567");
      return;
    }
    setLoading(true);
    try {
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

  const handleResendOtp = async () => {
    // The reCAPTCHA container isn't mounted while on the OTP step, and an
    // invisible-widget token is single-use — always tear down and rebuild
    // against a freshly mounted container rather than reusing the old one.
    resetRecaptcha();
    await handleSendOtp();
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
      const idToken = await credential.user.getIdToken();

      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, name: fullName }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Login failed. Please try again.");
        return;
      }

      if (data.registered) {
        // Brand-new patient: a temporary password was generated and sent —
        // no session yet, hand off to password login instead of a dashboard.
        setRegisteredMessage(data.message);
        setStep("registered");
        return;
      }

      toast.success(`Welcome back, ${data.user.name}!`);
      router.push(redirectTo ?? (data.user.role === "doctor" ? "/admin/dashboard" : "/patient/dashboard"));
      router.refresh();
    } catch {
      toast.error("Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeNumber = () => {
    resetRecaptcha();
    setStep("phone");
    setOtp("");
    setConfirmation(null);
  };

  const inputCls =
    "w-full pl-12 pr-4 py-3 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-body-md";

  if (step === "registered") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-secondary">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
          <p className="text-label-lg font-semibold">Registration successful</p>
        </div>
        <p className="text-body-md text-text-secondary">{registeredMessage}</p>
        <button
          type="button"
          onClick={() => onRegistered?.(phone)}
          className="w-full py-3 bg-primary hover:bg-primary-container text-on-primary text-label-lg font-semibold rounded-xl transition-all active:scale-[0.98] shadow-md shadow-primary/20"
        >
          Continue to Login
        </button>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <form className="space-y-4" onSubmit={handleVerifyOtp}>
        <p className="text-body-md text-text-secondary">
          Enter the 6-digit code sent to <span className="font-semibold text-text">{phone}</span>
        </p>

        <div className="space-y-2">
          <label className="block text-label-lg font-semibold text-text-secondary px-1">
            Verification Code
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
              lock
            </span>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className={`${inputCls} tracking-[0.5em]`}
            />
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleChangeNumber}
              className="text-label-lg font-semibold text-text-secondary hover:underline transition-all"
            >
              Change number
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading}
              className="text-label-lg font-semibold text-primary hover:underline transition-all disabled:opacity-60"
            >
              Resend Code
            </button>
          </div>
        </div>

        <div id={RECAPTCHA_CONTAINER_ID} />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary hover:bg-primary-container text-on-primary text-label-lg font-semibold rounded-xl transition-all active:scale-[0.98] shadow-md shadow-primary/20 disabled:opacity-60"
        >
          {loading ? "Verifying…" : "Verify and Login"}
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-label-lg font-semibold text-text-secondary px-1">
          Full Name <span className="text-caption text-outline">(first time only)</span>
        </label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
            person
          </span>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ahmed Khan"
            className={inputCls}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-label-lg font-semibold text-text-secondary px-1">
          Phone Number
        </label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
            call
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+923001234567"
            className={inputCls}
          />
        </div>
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
    </div>
  );
}
