"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import EmailLoginForm from "./EmailLoginForm";
import GoogleLoginButton from "./GoogleLoginButton";
import { useDoctorProfile } from "@/lib/context/DoctorProfileContext";

export default function LoginForm() {
  const doctor = useDoctorProfile();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;

  return (
    <section className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-surface">
      <div className="w-full max-w-105 space-y-10">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-10">
          <span className="material-symbols-outlined text-primary text-3xl">
            medical_services
          </span>
          <span className="text-title-lg font-bold text-primary">
            {doctor.name}
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="text-headline-2 font-bold text-text">
            Welcome back
          </h2>
          <p className="text-body-md text-text-secondary">
            Securely access your medical portal.
          </p>
        </div>

        <GoogleLoginButton redirectTo={redirectTo} />

        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-outline-variant/30" />
          <span className="text-label-md text-outline">or</span>
          <div className="h-px flex-1 bg-outline-variant/30" />
        </div>

        <EmailLoginForm redirectTo={redirectTo} />

        {/* Footer */}
        <div className="pt-10 border-t border-outline-variant/30 text-center space-y-4">
          <div className="flex justify-center gap-4 text-label-md text-outline">
            <Link href="#" className="hover:text-text transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="#" className="hover:text-text transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="#" className="hover:text-text transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
