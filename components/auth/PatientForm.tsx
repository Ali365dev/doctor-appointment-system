"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const AUTH_KEY_PREFIX = "patientAuthPassword:";

const normalizePhone = (phone: string) => phone.replace(/[\s()-]/g, "");

const generatePassword = () =>
  Math.random().toString(36).slice(-4).toUpperCase() + Math.random().toString(36).slice(-4);

type Mode = "otp-request" | "otp-verify" | "password" | "password-generated";

export default function PatientForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<Mode>("otp-request");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Detect returning users (phone already has a saved password) once the number looks complete.
  const handlePhoneChange = (value: string) => {
    setPhone(value);
    if (mode === "otp-verify" || mode === "password-generated") return;
    const digits = normalizePhone(value).replace(/^\+?92|^0/, "");
    if (digits.length >= 10) {
      const stored = localStorage.getItem(AUTH_KEY_PREFIX + normalizePhone(value));
      setMode(stored ? "password" : "otp-request");
    } else {
      setMode("otp-request");
    }
  };

  const handleSendOtp = () => {
    if (!phone.trim()) {
      toast.error("Please enter your phone number.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMode("otp-verify");
      toast.success("OTP sent via SMS.");
    }, 800);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length !== 6) {
      toast.error("Enter the 6-digit OTP sent to your phone.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const generated = generatePassword();
      localStorage.setItem(AUTH_KEY_PREFIX + normalizePhone(phone), generated);
      setGeneratedPassword(generated);
      setMode("password-generated");
      setLoading(false);
      toast.success("Phone verified! Your account is ready.");
    }, 800);
  };

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error("Please enter your password.");
      return;
    }
    const stored = localStorage.getItem(AUTH_KEY_PREFIX + normalizePhone(phone));
    if (password !== stored) {
      toast.error("Incorrect password. Try again or log in via OTP.");
      return;
    }
    toast.success("Login successful!");
    router.push("/patient/dashboard");
  };

  const handleForgotPassword = () => {
    setOtp("");
    setPassword("");
    setMode("otp-request");
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(generatedPassword).catch(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputCls =
    "w-full pl-12 pr-4 py-3 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-body-md";

  // ── Password generated (end of first-time setup) ──
  if (mode === "password-generated") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-secondary">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
          <p className="text-label-lg font-semibold">Phone verified successfully</p>
        </div>
        <div className="space-y-2">
          <label className="block text-label-lg font-semibold text-text-secondary px-1">
            Your Password
          </label>
          <p className="text-caption text-text-secondary px-1">
            Save this password — you&apos;ll use it to log in next time.
          </p>
          <div className="flex items-center gap-2 bg-surface-variant/40 border border-outline-variant rounded-lg px-4 py-3">
            <span className="flex-1 font-bold tracking-wider text-text">{generatedPassword}</span>
            <button type="button" onClick={handleCopyPassword} className="text-outline hover:text-primary transition-colors">
              <span className="material-symbols-outlined">{copied ? "check" : "content_copy"}</span>
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            toast.success("Welcome!");
            router.push("/patient/dashboard");
          }}
          className="w-full py-3 bg-primary hover:bg-primary-container text-on-primary text-label-lg font-semibold rounded-xl transition-all active:scale-[0.98] shadow-md shadow-primary/20"
        >
          Continue to Dashboard
        </button>
      </div>
    );
  }

  // ── Password login (returning user) ──
  if (mode === "password") {
    return (
      <form className="space-y-4" onSubmit={handlePasswordLogin}>
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
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="+1 (555) 000-0000"
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
              placeholder="••••••••••••••••••"
              className="w-full pl-12 pr-12 py-3 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-body-md"
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
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-label-lg font-semibold text-primary hover:underline transition-all"
            >
              Forgot? Login via OTP instead
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-primary hover:bg-primary-container text-on-primary text-label-lg font-semibold rounded-xl transition-all active:scale-[0.98] shadow-md shadow-primary/20"
        >
          Verify and Login
        </button>
      </form>
    );
  }

  // ── OTP request / verify (first-time setup) ──
  return (
    <form
      className="space-y-4"
      onSubmit={mode === "otp-verify" ? handleVerifyOtp : (e) => e.preventDefault()}
    >
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
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="+1 (555) 000-0000"
            className={inputCls}
          />
        </div>
      </div>

      {mode === "otp-verify" && (
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
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-body-md tracking-[0.5em]"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSendOtp}
              className="text-label-lg font-semibold text-primary hover:underline transition-all"
            >
              Resend Code
            </button>
          </div>
        </div>
      )}

      {mode === "otp-verify" ? (
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary hover:bg-primary-container text-on-primary text-label-lg font-semibold rounded-xl transition-all active:scale-[0.98] shadow-md shadow-primary/20 disabled:opacity-60"
        >
          {loading ? "Verifying…" : "Verify"}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleSendOtp}
          disabled={loading}
          className="w-full py-3 bg-primary hover:bg-primary-container text-on-primary text-label-lg font-semibold rounded-xl transition-all active:scale-[0.98] shadow-md shadow-primary/20 disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send OTP"}
        </button>
      )}
    </form>
  );
}
