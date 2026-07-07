"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface PasswordLoginFormProps {
  initialPhone?: string;
  redirectTo?: string;
  onForgotPassword: (phone: string) => void;
  onUseOtpInstead: () => void;
}

export default function PasswordLoginForm({ initialPhone, redirectTo, onForgotPassword, onUseOtpInstead }: PasswordLoginFormProps) {
  const router = useRouter();
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !password) {
      toast.error("Enter your phone number and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Login failed. Please try again.");
        return;
      }

      if (data.mustChangePassword) {
        toast.info("Please set a new password to continue.");
        const params = new URLSearchParams({ firstLogin: "1" });
        if (redirectTo) params.set("redirectTo", redirectTo);
        router.push(`/change-password?${params.toString()}`);
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

  const inputCls =
    "w-full pl-12 pr-4 py-3 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-body-md";

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
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

      <div className="space-y-2">
        <label className="block text-label-lg font-semibold text-text-secondary px-1">
          Password
        </label>
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
            <span className="material-symbols-outlined">
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onUseOtpInstead}
            className="text-label-lg font-semibold text-text-secondary hover:underline transition-all"
          >
            Use OTP instead
          </button>
          <button
            type="button"
            onClick={() => onForgotPassword(phone)}
            className="text-label-lg font-semibold text-primary hover:underline transition-all"
          >
            Forgot password?
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-primary hover:bg-primary-container text-on-primary text-label-lg font-semibold rounded-xl transition-all active:scale-[0.98] shadow-md shadow-primary/20 disabled:opacity-60"
      >
        {loading ? "Logging in…" : "Login"}
      </button>
    </form>
  );
}
