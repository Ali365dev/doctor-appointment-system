"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function BookingStep4Content() {
  const [confirmed, setConfirmed] = useState(false);
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left column */}
      <div className="lg:col-span-8 space-y-6">
        <header className="mb-8">
          <h1 className="text-headline-lg font-bold text-on-surface">Review Your Appointment</h1>
          <p className="text-body-md text-on-surface-variant mt-2">
            Please double-check the details below before proceeding to secure payment.
          </p>
        </header>

        {/* Appointment Details Card */}
        <section className="bg-white rounded-xl border border-outline-variant/30 p-8 transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">
              calendar_today
            </span>
            <h2 className="text-headline-md font-semibold">Appointment Details</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start gap-4">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDoVXlCiSn2ouB_4dgLdwMjDv6OQX3SbGnGXM_bN5t_InmWUojWtyQuDeQWxbZoJ3vcUfB0QWZVOwGLWf1_9CpELpiDIopDSBE2dkVU8MMp7WFMI27FfYrjewMxGgHKPrnkdkw2cIqhY3xE9nUGYFx3n3jsnkBB_WIVJ5Cg-mz0Nc9KJexfwUUw2_FNPuv6WPte5Ip7M5FXR96puDzBbKB7WH_LT_Lqs6R_B2wqUfCbRTbL9Au3DeTDq34gx7iFHd9HA2XR2A8K_uw"
                alt="Dr. Julian Sterling"
                width={64}
                height={64}
                className="w-16 h-16 rounded-full object-cover border-2 border-surface-container shrink-0"
                unoptimized
              />
              <div>
                <p className="text-caption text-outline uppercase tracking-wider">Medical Specialist</p>
                <p className="text-body-lg font-bold text-on-surface">Dr. Julian Sterling</p>
                <p className="text-body-md text-on-surface-variant">Consultant Cardiologist</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-caption text-outline uppercase tracking-wider">Date &amp; Time</p>
                <p className="text-body-md font-semibold text-on-surface">Jun 30, 2026</p>
                <p className="text-body-md text-on-surface-variant">10:30 AM PKT</p>
              </div>
              <div>
                <p className="text-caption text-outline uppercase tracking-wider">Visit Type</p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/10 text-secondary mt-1">
                  <span className="material-symbols-outlined text-sm">local_hospital</span>
                  <span className="text-caption font-bold">In-Clinic</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Patient Info Card */}
        <section className="bg-white rounded-xl border border-outline-variant/30 p-8 transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">person</span>
              <h2 className="text-headline-md font-semibold">Patient Information</h2>
            </div>
            <button
              onClick={() => router.push("/book-appointment/step-3")}
              className="text-primary text-[14px] font-semibold hover:underline"
            >
              Edit Details
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Full Name", value: "Jonathan Doe" },
              { label: "Phone", value: "+92 300 0000000" },
              { label: "Age", value: "34 years" },
              { label: "Gender", value: "Male" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-caption text-outline uppercase tracking-wider">{label}</p>
                <p className="text-body-md font-semibold text-on-surface">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Confirmation checkbox */}
        <div className="flex items-start gap-3 p-4 bg-surface-container-low rounded-lg border border-outline-variant/20">
          <input
            type="checkbox"
            id="confirm-check"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-1 w-5 h-5 text-primary border-outline-variant rounded focus:ring-primary/20 cursor-pointer"
          />
          <label htmlFor="confirm-check" className="text-body-md text-on-surface-variant cursor-pointer">
            I confirm that all information provided is correct and I have read the{" "}
            <a href="#" className="text-primary hover:underline">Clinical Guidelines</a>{" "}
            for this specialist consultation.
          </label>
        </div>
      </div>

      {/* Right: Sticky Summary & CTA */}
      <aside className="lg:col-span-4 sticky top-28">
        <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
          <div className="bg-primary px-6 py-4">
            <h3 className="text-on-primary text-[14px] font-semibold uppercase tracking-widest">
              Payment Breakdown
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center text-body-md">
              <span className="text-on-surface-variant">Specialist Consultation Fee</span>
              <span className="font-semibold text-on-surface">Rs. 2,000</span>
            </div>
            <div className="flex justify-between items-center text-body-md">
              <span className="text-on-surface-variant">Booking Service Fee</span>
              <span className="font-semibold text-on-surface">Rs. 0</span>
            </div>
            <div className="pt-4 border-t border-outline-variant/20 flex justify-between items-center">
              <span className="font-bold text-body-lg">Total Amount</span>
              <span className="font-bold text-headline-md text-primary">Rs. 2,000</span>
            </div>
            <div className="pt-6">
              <button
                onClick={() => router.push("/book-appointment/step-5")}
                disabled={!confirmed}
                className={`w-full bg-primary text-white py-4 rounded-xl font-bold text-body-lg transition-all active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2 ${
                  !confirmed ? "opacity-50 pointer-events-none" : "hover:opacity-90"
                }`}
              >
                Proceed to Payment
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <p className="text-caption text-outline text-center mt-4">
                Secure encrypted transaction
              </p>
            </div>
          </div>
          <div className="bg-surface-container-low p-4 m-2 rounded-lg border border-outline-variant/10">
            <div className="flex gap-2">
              <span className="material-symbols-outlined text-secondary text-sm">info</span>
              <p className="text-caption text-on-surface-variant">
                Cancellation Policy: Full refund if cancelled 24h prior to appointment.
              </p>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="mt-6 p-6 rounded-xl border border-dashed border-outline-variant text-center">
          <p className="text-caption text-outline">Need assistance with your booking?</p>
          <a href="#" className="inline-block mt-2 text-[14px] font-semibold text-primary hover:underline">
            Contact Patient Concierge
          </a>
        </div>
      </aside>
    </div>
  );
}
