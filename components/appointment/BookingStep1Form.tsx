"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import BookingSidebar from "./BookingSidebar";

const clinics = [
  {
    id: "faisal",
    type: "Primary Center",
    name: "Faisal Hospital",
    address: "545 Lower Canal Road East, Peoples Colony No. 1, Faisalabad",
    days: "Mon - Sat",
    hours: "7:00 PM - 9:00 PM",
    fee: "Rs. 2,000",
    featured: true,
  },
  {
    id: "chughtai",
    type: "Satellite Clinic",
    name: "Chughtai Medical Centre",
    address: "Satyana Road, Faisalabad",
    days: "Mon - Sat",
    hours: "5:00 PM - 7:00 PM",
    fee: "Rs. 2,000",
    featured: false,
  },
  {
    id: "united",
    type: "Evening Clinic",
    name: "United Hospital",
    address: "Main Road, Faisalabad",
    days: "Mon - Sat",
    hours: "9:00 PM - 10:00 PM",
    fee: "Rs. 1,200",
    featured: false,
  },
];

const visitTypes = [
  {
    value: "clinic",
    label: "In-Clinic Visit",
    description: "Face-to-face consultation at the Downtown Medical Center.",
    icon: "location_on",
  },
  {
    value: "online",
    label: "Online Consultation",
    description: "Secure high-definition video call from the comfort of your home.",
    icon: "videocam",
  },
];

