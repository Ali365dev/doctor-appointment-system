import { Suspense } from "react";
import LoginHero from "@/components/auth/LoginHero";
import VerifyEmailForm from "@/components/auth/VerifyEmailForm";

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen overflow-hidden">
      <LoginHero />
      <section className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-surface">
        <div className="w-full max-w-105 space-y-10">
          <div className="space-y-2">
            <h2 className="text-headline-2 font-bold text-text">Verify your email</h2>
            <p className="text-body-md text-text-secondary">
              Enter the 6-digit code we sent to your email address. It expires in 10 minutes.
            </p>
          </div>

          <Suspense>
            <VerifyEmailForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
