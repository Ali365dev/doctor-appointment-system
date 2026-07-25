import { Suspense } from "react";
import LoginHero from "@/components/auth/LoginHero";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen overflow-hidden">
      <LoginHero />
      <section className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-surface">
        <div className="w-full max-w-105 space-y-10">
          <div className="space-y-2">
            <h2 className="text-headline-2 font-bold text-text">Reset your password</h2>
            <p className="text-body-md text-text-secondary">We&apos;ll email you a code to reset your password.</p>
          </div>

          <Suspense>
            <ForgotPasswordForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