export default function BookingStep1Form() {
  const [selectedVisitType, setSelectedVisitType] = useState<string>("clinic");
  const [reason, setReason] = useState("");
  const router = useRouter();

  const visitTypeLabel =
    visitTypes.find((v) => v.value === selectedVisitType)?.label ?? null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column */}
      <div className="lg:col-span-8 space-y-8">
        {/* Doctor Card */}
        <section className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/30 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] flex flex-col md:flex-row gap-8">
          <div className="w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDoVXlCiSn2ouB_4dgLdwMjDv6OQX3SbGnGXM_bN5t_InmWUojWtyQuDeQWxbZoJ3vcUfB0QWZVOwGLWf1_9CpELpiDIopDSBE2dkVU8MMp7WFMI27FfYrjewMxGgHKPrnkdkw2cIqhY3xE9nUGYFx3n3jsnkBB_WIVJ5Cg-mz0Nc9KJexfwUUw2_FNPuv6WPte5Ip7M5FXR96puDzBbKB7WH_LT_Lqs6R_B2wqUfCbRTbL9Au3DeTDq34gx7iFHd9HA2XR2A8K_uw"
              alt="Dr. Julian Sterling"
              width={128}
              height={128}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Top Specialist
                  </span>
                  <div className="flex items-center text-yellow-500">
                    <span
                      className="material-symbols-outlined text-[18px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                    <span className="ml-1 text-[14px] font-bold text-on-surface">4.9</span>
                  </div>
                </div>
                <h2 className="text-[24px] font-semibold leading-tight text-on-surface">
                  Dr. Julian Sterling
                </h2>
                <p className="text-on-surface-variant font-medium">Cardiology Specialist</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-outline uppercase font-bold tracking-widest block">
                  Consultation Fee
                </span>
                <span className="text-[24px] font-bold text-primary">$150</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-outline-variant/20">
                <span className="material-symbols-outlined text-primary">history_edu</span>
                <div>
                  <span className="block text-caption text-outline">Experience</span>
                  <span className="text-[14px] font-bold">15+ Years</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-outline-variant/20">
                <span className="material-symbols-outlined text-primary">verified_user</span>
                <div>
                  <span className="block text-caption text-outline">Board Status</span>
                  <span className="text-[14px] font-bold">Certified</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Form */}
        <section className="bg-white p-8 rounded-2xl border border-outline-variant/30 shadow-sm space-y-10">
          {/* 1. Clinic Selection */}
          <div>
            <div className="mb-6">
              <span className="text-primary font-semibold uppercase tracking-widest text-caption">
                Consultation Clinics
              </span>
              <h2 className="text-headline-lg font-bold text-on-surface mt-1 leading-tight">
                Choose your preferred location
              </h2>
              <p className="text-[16px] text-on-surface-variant mt-2">
                Three premium facilities across Faisalabad. Pick a clinic that fits your schedule —
                all consultations are direct with Dr. Zaid Gul.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {clinics.map((clinic) =>
                clinic.featured ? (
                  <div
                    key={clinic.id}
                    className="bg-primary p-6 rounded-xl text-on-primary flex flex-col justify-between min-h-80 shadow-lg"
                  >
                    <div>
                      <span className="text-[10px] uppercase tracking-widest font-bold opacity-80">
                        {clinic.type}
                      </span>
                      <h3 className="text-xl font-bold mt-1 mb-4">{clinic.name}</h3>
                      <div className="flex items-start gap-2 text-caption opacity-90 mb-6">
                        <span className="material-symbols-outlined text-sm mt-0.5">location_on</span>
                        <span>{clinic.address}</span>
                      </div>
                      <div className="space-y-2 text-caption">
                        <div className="flex justify-between">
                          <span>Days</span>
                          <span className="font-bold">{clinic.days}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Hours</span>
                          <span className="font-bold">{clinic.hours}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fee</span>
                          <span className="font-bold">{clinic.fee}</span>
                        </div>
                      </div>
                    </div>
                    <button className="mt-6 w-full py-3 border border-white/30 rounded-lg text-caption font-bold hover:bg-white/10 transition-colors uppercase tracking-wider">
                      Book This Clinic →
                    </button>
                  </div>
                ) : (
                  <div
                    key={clinic.id}
                    className="bg-surface p-6 rounded-xl border border-outline-variant/30 flex flex-col justify-between min-h-80"
                  >
                    <div>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-outline">
                        {clinic.type}
                      </span>
                      <h3 className="text-xl font-bold mt-1 mb-4 text-on-surface">{clinic.name}</h3>
                      <div className="flex items-start gap-2 text-caption text-on-surface-variant mb-6">
                        <span className="material-symbols-outlined text-sm text-primary mt-0.5">
                          location_on
                        </span>
                        <span>{clinic.address}</span>
                      </div>
                      <div className="space-y-2 text-caption text-on-surface-variant border-t border-outline-variant/10 pt-4">
                        <div className="flex justify-between">
                          <span>Days</span>
                          <span className="font-bold text-on-surface">{clinic.days}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Hours</span>
                          <span className="font-bold text-on-surface">{clinic.hours}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fee</span>
                          <span className="font-bold text-primary">{clinic.fee}</span>
                        </div>
                      </div>
                    </div>
                    <button className="mt-6 w-full py-3 border border-primary/20 rounded-lg text-caption font-bold text-primary hover:bg-primary/5 transition-colors uppercase tracking-wider">
                      Book This Clinic →
                    </button>
                  </div>
                )
              )}
            </div>

            <div className="mt-10 border-t border-outline-variant/20 pt-10" />
          </div>

          {/* 2. Visit Type */}
          <div>
            <label className="text-[14px] font-semibold text-on-surface-variant uppercase tracking-wider mb-4 block">
              2. Choose Visit Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visitTypes.map((vt) => (
                <label key={vt.value} className="relative group cursor-pointer">
                  <input
                    type="radio"
                    name="visit_type"
                    value={vt.value}
                    checked={selectedVisitType === vt.value}
                    onChange={() => setSelectedVisitType(vt.value)}
                    className="sr-only peer"
                  />
                  <div className="p-6 rounded-2xl border-2 border-outline-variant peer-checked:border-primary peer-checked:bg-primary/3 transition-all hover:bg-surface-container-low">
                    <div className="flex justify-between items-start mb-4">
                      <span className="material-symbols-outlined text-3xl text-outline group-hover:text-primary transition-colors">
                        {vt.icon}
                      </span>
                      <div className="w-6 h-6 rounded-full border-2 border-outline-variant peer-checked:border-primary flex items-center justify-center">
                        {selectedVisitType === vt.value && (
                          <div className="w-3 h-3 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                    <h3 className="font-bold text-lg mb-1">{vt.label}</h3>
                    <p className="text-caption text-on-surface-variant">{vt.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 3. Reason for Visit */}
          <div>
            <label
              htmlFor="reason"
              className="text-[14px] font-semibold text-on-surface-variant uppercase tracking-wider mb-4 block"
            >
              3. Reason for Visit
            </label>
            <textarea
              id="reason"
              rows={6}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe your symptoms or reason for visit... (e.g. Chest tightness during exercise, routine heart health screening)"
              className="w-full rounded-2xl border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all p-5 placeholder:text-outline text-[16px] resize-none"
            />
            <p className="mt-3 text-caption text-outline">
              Your information is protected by industry-standard clinical privacy protocols.
            </p>
          </div>

          {/* Next Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={() => router.push("/book-appointment/step-2")}
              className="bg-primary text-on-primary px-10 py-4 rounded-full font-semibold tracking-wider text-[18px] active:scale-95 transition-all hover:shadow-lg hover:shadow-primary/20 flex items-center gap-2"
            >
              Next: Date &amp; Time
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </section>
      </div>

      {/* Right Sidebar */}
      <BookingSidebar visitTypeLabel={visitTypeLabel} />
    </div>
  );
}
