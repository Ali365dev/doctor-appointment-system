"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface EmailLoginFormProps {
  redirectTo?: string;
}

export default function EmailLoginForm({ redirectTo }: EmailLoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Enter your email and password.");
      return;
    }

    setLoading(true);
    setNeedsVerification(false);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error === "EMAIL_NOT_VERIFIED") {
          setNeedsVerification(true);
          toast.error(data.message ?? "Please verify your email before signing in.");
          return;
        }
        toast.error(data.error ?? "Login failed. Please try again.");
        return;
      }

      toast.success(`Welcome back, ${data.user.name}!`);
      router.push(redirectTo ?? (data.user.role === "doctor" ? "/admin/dashboard" : "/patient/dashboard"));
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), purpose: "verify_email" }),
      });
      if (res.ok) {
        router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Could not resend verification code.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const inputCls =
    "w-full pl-12 pr-4 py-3 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-body-md";

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="block text-label-lg font-semibold text-text-secondary px-1">Email Address</label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
            mail
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputCls}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-label-lg font-semibold text-text-secondary px-1">Password</label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
            lock
          </span>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={`${inputCls} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-text"
          >
            <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
          </button>
        </div>
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-label-lg font-semibold text-primary hover:underline transition-all">
            Forgot password?
          </Link>
        </div>
      </div>

      {needsVerification && (
        <button
          type="button"
          onClick={handleResendVerification}
          disabled={resending}
          className="w-full text-label-lg font-semibold text-primary hover:underline transition-all disabled:opacity-60"
        >
          {resending ? "Sending…" : "Resend Verification OTP"}
        </button>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-primary hover:bg-primary-container text-on-primary text-label-lg font-semibold rounded-xl transition-all active:scale-[0.98] shadow-md shadow-primary/20 disabled:opacity-60"
      >
        {loading ? "Logging in…" : "Login"}
      </button>

      <p className="text-center text-label-md text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary font-bold hover:underline">
          Sign Up
        </Link>
      </p>
    </form>
  );
}
