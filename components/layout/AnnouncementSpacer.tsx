"use client";

import { useClinicClosedToday } from "@/lib/hooks/useClinicClosedToday";
import { CLINIC_CLOSED_TICKER_HEIGHT_PX } from "./ClinicClosedTicker";

/**
 * Reserves extra top-of-page flow space equal to the header ticker's height,
 * on top of whatever fixed clearance each page's own <main> already uses for
 * the normal header. Kept in sync with the ticker purely by reading the same
 * `useClinicClosedToday` state — no prop plumbing between the two needed.
 */
export default function AnnouncementSpacer() {
  const { isClosedToday } = useClinicClosedToday();
  return <div style={{ height: isClosedToday ? CLINIC_CLOSED_TICKER_HEIGHT_PX : 0 }} aria-hidden />;
}
