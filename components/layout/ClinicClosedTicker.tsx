"use client";

import { useClinicClosedToday } from "@/lib/hooks/useClinicClosedToday";

/**
 * Marquee notice shown only on the booking-appointment pages, warning that
 * the currently selected clinic (from the booking store) is closed today per
 * its weekly schedule. Rendered inline in the normal page flow (not fixed),
 * so no spacer is needed — it just pushes the rest of the page content down
 * like any other block.
 */
export default function ClinicClosedTicker() {
  const { isClosedToday, clinicName, messageEn, messageUr } = useClinicClosedToday();

  if (!isClosedToday) return null;

  const text = `⚠️ ${clinicName ? `${clinicName} — ` : ""}${messageUr}    •    ${messageEn}`;

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full overflow-hidden bg-amber-50 border border-amber-200 rounded-xl py-3 mb-8 flex items-center"
    >
      <div className="flex whitespace-nowrap will-change-transform animate-ticker motion-reduce:animate-none motion-reduce:pl-4">
        <span dir="auto" className="font-urdu font-semibold text-[14px] text-amber-800 px-6">
          {text}
        </span>
        <span dir="auto" className="font-urdu font-semibold text-[14px] text-amber-800 px-6" aria-hidden>
          {text}
        </span>
      </div>
    </div>
  );
}
