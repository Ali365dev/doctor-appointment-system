import { Suspense } from "react";
import LoginHero from "@/components/auth/LoginHero";
import ChangePasswordForm from "@/components/auth/ChangePasswordForm";

export default function ChangePasswordPage() {
  return (
    <main className="flex min-h-screen overflow-hidden">
      <LoginHero />
      <section className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-surface">
        <div className="w-full max-w-105 space-y-10">
          <div className="space-y-2">
            <h2 className="text-headline-2 font-bold text-text">Set a new password</h2>
            <p className="text-body-md text-text-secondary">
              Choose a password you&apos;ll use to log in from now on.
            </p>
          </div>

          <Suspense>
            <ChangePasswordForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
