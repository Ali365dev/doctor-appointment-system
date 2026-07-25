"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const RESEND_COOLDOWN_SECONDS = 60;
const MIN_PASSWORD_LENGTH = 8;

type Step = "email" | "reset";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const inputCls =
    "w-full pl-12 pr-4 py-3 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-body-md";

  const handleSendCode = async () => {
    if (!email.trim()) {
      toast.error("Enter your email address.");
      return;
    }
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      // Always proceed — the endpoint never reveals whether the email exists.
      toast.success("If an account exists for that email, a code has been sent.");
      setStep("reset");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), purpose: "password_reset" }),
      });
      if (res.ok) {
        toast.success("A new code has been sent.");
        setCooldown(RESEND_COOLDOWN_SECONDS);
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Could not resend code.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length !== 6) {
      toast.error("Enter the 6-digit code sent to your email.");
      return;
    }
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
        body: JSON.stringify({ email: email.trim(), code: code.trim(), newPassword, confirmPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Could not reset password.");
        return;
      }

      toast.success("Password updated. You're logged in!");
      router.push(data.user.role === "doctor" ? "/admin/dashboard" : "/patient/dashboard");
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "reset") {
    return (
      <form className="space-y-4" onSubmit={handleResetPassword}>
        <p className="text-body-md text-text-secondary">
          Enter the code sent to <span className="font-semibold text-text">{email}</span> and choose a new password.
        </p>

        <div className="space-y-2">
          <label className="block text-label-lg font-semibold text-text-secondary px-1">Verification Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 6-digit code"
            maxLength={6}
            className={`${inputCls.replace("pl-12", "pl-4")} tracking-[0.5em]`}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-label-lg font-semibold text-text-secondary px-1">New Password</label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className={`${inputCls.replace("pl-12", "pl-4")} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-text"
            >
              <span className="material-symbols-outlined">{showNewPassword ? "visibility_off" : "visibility"}</span>
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-label-lg font-semibold text-text-secondary px-1">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={`${inputCls.replace("pl-12", "pl-4")} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-text"
            >
              <span className="material-symbols-outlined">{showConfirmPassword ? "visibility_off" : "visibility"}</span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary hover:bg-primary-container text-on-primary text-label-lg font-semibold rounded-xl transition-all active:scale-[0.98] shadow-md shadow-primary/20 disabled:opacity-60"
        >
          {loading ? "Saving…" : "Reset Password"}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={resending || cooldown > 0}
          className="w-full text-label-lg font-semibold text-primary hover:underline transition-all disabled:opacity-60 disabled:no-underline"
        >
          {cooldown > 0 ? `Resend Code (${cooldown}s)` : resending ? "Sending…" : "Resend Code"}
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-body-md text-text-secondary">
        Enter your email address and we&apos;ll send you a verification code to reset your password.
      </p>
      <div className="space-y-2">
        <label className="block text-label-lg font-semibold text-text-secondary px-1">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={inputCls.replace("pl-12", "pl-4")}
        />
      </div>
      <button
        type="button"
        onClick={handleSendCode}
        disabled={loading}
        className="w-full py-3 bg-primary hover:bg-primary-container text-on-primary text-label-lg font-semibold rounded-xl transition-all active:scale-[0.98] shadow-md shadow-primary/20 disabled:opacity-60"
      >
        {loading ? "Sending…" : "Send Code"}
      </button>
    </div>
  );
}
