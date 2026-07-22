"use client";

import { useState } from "react";
import { useBookingStore } from "@/store/bookingStore";
import { useDoctorProfile } from "@/lib/context/DoctorProfileContext";
import { isClinicClosedOnDate } from "@/lib/slots";

// Ultimate fallback if the CMS fields are somehow empty — the CMS-configured
// text (Website CMS → Announcements) is the actual source of truth, not this.
const FALLBACK_MESSAGE_EN =
  "📢 This clinic is closed today. Appointments cannot be booked for today. Please select another date or contact the clinic for more information.";
const FALLBACK_MESSAGE_UR =
  "📢 آج یہ کلینک بند ہے، لہٰذا آج کے لیے اپائنٹمنٹ بک نہیں کی جا سکتی۔ براہِ کرم کوئی دوسری تاریخ منتخب کریں یا مزید معلومات کے لیے کلینک سے رابطہ کریں۔";

/**
 * Whether the currently selected booking clinic (if any) is closed on
 * today's real-world date, per its weekly schedule — plus the CMS-configured
 * (or fallback) bilingual message to show about it. Shared by the booking
 * flow's inline banner and the site-wide header ticker so both agree.
 */
export function useClinicClosedToday() {
  const doctor = useDoctorProfile();
  const selectedClinic = useBookingStore((s) => s.selectedClinic);
  const [todayIso] = useState(() => new Date().toISOString().slice(0, 10));

  const isClosedToday = !!selectedClinic && isClinicClosedOnDate(selectedClinic.schedule, todayIso);

  return {
    isClosedToday,
    todayIso,
    clinicName: selectedClinic?.name ?? "",
    messageEn: doctor.clinicClosedMessageEn || FALLBACK_MESSAGE_EN,
    messageUr: doctor.clinicClosedMessageUr || FALLBACK_MESSAGE_UR,
  };
}
