"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { toast } from "react-toastify";
import { doctor as staticDoctor } from "@/lib/data";
import { useDoctorProfile } from "@/lib/context/DoctorProfileContext";
import { useBookingStore } from "@/store/bookingStore";
import BookingSidebar from "./BookingSidebar";
import type { WeeklySchedule } from "@/types/clinic";

interface ApiClinic {
  _id: string;
  name: string;
  address?: string;
  feePkr: number;
  timings: Record<string, string>;
  schedule?: WeeklySchedule;
  defaultSlotDurationMinutes?: number;
  mapLink?: string;
}

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
  const doctor = useDoctorProfile();
  const setClinic = useBookingStore((s) => s.setClinic);
  const setVisitType = useBookingStore((s) => s.setVisitType);
  const setReason_ = useBookingStore((s) => s.setReason);
  const storedClinic = useBookingStore((s) => s.selectedClinic);
  const selectedProcedure = useBookingStore((s) => s.selectedProcedure);
  const clearProcedure = useBookingStore((s) => s.clearProcedure);
  const clearAppointment = useBookingStore((s) => s.clearAppointment);

  const searchParamsInit = useSearchParams();
  const procedureParam = searchParamsInit.get("procedure");

  const [locations, setLocations] = useState<ApiClinic[]>([]);
  const [clinicsLoading, setClinicsLoading] = useState(true);
  const [clinicsError, setClinicsError] = useState("");

  const [selectedClinicIndex, setSelectedClinicIndex] = useState<number>(0);

  // Landing on Step 1 always means a (re)start of the booking flow — never let a
  // leftover appointmentId from a previous booking make Step 4 skip creating a new one.
  // The `?procedure=` query param is the only trusted signal that a procedure already
  // in the store belongs to *this* flow — its absence means a plain "Book Appointment"
  // click, so any stale procedure selection must be cleared rather than silently reused.
  useEffect(() => {
    clearAppointment();
    if (!procedureParam) clearProcedure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/clinics");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not load clinics");
        let clinics: ApiClinic[] = data.clinics ?? [];

        // When booking a procedure, only clinics that actively offer it are selectable.
        if (procedureParam) {
          const assignmentsRes = await fetch(`/api/procedures/${procedureParam}/clinics`);
          const assignmentsData = await assignmentsRes.json();
          if (assignmentsRes.ok) {
            const activeClinicIds = new Set(
              (assignmentsData.assignments ?? [])
                .filter((a: { isActive: boolean }) => a.isActive)
                .map((a: { clinicId: { _id: string } | string }) =>
                  typeof a.clinicId === "string" ? a.clinicId : a.clinicId._id
                )
            );
            clinics = clinics.filter((c) => activeClinicIds.has(c._id));
          }
        }

        if (cancelled) return;
        setLocations(clinics);
        // Restore the previously-selected clinic (by real clinicId) if any.
        const byId = storedClinic ? clinics.findIndex((l) => l._id === storedClinic.id) : -1;
        setSelectedClinicIndex(byId >= 0 ? byId : 0);
      } catch {
        if (!cancelled) setClinicsError("Could not load clinics. Please refresh the page.");
      } finally {
        if (!cancelled) setClinicsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Runs once on mount — storedClinic is only consulted for the initial restore.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchParams = searchParamsInit;
  const [selectedVisitType, setSelectedVisitType] = useState<"clinic" | "online">(() =>
    !procedureParam && searchParams.get("visitType") === "online" ? "online" : "clinic"
  );
  const [reason, setReason] = useState("");
  const router = useRouter();

  // Procedures require an in-person visit — online consultation isn't an option for them.
  const availableVisitTypes = procedureParam ? visitTypes.filter((vt) => vt.value !== "online") : visitTypes;

  useEffect(() => {
    if (procedureParam) setSelectedVisitType("clinic");
  }, [procedureParam]);

  const visitTypeLabel = visitTypes.find((v) => v.value === selectedVisitType)?.label ?? null;

  useEffect(() => {
    const loc = locations[selectedClinicIndex];
    if (loc) {
      setClinic({
        id: loc._id,
        name: loc.name,
        address: loc.address ?? null,
        fee_pkr: loc.feePkr,
        timings: loc.timings,
        schedule: loc.schedule,
        defaultSlotDurationMinutes: loc.defaultSlotDurationMinutes,
        map_link: loc.mapLink,
      });
    }
  }, [selectedClinicIndex, locations, setClinic]);

  const handleNext = () => {
    if (!locations[selectedClinicIndex]) {
      toast.error("Please select a clinic to continue.");
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
              src={doctor.profileImage}
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
                      {staticDoctor.rating.score}
                    </span>
                  </div>
                </div>
                <h2 className="text-[24px] font-semibold leading-tight text-on-surface">
                  {doctor.name}
                </h2>
                <p className="text-on-surface-variant font-medium">
                  {doctor.specialization.join(" & ")}
                </p>
                <p className="text-caption text-on-surface-variant mt-xs">{doctor.education.map((edu) => edu.name).join(", ")}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-outline uppercase font-bold tracking-widest block">
                  {selectedProcedure ? "Procedure Fee" : "Consultation Fee"}
                </span>
                <span className="text-[24px] font-bold text-primary">
                  Rs. {(selectedProcedure?.pricePkr ?? locations[selectedClinicIndex]?.feePkr)?.toLocaleString() ?? "—"}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-outline-variant/20">
                <span className="material-symbols-outlined text-primary">history_edu</span>
                <div>
                  <span className="block text-caption text-outline">Experience</span>
                  <span className="text-[14px] font-bold">{doctor.experienceYears}+ Years</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-outline-variant/20">
                <span className="material-symbols-outlined text-primary">schedule</span>
                <div>
                  <span className="block text-caption text-outline">Wait Time</span>
                  <span className="text-[14px] font-bold">{staticDoctor.wait_time}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Form */}
        <section className="bg-white p-8 rounded-2xl border border-outline-variant/30 shadow-sm space-y-10">
          {selectedProcedure && (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <span className="material-symbols-outlined text-primary text-3xl">medical_services</span>
              <div>
                <span className="text-[10px] text-primary uppercase font-bold tracking-widest block">
                  Booking Procedure
                </span>
                <h3 className="font-bold text-on-surface">
                  {selectedProcedure.name} — Rs. {selectedProcedure.pricePkr.toLocaleString()}
                </h3>
              </div>
            </div>
          )}

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

            {clinicsLoading ? (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-80 w-72 shrink-0 sm:w-80 rounded-xl bg-surface-container-low animate-pulse" />
                ))}
              </div>
            ) : clinicsError ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-error/10 border border-error/30">
                <span className="material-symbols-outlined text-error">error</span>
                <p className="text-error text-body-md font-semibold">{clinicsError}</p>
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth">
                {locations.map((loc, i) => {
                  const days = formatTimings(loc.timings);
                  const hours = Object.values(loc.timings)[0] ?? "";
                  const isSelected = selectedClinicIndex === i;
                  const LABELS = ["Primary Center", "Satellite Clinic", "Evening Clinic"];

                  return (
                    <div
                      key={loc._id}
                      onClick={() => setSelectedClinicIndex(i)}
                      className={`p-6 rounded-xl flex flex-col justify-between min-h-80 w-72 sm:w-80 shrink-0 snap-start cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "bg-primary shadow-xl shadow-primary/30 scale-[1.02]"
                          : "bg-surface border border-outline-variant/30 hover:border-primary/40 hover:shadow-md"
                      }`}
                    >
                      <div>
                        {/* Card type label */}
                        <span
                          className={`text-[10px] uppercase tracking-widest font-bold ${
                            isSelected ? "text-white/70" : "text-outline"
                          }`}
                        >
                          {LABELS[i] ?? "Clinic"}
                        </span>

                        {/* Clinic name */}
                        <h3
                          className={`text-xl font-bold mt-1 mb-4 leading-snug ${
                            isSelected ? "text-white" : "text-on-surface"
                          }`}
                        >
                          {loc.name}
                        </h3>

                        {/* Address */}
                        {loc.address ? (
                          <div
                            className={`flex items-start gap-2 text-[12px] mb-6 ${
                              isSelected ? "text-white/80" : "text-on-surface-variant"
                            }`}
                          >
                            <span
                              className={`material-symbols-outlined text-[16px] mt-0.5 shrink-0 ${
                                isSelected ? "text-white/70" : "text-primary"
                              }`}
                            >
                              location_on
                            </span>
                            <span>{loc.address}</span>
                          </div>
                        ) : (
                          <div
                            className={`mb-6 text-[12px] italic ${
                              isSelected ? "text-white/60" : "text-on-surface-variant"
                            }`}
                          >
                            Address not available
                          </div>
                        )}

                        {/* Timings & fee */}
                        <div
                          className={`space-y-2 text-[12px] border-t pt-4 ${
                            isSelected ? "border-white/20" : "border-outline-variant/20"
                          }`}
                        >
                          {days && (
                            <div className="flex justify-between gap-2">
                              <span className={isSelected ? "text-white/70" : "text-on-surface-variant"}>
                                Days
                              </span>
                              <span className={`font-bold text-right ${isSelected ? "text-white" : "text-on-surface"}`}>
                                {days}
                              </span>
                            </div>
                          )}
                          {hours && (
                            <div className="flex justify-between gap-2">
                              <span className={isSelected ? "text-white/70" : "text-on-surface-variant"}>
                                Hours
                              </span>
                              <span className={`font-bold text-right ${isSelected ? "text-white" : "text-on-surface"}`}>
                                {hours}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between gap-2">
                            <span className={isSelected ? "text-white/70" : "text-on-surface-variant"}>
                              {selectedProcedure ? "Procedure Fee" : "Fee"}
                            </span>
                            <span className={`font-bold ${isSelected ? "text-white" : "text-primary"}`}>
                              Rs. {(selectedProcedure?.pricePkr ?? loc.feePkr).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedClinicIndex(i); }}
                        className={`mt-6 w-full py-3 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-all ${
                          isSelected
                            ? "bg-white/20 border border-white/60 text-white hover:bg-white/30"
                            : "border border-primary/30 text-primary bg-transparent hover:bg-primary/5"
                        }`}
                      >
                        {isSelected ? "✓ Selected" : "Book This Clinic →"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-10 border-t border-outline-variant/20 pt-10" />
          </div>

          {/* 2. Visit Type */}
          <div>
            <label className="text-[14px] font-semibold text-on-surface-variant uppercase tracking-wider mb-4 block">
              2. Choose Visit Type
            </label>
            <div className={`grid grid-cols-1 gap-4 ${availableVisitTypes.length > 1 ? "md:grid-cols-2" : ""}`}>
              {availableVisitTypes.map((vt) => (
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
              className="text-[14px] font-semibold text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2"
            >
              3. Reason for Visit
              <span className="normal-case tracking-normal font-normal text-outline text-[12px]">
                (Optional)
              </span>
            </label>
            <textarea
              id="reason"
              rows={5}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Briefly describe your symptoms or reason for visit... (e.g. stomach pain, bloating, jaundice)"
              className="w-full rounded-2xl border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all p-5 placeholder:text-outline text-[16px] resize-none"
            />
            <p className="mt-3 text-caption text-outline">
              Your information is protected by industry-standard clinical privacy protocols.
            </p>
          </div>

          {/* Next Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleNext}
              disabled={clinicsLoading || locations.length === 0}
              className="bg-primary text-on-primary px-10 py-4 rounded-full font-semibold tracking-wider text-[18px] active:scale-95 transition-all hover:shadow-lg hover:shadow-primary/20 flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
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
