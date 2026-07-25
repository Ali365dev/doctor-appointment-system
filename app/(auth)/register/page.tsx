import { Suspense } from "react";
import LoginHero from "@/components/auth/LoginHero";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen overflow-hidden">
      <LoginHero />
      <section className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-surface">
        <div className="w-full max-w-105 space-y-10">
          <div className="space-y-2">
            <h2 className="text-headline-2 font-bold text-text">Create your account</h2>
            <p className="text-body-md text-text-secondary">Sign up to book and manage your appointments.</p>
          </div>

          <Suspense>
            <RegisterForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
