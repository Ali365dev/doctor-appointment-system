"use client";

import { useState } from "react";
import { useBookingStore } from "@/store/bookingStore";
import { useDoctorProfile } from "@/lib/context/DoctorProfileContext";
import { dayOfWeekForDate } from "@/lib/slots";

// Ultimate fallback if the CMS fields are somehow empty — the CMS-configured
// text (Announcements tab) is the actual source of truth, not this.
const FALLBACK_MESSAGE_EN =
  "📢 This clinic is closed today. Appointments cannot be booked for today. Please select another date or contact the clinic for more information.";
const FALLBACK_MESSAGE_UR =
  "📢 آج یہ کلینک بند ہے، لہٰذا آج کے لیے اپائنٹمنٹ بک نہیں کی جا سکتی۔ براہِ کرم کوئی دوسری تاریخ منتخب کریں یا مزید معلومات کے لیے کلینک سے رابطہ کریں۔";

/**
 * Shows a same-day "clinic closed" notice on the booking flow whenever the
 * currently selected clinic's weekly schedule marks today as not open. Reads
 * straight from the shared booking store, so it updates automatically as the
 * user changes clinic (Step 1) or date (Step 2) without any prop plumbing.
 */
export default function ClinicClosedBanner() {
  const doctor = useDoctorProfile();
  const selectedClinic = useBookingStore((s) => s.selectedClinic);
  const selectedDate = useBookingStore((s) => s.selectedDate);
  const [todayIso] = useState(() => new Date().toISOString().slice(0, 10));

  if (!selectedClinic || !selectedDate || selectedDate !== todayIso) return null;

  const todayEntry = selectedClinic.schedule?.find((d) => d.day === dayOfWeekForDate(selectedDate));
  const isClosedToday = todayEntry ? !todayEntry.isOpen : false;
  if (!isClosedToday) return null;

  const messageEn = doctor.clinicClosedMessageEn || FALLBACK_MESSAGE_EN;
  const messageUr = doctor.clinicClosedMessageUr || FALLBACK_MESSAGE_UR;

  return (
    <div
      role="alert"
      className="mb-8 w-full flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 text-amber-900 shadow-sm"
    >
      <span className="material-symbols-outlined shrink-0 text-amber-600 text-[24px]" aria-hidden>
        warning
      </span>
      <div className="space-y-1.5 min-w-0">
        <p dir="rtl" lang="ur" className="font-urdu font-semibold text-[17px] leading-relaxed">
          {messageUr}
        </p>
        <p lang="en" className="text-[14px] leading-relaxed text-amber-800">
          {messageEn}
        </p>
      </div>
    </div>
  );
}
