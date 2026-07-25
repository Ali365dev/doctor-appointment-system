"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const inputCls =
    "w-full pl-12 pr-4 py-3 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-body-md";

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length !== 6) {
      toast.error("Enter the 6-digit code sent to your email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: code.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Verification failed. Please try again.");
        return;
      }

      toast.success("Email verified! You can now log in.");
      router.push("/login?verified=1");
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
        body: JSON.stringify({ email, purpose: "verify_email" }),
      });
      if (res.ok) {
        toast.success("A new code has been sent to your email.");
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

  return (
    <form className="space-y-4" onSubmit={handleVerify}>
      <div className="space-y-2">
        <label className="block text-label-lg font-semibold text-text-secondary px-1">Email</label>
        <input type="email" value={email} readOnly className={inputCls.replace("pl-12", "pl-4") + " opacity-70"} />
      </div>

      <div className="space-y-2">
        <label className="block text-label-lg font-semibold text-text-secondary px-1">Verification Code</label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
            lock
          </span>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 6-digit code"
            maxLength={6}
            className={`${inputCls} tracking-[0.5em]`}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-primary hover:bg-primary-container text-on-primary text-label-lg font-semibold rounded-xl transition-all active:scale-[0.98] shadow-md shadow-primary/20 disabled:opacity-60"
      >
        {loading ? "Verifying…" : "Verify"}
      </button>

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={resending || cooldown > 0}
          className="text-label-lg font-semibold text-primary hover:underline transition-all disabled:opacity-60 disabled:no-underline"
        >
          {cooldown > 0 ? `Resend OTP (${cooldown}s)` : resending ? "Sending…" : "Resend OTP"}
        </button>
        <Link href="/register" className="text-label-lg font-semibold text-text-secondary hover:underline transition-all">
          Change Email
        </Link>
      </div>
    </form>
  );
}
