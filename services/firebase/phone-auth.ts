"use client";

import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";
import { auth } from "./auth";

let recaptchaVerifier: RecaptchaVerifier | null = null;

function getRecaptchaVerifier(containerId: string): RecaptchaVerifier {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
      "expired-callback": () => {
        // The widget times out after a few minutes of inactivity — drop it so
        // the next Send OTP click builds a fresh one instead of failing silently.
        resetRecaptcha();
      },
    });
  }
  return recaptchaVerifier;
}

export async function sendPhoneOtp(phoneNumber: string, containerId: string): Promise<ConfirmationResult> {
  auth.languageCode = typeof navigator !== "undefined" ? navigator.language : "en";

  const verifier = getRecaptchaVerifier(containerId);

  // Render explicitly first so a reCAPTCHA setup failure (e.g. unauthorized
  // domain) is distinguishable from an actual OTP-send failure.
  await verifier.render();

  return signInWithPhoneNumber(auth, phoneNumber, verifier);
}

export function resetRecaptcha(): void {
  recaptchaVerifier?.clear();
  recaptchaVerifier = null;
}
