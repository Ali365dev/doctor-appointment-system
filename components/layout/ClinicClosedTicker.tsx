"use client";

import { useClinicClosedToday } from "@/lib/hooks/useClinicClosedToday";

export const CLINIC_CLOSED_TICKER_HEIGHT_PX = 40;

/**
 * Site-wide marquee notice, rendered as the first row inside the fixed
 * header, warning that the user's selected clinic (from the booking flow) is
 * closed today. `AnnouncementSpacer` reserves the matching amount of page
 * flow space so this never overlaps page content — the two stay in sync
 * because both read the same `useClinicClosedToday` state independently.
 */
export default function ClinicClosedTicker() {
  const { isClosedToday, clinicName, messageEn, messageUr } = useClinicClosedToday();

  if (!isClosedToday) return null;

  const text = `⚠️ ${clinicName ? `${clinicName} — ` : ""}${messageUr}    •    ${messageEn}`;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{ height: CLINIC_CLOSED_TICKER_HEIGHT_PX }}
      className="w-full overflow-hidden bg-amber-400 border-b border-amber-500/60 flex items-center"
    >
      <div className="flex whitespace-nowrap will-change-transform animate-ticker motion-reduce:animate-none motion-reduce:pl-4">
        <span dir="auto" className="font-urdu font-semibold text-[14px] text-amber-950 px-6">
          {text}
        </span>
        <span dir="auto" className="font-urdu font-semibold text-[14px] text-amber-950 px-6" aria-hidden>
          {text}
        </span>
      </div>
    </div>
  );
}
