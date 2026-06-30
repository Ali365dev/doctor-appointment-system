"use client";

import { useState } from "react";
import Link from "next/link";
import RoleToggle from "./RoleToggle";
import PatientForm from "./PatientForm";
import DoctorForm from "./DoctorForm";

type Role = "patient" | "doctor";

export default function LoginForm() {
  const [activeRole, setActiveRole] = useState<Role>("patient");

  return (
    <section className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-surface">
      <div className="w-full max-w-105 space-y-10">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-10">
          <span className="material-symbols-outlined text-primary text-3xl">
            medical_services
          </span>
          <span className="text-title-lg font-bold text-primary">
            Dr. Specialist
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

        <RoleToggle activeRole={activeRole} onRoleChange={setActiveRole} />

        {/* Form panes */}
        <div className="relative overflow-hidden min-h-80">
          <div className={`login-transition w-full ${activeRole === "patient" ? "active-pane" : "hidden-pane"}`}>
            <PatientForm />
          </div>
          <div className={`login-transition w-full ${activeRole === "doctor" ? "active-pane" : "hidden-pane"}`}>
            <DoctorForm />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-10 border-t border-outline-variant/30 text-center space-y-4">
          <p className="text-body-md text-text-secondary">
            Don&apos;t have an account?{" "}
            <Link href="#" className="text-primary font-bold hover:underline">
              Register Now
            </Link>
          </p>
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
