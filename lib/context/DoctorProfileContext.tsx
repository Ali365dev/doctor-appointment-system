"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { CmsProfile } from "@/services/mongodb/repositories/cms.repository";

const DoctorProfileContext = createContext<
  [CmsProfile, (profile: CmsProfile) => void] | null
>(null);

export function DoctorProfileProvider({
  profile,
  children,
}: {
  profile: CmsProfile;
  children: ReactNode;
}) {
  const state = useState<CmsProfile>(profile);
  return (
    <DoctorProfileContext.Provider value={state}>
      {children}
    </DoctorProfileContext.Provider>
  );
}

/** Returns the current site-wide doctor/CMS profile, kept in sync with admin edits. */
export function useDoctorProfile(): CmsProfile {
  const ctx = useContext(DoctorProfileContext);
  if (!ctx) throw new Error("useDoctorProfile must be used within a DoctorProfileProvider");
  return ctx[0];
}

/** Lets the CMS admin page push a freshly-saved profile to every mounted consumer. */
export function useSetDoctorProfile(): (profile: CmsProfile) => void {
  const ctx = useContext(DoctorProfileContext);
  if (!ctx) throw new Error("useSetDoctorProfile must be used within a DoctorProfileProvider");
  return ctx[1];
}
