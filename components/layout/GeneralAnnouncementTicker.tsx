"use client";

import { useDoctorProfile } from "@/lib/context/DoctorProfileContext";

export const GENERAL_ANNOUNCEMENT_TICKER_HEIGHT_PX = 36;

/**
 * Site-wide marquee notice, rendered as the first row inside the fixed
 * header on every page — general info (e.g. "contact us with questions"),
 * unrelated to any clinic's open/closed status. `AnnouncementSpacer` reserves
 * the matching page-flow space so this never overlaps page content.
 * Configurable from Website CMS → Announcements; blank on both languages
 * hides it entirely.
 */
export default function GeneralAnnouncementTicker() {
  const doctor = useDoctorProfile();
  const messageEn = doctor.generalAnnouncementMessageEn?.trim();
  const messageUr = doctor.generalAnnouncementMessageUr?.trim();

  if (!messageEn && !messageUr) return null;

  const text = [messageUr, messageEn].filter(Boolean).join("    •    ");

  return (
    <div
      role="status"
      aria-live="polite"
      style={{ height: GENERAL_ANNOUNCEMENT_TICKER_HEIGHT_PX }}
      className="w-full overflow-hidden bg-primary-container/15 border-b border-primary/20 flex items-center"
    >
      <div className="flex whitespace-nowrap will-change-transform animate-ticker motion-reduce:animate-none motion-reduce:pl-4">
        <span dir="auto" className="font-urdu font-medium text-[13px] text-on-surface px-6">
          {text}
        </span>
        <span dir="auto" className="font-urdu font-medium text-[13px] text-on-surface px-6" aria-hidden>
          {text}
        </span>
      </div>
    </div>
  );
}
