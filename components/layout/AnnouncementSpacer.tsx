"use client";

import { useDoctorProfile } from "@/lib/context/DoctorProfileContext";
import { GENERAL_ANNOUNCEMENT_TICKER_HEIGHT_PX } from "./GeneralAnnouncementTicker";

/**
 * Reserves extra top-of-page flow space equal to the header's general-ticker
 * height, on top of whatever fixed clearance each page's own <main> already
 * uses for the normal header. Kept in sync with the ticker purely by reading
 * the same CMS fields — no prop plumbing between the two needed.
 */
export default function AnnouncementSpacer() {
  const doctor = useDoctorProfile();
  const hasMessage = !!(doctor.generalAnnouncementMessageEn?.trim() || doctor.generalAnnouncementMessageUr?.trim());
  return <div style={{ height: hasMessage ? GENERAL_ANNOUNCEMENT_TICKER_HEIGHT_PX : 0 }} aria-hidden />;
}
