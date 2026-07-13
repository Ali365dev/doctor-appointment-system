"use client";

import Image from "next/image";
import { useBookingStore } from "@/store/bookingStore";
import { doctor } from "@/lib/data";

interface BookingSidebarProps {
  visitTypeLabel: string | null;
}

export default function BookingSidebar({ visitTypeLabel }: BookingSidebarProps) {
  const { selectedClinic, selectedProcedure, selectedDate, selectedTime } = useBookingStore();

  const effectiveFee = selectedProcedure?.pricePkr ?? selectedClinic?.fee_pkr ?? doctor.fee_summary.min_fee_pkr;

  const formattedDate = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <aside className="lg:col-span-4 sticky top-28">
      <div className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant/40">
        <h3 className="text-[24px] font-semibold text-on-surface mb-6 border-b border-outline-variant/30 pb-4">
          Booking Summary
        </h3>

        <div className="space-y-6">
          {/* Specialist */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-high border border-white flex-shrink-0">
              <Image
                src={doctor.profile_image}
                alt={doctor.name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            <div>
              <span className="block text-[10px] text-outline font-bold uppercase tracking-tighter">
                Specialist
              </span>
              <span className="text-[14px] font-bold text-on-surface">{doctor.name}</span>
              <span className="block text-caption text-on-surface-variant">
                {doctor.specialization.join(" & ")}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4 pt-4 border-t border-outline-variant/20">
            {/* Procedure */}
            {selectedProcedure && (
              <div>
                <span className="text-caption text-on-surface-variant block">Procedure</span>
                <span className="text-[14px] font-bold text-on-surface">{selectedProcedure.name}</span>
              </div>
            )}

            {/* Clinic */}
            <div className={`transition-opacity ${selectedClinic ? "opacity-100" : "opacity-40"}`}>
              <span className="text-caption text-on-surface-variant block">Clinic</span>
              <span className="text-[14px] font-bold text-on-surface">
                {selectedClinic?.name ?? "Not selected"}
              </span>
            </div>

            {/* Visit type */}
            <div
              className={`flex justify-between items-center transition-opacity ${visitTypeLabel ? "opacity-100" : "opacity-40"}`}
            >
              <span className="text-on-surface-variant">Visit Type</span>
              <span className={`text-[14px] font-bold ${!visitTypeLabel ? "italic" : ""}`}>
                {visitTypeLabel ?? "Not selected"}
              </span>
            </div>

            {/* Date */}
            <div
              className={`flex justify-between items-center transition-opacity ${formattedDate ? "opacity-100" : "opacity-40"}`}
            >
              <span className="text-on-surface-variant">Date</span>
              <span className={`text-[14px] font-bold ${!formattedDate ? "italic" : ""}`}>
                {formattedDate ?? "Step 2"}
              </span>
            </div>

            {/* Time */}
            <div
              className={`flex justify-between items-center transition-opacity ${selectedTime ? "opacity-100" : "opacity-40"}`}
            >
              <span className="text-on-surface-variant">Time</span>
              <span className={`text-[14px] font-bold ${!selectedTime ? "italic" : ""}`}>
                {selectedTime ?? "Step 2"}
              </span>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-outline-variant/20">
              <span className="font-bold text-on-surface">{selectedProcedure ? "Procedure Fee" : "Consultation Fee"}</span>
              <span className="text-[24px] font-extrabold text-primary">
                Rs. {effectiveFee.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-8 bg-surface p-4 rounded-xl border border-dashed border-outline-variant">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-[20px]">info</span>
            <p className="text-[12px] text-on-surface-variant">
              Flexible cancellation policy. Change or cancel your appointment as needed.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
