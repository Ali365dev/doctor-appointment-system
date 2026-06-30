"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const cities = ["Select City", "Lahore", "Karachi", "Islamabad", "Faisalabad", "Rawalpindi"];

export default function BookingStep3Content() {
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [isExisting, setIsExisting] = useState(false);
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      {/* Left: Form */}
      <div className="lg:col-span-8">
        <section className="bg-surface-container-lowest rounded-2xl p-6 md:p-10 shadow-sm border border-outline-variant/30">
          <header className="mb-10">
            <h1 className="text-headline-lg font-bold text-on-surface mb-2">Patient Information</h1>
            <p className="text-body-md text-on-surface-variant">
              Please provide the details of the person attending the appointment.
            </p>
          </header>

          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); router.push("/book-appointment/step-4"); }}>
            {/* Name + Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[14px] font-semibold text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Johnathan Doe"
                  required
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-low text-body-md focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[14px] font-semibold text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">phone</span>
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+92 300 0000000"
                  required
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-low text-body-md focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>

            {/* Gender + Age + CNIC */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[14px] font-semibold text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">wc</span>
                  Gender
                </label>
                <div className="flex bg-surface-container-low rounded-xl p-1 border border-outline-variant">
                  {(["Male", "Female", "Other"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`flex-1 py-2 text-center rounded-lg text-[14px] font-semibold transition-all ${
                        gender === g
                          ? "bg-white shadow-sm text-primary"
                          : "text-on-surface-variant hover:bg-surface-container-high"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[14px] font-semibold text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">cake</span>
                  Age
                </label>
                <input
                  type="number"
                  placeholder="24"
                  required
                  min={1}
                  max={120}
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-low text-body-md focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[14px] font-semibold text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">badge</span>
                  CNIC (Optional)
                </label>
                <input
                  type="text"
                  placeholder="00000-0000000-0"
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-low text-body-md focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>

            {/* Email + City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[14px] font-semibold text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-low text-body-md focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[14px] font-semibold text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  City
                </label>
                <select className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-low text-body-md focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none">
                  {cities.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Existing patient */}
            <div className="space-y-4 pt-2">
              <label className="text-[14px] font-semibold text-on-surface-variant block">
                Have you visited this clinic before?
              </label>
              <div className="flex gap-8">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="existing"
                    checked={isExisting}
                    onChange={() => setIsExisting(true)}
                    className="w-5 h-5 text-primary border-outline-variant focus:ring-primary/20"
                  />
                  <span className="text-body-md text-on-surface">Yes, I am an existing patient</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="existing"
                    checked={!isExisting}
                    onChange={() => setIsExisting(false)}
                    className="w-5 h-5 text-primary border-outline-variant focus:ring-primary/20"
                  />
                  <span className="text-body-md text-on-surface">No, this is my first visit</span>
                </label>
              </div>
            </div>

            {/* Medical Condition + Notes */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[14px] font-semibold text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">medical_services</span>
                  Medical Condition / Reason for Visit
                </label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe your symptoms or medical concern..."
                  className="w-full p-4 rounded-xl border border-outline-variant bg-surface-container-low text-body-md focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[14px] font-semibold text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">sticky_note_2</span>
                  Notes for Doctor (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Any specific instructions or additional info..."
                  className="w-full p-4 rounded-xl border border-outline-variant bg-surface-container-low text-body-md focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={() => router.push("/book-appointment/step-2")}
                className="px-8 py-3 rounded-xl border border-outline-variant text-[14px] font-semibold text-on-surface-variant hover:bg-surface-container-high transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back
              </button>
              <button
                type="submit"
                className="px-10 py-3 rounded-xl bg-primary-container text-on-primary text-[14px] font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2"
              >
                Continue to Review
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* Right: Sidebar */}
      <div className="lg:col-span-4">
        <aside className="sticky top-28 space-y-6">
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
            <div className="p-6 bg-primary/5 border-b border-outline-variant/30">
              <h2 className="text-headline-md font-semibold text-primary">Appointment Summary</h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Doctor */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-container-high border-2 border-white shadow-sm">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDoVXlCiSn2ouB_4dgLdwMjDv6OQX3SbGnGXM_bN5t_InmWUojWtyQuDeQWxbZoJ3vcUfB0QWZVOwGLWf1_9CpELpiDIopDSBE2dkVU8MMp7WFMI27FfYrjewMxGgHKPrnkdkw2cIqhY3xE9nUGYFx3n3jsnkBB_WIVJ5Cg-mz0Nc9KJexfwUUw2_FNPuv6WPte5Ip7M5FXR96puDzBbKB7WH_LT_Lqs6R_B2wqUfCbRTbL9Au3DeTDq34gx7iFHd9HA2XR2A8K_uw"
                    alt="Dr. Julian Sterling"
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-primary">Your Doctor</p>
                  <h3 className="text-[18px] font-semibold leading-tight text-on-surface">Dr. Julian Sterling</h3>
                  <p className="text-caption text-on-surface-variant">Cardiology Specialist</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { icon: "festival", label: "Clinic", value: "Faisal Hospital" },
                  { icon: "calendar_today", label: "Date & Time", value: "Jun 30, 2026 at 10:30 AM" },
                  { icon: "stethoscope", label: "Visit Type", value: "In-Clinic Consultation" },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined">{icon}</span>
                    </div>
                    <div>
                      <p className="text-[12px] uppercase tracking-wider text-on-surface-variant font-semibold">{label}</p>
                      <p className="text-body-md text-on-surface font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-outline-variant/30 flex justify-between items-center">
                <span className="text-[20px] font-semibold text-on-surface">Total Fee</span>
                <span className="text-[24px] font-bold text-primary">Rs. 2,000</span>
              </div>
            </div>
            <div className="p-6 bg-surface-container-low/50 flex gap-3">
              <span className="material-symbols-outlined text-secondary text-[20px]">info</span>
              <p className="text-caption text-on-surface-variant italic">
                Secure encryption protects your data. We never share patient records with third parties.
              </p>
            </div>
          </div>

          {/* Support card */}
          <div className="bg-surface-container-highest/20 rounded-2xl p-6 border border-outline-variant/30 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">support_agent</span>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-on-surface">Need help?</p>
              <p className="text-caption text-on-surface-variant">Call (800) Specialist-Support</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
