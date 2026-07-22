"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "react-toastify";
import { useBookingStore } from "@/store/bookingStore";
import { doctor as staticDoctor, buildWhatsappLink } from "@/lib/data";
import { useDoctorProfile } from "@/lib/context/DoctorProfileContext";

export default function BookingStep4Content() {
  const doctor = useDoctorProfile();
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const {
    selectedClinic,
    selectedProcedure,
    selectedDate,
    selectedTime,
    visitType,
    reason,
    patientInfo,
    referralDoctor,
    medicalReportUrl,
    appointmentId,
    setAppointment,
  } = useBookingStore();

  const handleProceedToPayment = async () => {
    // Already created (e.g. patient navigated back and forth) — don't double-book.
    if (appointmentId) {
      router.push("/book-appointment/step-5");
      return;
    }

    if (!selectedClinic || !selectedDate || !selectedTime) {
      toast.error("Missing booking details — please restart from Step 1.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicId: selectedClinic.id,
          visitType,
          date: selectedDate,
          time: selectedTime,
          reason,
          patient: {
            fullName: patientInfo.fullName,
            phone: patientInfo.phone,
            gender: patientInfo.gender,
            age: Number(patientInfo.age),
            cnic: patientInfo.cnic || undefined,
            email: patientInfo.email || undefined,
            city: patientInfo.city,
            isExisting: patientInfo.isExisting,
            condition: patientInfo.condition || undefined,
            notes: patientInfo.notes || undefined,
          },
          appointmentType: selectedProcedure ? "procedure" : "consultation",
          procedureId: selectedProcedure?.procedureId,
          referralDoctor: referralDoctor || undefined,
          medicalReportUrl: medicalReportUrl || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not create appointment. Please try again.");
        return;
      }
      setAppointment(data.appointment._id, data.appointment.appointmentNumber);
      router.push("/book-appointment/step-5");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formattedDate = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      })
    : "—";

  const fee = selectedProcedure?.pricePkr ?? selectedClinic?.fee_pkr ?? staticDoctor.fee_summary.min_fee_pkr;

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
                src={doctor.profileImage}
                alt={doctor.name}
                width={64}
                height={64}
                className="w-16 h-16 rounded-full object-cover border-2 border-surface-container shrink-0"
                unoptimized
              />
              <div>
                <p className="text-caption text-outline uppercase tracking-wider">Medical Specialist</p>
                <p className="text-body-lg font-bold text-on-surface">{doctor.name}</p>
                <p className="text-body-md text-on-surface-variant">{doctor.specialization.join(" & ")}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-caption text-outline uppercase tracking-wider">Date &amp; Time</p>
                <p className="text-body-md font-semibold text-on-surface">{formattedDate}</p>
                <p className="text-body-md text-on-surface-variant">{selectedTime ?? "—"}</p>
              </div>
              <div>
                <p className="text-caption text-outline uppercase tracking-wider">Visit Type</p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/10 text-secondary mt-1">
                  <span className="material-symbols-outlined text-sm">
                    {visitType === "online" ? "videocam" : "local_hospital"}
                  </span>
                  <span className="text-caption font-bold">
                    {visitType === "online" ? "Online" : "In-Clinic"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {selectedProcedure && (
            <div className="mt-6 pt-4 border-t border-outline-variant/20 flex items-center gap-2 text-on-surface-variant text-body-md">
              <span className="material-symbols-outlined text-primary">medical_services</span>
              <span className="font-semibold text-on-surface">{selectedProcedure.name}</span>
            </div>
          )}
          {selectedClinic && (
            <div className={`pt-4 flex items-center gap-2 text-on-surface-variant text-body-md ${selectedProcedure ? "" : "mt-6 border-t border-outline-variant/20"}`}>
              <span className="material-symbols-outlined text-primary">location_on</span>
              <span>{selectedClinic.name}</span>
              {selectedClinic.address && <span>— {selectedClinic.address}</span>}
            </div>
          )}
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
              { label: "Full Name", value: patientInfo.fullName || "—" },
              { label: "Phone", value: patientInfo.phone || "—" },
              { label: "Age", value: patientInfo.age ? `${patientInfo.age} years` : "—" },
              { label: "Gender", value: patientInfo.gender },
              { label: "City", value: patientInfo.city || "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-caption text-outline uppercase tracking-wider">{label}</p>
                <p className="text-body-md font-semibold text-on-surface">{value}</p>
              </div>
            ))}
          </div>
          {patientInfo.condition && (
            <div className="mt-6 pt-4 border-t border-outline-variant/20">
              <p className="text-caption text-outline uppercase tracking-wider mb-1">Reason for Visit</p>
              <p className="text-body-md text-on-surface-variant">{patientInfo.condition}</p>
            </div>
          )}
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
            I confirm that all information provided is correct and I agree to the consultation
            terms for {doctor.name}.
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
              <span className="text-on-surface-variant">{selectedProcedure ? "Procedure Fee" : "Specialist Consultation Fee"}</span>
              <span className="font-semibold text-on-surface">Rs. {fee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-body-md">
              <span className="text-on-surface-variant">Booking Service Fee</span>
              <span className="font-semibold text-on-surface">Rs. 0</span>
            </div>
            <div className="pt-4 border-t border-outline-variant/20 flex justify-between items-center">
              <span className="font-bold text-body-lg">Total Amount</span>
              <span className="font-bold text-headline-md text-primary">Rs. {fee.toLocaleString()}</span>
            </div>
            <div className="pt-6">
              <button
                onClick={handleProceedToPayment}
                disabled={!confirmed || submitting}
                className={`w-full bg-primary text-white py-4 rounded-xl font-bold text-body-lg transition-all active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2 ${
                  !confirmed || submitting ? "opacity-50 pointer-events-none" : "hover:opacity-90"
                }`}
              >
                {submitting ? "Booking…" : "Proceed to Payment"}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <p className="text-caption text-outline text-center mt-4">Secure encrypted transaction</p>
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

        <div className="mt-6 p-6 rounded-xl border border-dashed border-outline-variant text-center">
          <p className="text-caption text-outline">Need assistance with your booking?</p>
          <a
            href={buildWhatsappLink(doctor.contactWhatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-[14px] font-semibold text-primary hover:underline"
          >
            Contact via WhatsApp
          </a>
        </div>
      </aside>
    </div>
  );
}
