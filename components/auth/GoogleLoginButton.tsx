"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { signInWithGoogle } from "@/services/firebase/google-auth";

export default function GoogleLoginButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const idToken = await signInWithGoogle();

      const res = await fetch("/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Google login failed. Please try again.");
        return;
      }

      toast.success(`Welcome${data.isNew ? "" : " back"}, ${data.user.name}!`);
      router.push("/patient/dashboard");
      router.refresh();
    } catch (err) {
      const code = typeof err === "object" && err !== null && "code" in err ? String(err.code) : undefined;
      console.error("[GoogleLoginButton] sign-in failed:", code, err);

      const messages: Record<string, string> = {
        "auth/operation-not-allowed": "Google sign-in isn't enabled for this project yet (Firebase Console → Authentication → Sign-in method → Google).",
        "auth/unauthorized-domain": "This domain isn't authorized for sign-in (Firebase Console → Authentication → Settings → Authorized domains).",
        "auth/popup-blocked": "Your browser blocked the sign-in popup. Allow popups for this site and try again.",
        "auth/popup-closed-by-user": "Sign-in was cancelled.",
        "auth/cancelled-popup-request": "Sign-in was cancelled.",
      };

      toast.error((code && messages[code]) ?? `Google login failed${code ? ` (${code})` : ""}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="w-full py-3 border border-outline-variant hover:bg-surface-variant/40 text-text text-label-lg font-semibold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-60"
    >
      <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
      </svg>
      {loading ? "Signing in…" : "Continue with Google"}
    </button>
  );
}
