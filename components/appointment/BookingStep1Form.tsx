"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { doctor } from "@/lib/data";
import { useBookingStore } from "@/store/bookingStore";
import BookingSidebar from "./BookingSidebar";

const visitTypes = [
  {
    value: "clinic",
    label: "In-Clinic Visit",
    description: "Face-to-face consultation at your preferred location.",
    icon: "location_on",
  },
  {
    value: "online",
    label: "Online Consultation",
    description: "Secure high-definition video call from the comfort of your home.",
    icon: "videocam",
  },
];

function formatTimings(timings: Record<string, string>): string {
  const days = Object.keys(timings);
  if (!days.length) return "";
  if (days.length === 6) return `${days[0]} – ${days[days.length - 1]}`;
  return days.join(", ");
}

export default function BookingStep1Form() {
  const [selectedClinicIndex, setSelectedClinicIndex] = useState<number>(0);
  const [selectedVisitType, setSelectedVisitType] = useState<"clinic" | "online">("clinic");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const setClinic = useBookingStore((s) => s.setClinic);
  const setVisitType = useBookingStore((s) => s.setVisitType);
  const setReason_ = useBookingStore((s) => s.setReason);

  const locations = doctor.practice_locations;
  const visitTypeLabel = visitTypes.find((v) => v.value === selectedVisitType)?.label ?? null;

  useEffect(() => {
    if (locations.length > 0) {
      const loc = locations[selectedClinicIndex];
      setClinic({
        id: String(selectedClinicIndex),
        name: loc.name,
        address: loc.address,
        fee_pkr: loc.fee_pkr,
        timings: loc.timings as Record<string, string>,
        booking_link: (loc as { booking_link?: string }).booking_link,
        map_link: (loc as { map_link?: string }).map_link,
      });
    }
  }, [selectedClinicIndex, locations, setClinic]);

  const handleNext = () => {
    if (!reason.trim()) {
      setError("Please describe your reason for visit.");
      return;
    }
    setVisitType(selectedVisitType);
    setReason_(reason);
    router.push("/book-appointment/step-2");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column */}
      <div className="lg:col-span-8 space-y-8">
        {/* Doctor Card */}
        <section className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/30 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] flex flex-col md:flex-row gap-8">
          <div className="w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0">
            <Image
              src={doctor.profile_image}
              alt={doctor.name}
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
                    {doctor.verification}
                  </span>
                  <div className="flex items-center text-yellow-500">
                    <span
                      className="material-symbols-outlined text-[18px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                    <span className="ml-1 text-[14px] font-bold text-on-surface">
                      {doctor.rating.score}
                    </span>
                  </div>
                </div>
                <h2 className="text-[24px] font-semibold leading-tight text-on-surface">
                  {doctor.name}
                </h2>
                <p className="text-on-surface-variant font-medium">
                  {doctor.specialization.join(" & ")}
                </p>
                <p className="text-caption text-on-surface-variant mt-xs">{doctor.qualifications}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-outline uppercase font-bold tracking-widest block">
                  Consultation Fee
                </span>
                <span className="text-[24px] font-bold text-primary">
                  Rs. {locations[selectedClinicIndex]?.fee_pkr.toLocaleString() ?? "—"}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-outline-variant/20">
                <span className="material-symbols-outlined text-primary">history_edu</span>
                <div>
                  <span className="block text-caption text-outline">Experience</span>
                  <span className="text-[14px] font-bold">{doctor.experience_years}+ Years</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-outline-variant/20">
                <span className="material-symbols-outlined text-primary">schedule</span>
                <div>
                  <span className="block text-caption text-outline">Wait Time</span>
                  <span className="text-[14px] font-bold">{doctor.wait_time}</span>
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
                {locations.length} premium {locations.length === 1 ? "facility" : "facilities"} across{" "}
                {doctor.city}. All consultations are direct with {doctor.name}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {locations.map((loc, i) => {
                const timings = loc.timings as Record<string, string>;
                const days = formatTimings(timings);
                const hours = Object.values(timings)[0] ?? "";
                const isFeatured = i === 0;
                const isSelected = selectedClinicIndex === i;

                if (isFeatured) {
                  return (
                    <div
                      key={i}
                      className={`${isSelected ? "ring-2 ring-white/50" : ""} bg-primary p-6 rounded-xl text-on-primary flex flex-col justify-between min-h-80 shadow-lg cursor-pointer transition-all`}
                      onClick={() => setSelectedClinicIndex(i)}
                    >
                      <div>
                        <span className="text-[10px] uppercase tracking-widest font-bold opacity-80">
                          Primary Center
                        </span>
                        <h3 className="text-xl font-bold mt-1 mb-4">{loc.name}</h3>
                        {loc.address && (
                          <div className="flex items-start gap-2 text-caption opacity-90 mb-6">
                            <span className="material-symbols-outlined text-sm mt-0.5">location_on</span>
                            <span>{loc.address}</span>
                          </div>
                        )}
                        <div className="space-y-2 text-caption">
                          {days && (
                            <div className="flex justify-between">
                              <span>Days</span>
                              <span className="font-bold">{days}</span>
                            </div>
                          )}
                          {hours && (
                            <div className="flex justify-between">
                              <span>Hours</span>
                              <span className="font-bold">{hours}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Fee</span>
                            <span className="font-bold">Rs. {loc.fee_pkr.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedClinicIndex(i); }}
                        className={`mt-6 w-full py-3 border ${isSelected ? "bg-white/20 border-white" : "border-white/30"} rounded-lg text-caption font-bold hover:bg-white/10 transition-colors uppercase tracking-wider`}
                      >
                        {isSelected ? "✓ Selected" : "Book This Clinic →"}
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={i}
                    className={`bg-surface p-6 rounded-xl border ${isSelected ? "border-primary ring-2 ring-primary/20" : "border-outline-variant/30"} flex flex-col justify-between min-h-80 cursor-pointer transition-all`}
                    onClick={() => setSelectedClinicIndex(i)}
                  >
                    <div>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-outline">
                        {i === 1 ? "Satellite Clinic" : "Evening Clinic"}
                      </span>
                      <h3 className="text-xl font-bold mt-1 mb-4 text-on-surface">{loc.name}</h3>
                      {loc.address ? (
                        <div className="flex items-start gap-2 text-caption text-on-surface-variant mb-6">
                          <span className="material-symbols-outlined text-sm text-primary mt-0.5">
                            location_on
                          </span>
                          <span>{loc.address}</span>
                        </div>
                      ) : (
                        <div className="mb-6 text-caption text-on-surface-variant italic">
                          Address not available
                        </div>
                      )}
                      <div className="space-y-2 text-caption text-on-surface-variant border-t border-outline-variant/10 pt-4">
                        {days && (
                          <div className="flex justify-between">
                            <span>Days</span>
                            <span className="font-bold text-on-surface">{days}</span>
                          </div>
                        )}
                        {hours && (
                          <div className="flex justify-between">
                            <span>Hours</span>
                            <span className="font-bold text-on-surface">{hours}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Fee</span>
                          <span className="font-bold text-primary">Rs. {loc.fee_pkr.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedClinicIndex(i); }}
                      className={`mt-6 w-full py-3 border ${isSelected ? "bg-primary text-on-primary border-primary" : "border-primary/20 text-primary hover:bg-primary/5"} rounded-lg text-caption font-bold transition-colors uppercase tracking-wider`}
                    >
                      {isSelected ? "✓ Selected" : "Book This Clinic →"}
                    </button>
                  </div>
                );
              })}
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
                    onChange={() => setSelectedVisitType(vt.value as "clinic" | "online")}
                    className="sr-only"
                  />
                  <div className={`p-6 rounded-2xl border-2 transition-all hover:bg-surface-container-low ${selectedVisitType === vt.value ? "border-primary bg-primary/3" : "border-outline-variant"}`}>
                    <div className="flex justify-between items-start mb-4">
                      <span className={`material-symbols-outlined text-3xl transition-colors ${selectedVisitType === vt.value ? "text-primary" : "text-outline group-hover:text-primary"}`}>
                        {vt.icon}
                      </span>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedVisitType === vt.value ? "border-primary" : "border-outline-variant"}`}>
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
              onChange={(e) => { setReason(e.target.value); if (error) setError(""); }}
              placeholder="Describe your symptoms or reason for visit... (e.g. stomach pain, bloating, jaundice)"
              className={`w-full rounded-2xl border ${error ? "border-error" : "border-outline-variant"} focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all p-5 placeholder:text-outline text-[16px] resize-none`}
            />
            {error && <p className="mt-2 text-caption text-error">{error}</p>}
            <p className="mt-3 text-caption text-outline">
              Your information is protected by industry-standard clinical privacy protocols.
            </p>
          </div>

          {/* Next Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleNext}
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
