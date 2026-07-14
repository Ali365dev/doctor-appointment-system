# Doctor-side Medical Records Review

Uses the same design tokens as the rest of the admin dashboard (see `desgin/doctor/clinical_precision/DESIGN.md`). Reuses the real `Sidebar` and `TopBar` components exactly as they exist in `components/admin/` — only the main content area and the detail slide-over are new.

## Purpose

Gives Dr. Zaid Gul a place to see every patient-submitted medical record (previously patient-only, see `/patient/medical-records`), reply to the patient, and log a structured clinical review — the missing half of the feature already built on the patient side.

## Layout

- **List page** (`/admin/medical-records`): stat cards (Pending/Reviewing/Replied/Closed counts) → status filter pills (matches the pattern already used in `AppointmentsContent.tsx`) → a table (Patient, Report title, Category, File count, Submitted date, Status badge, Actions), reusing the exact badge/table styling already established in `components/admin/AppointmentsContent.tsx` and `components/admin/ProceduresContent.tsx`. Each row's Actions column has two buttons: a **message icon** (jumps straight into the detail slide-over scrolled to the conversation/reply composer, for a quick reply without reading the full report first) and **Review**/**View** (opens the slide-over at the top). This mirrors the patient side's existing View + Discuss pattern (`ReportCard.tsx`).
- **Detail slide-over** (opens from the "Review"/"View" row action, does not navigate away from the list): patient identity header, a status dropdown (mirrors the existing `ReportStatus` enum: pending / reviewing / replied / closed), the patient's original notes, the uploaded files grid, the full conversation thread (reusing the same bubble layout as the patient-side `ChatBubble.tsx`, just doctor-authored messages now right-aligned instead of patient), a "Doctor Review & Recommendations" form (summary, a growable list of recommendations, a growable list of medicine changes — maps directly onto the existing `DoctorReview` schema/interface already defined in `components/patient/reports/data.ts` and `services/mongodb/models/MedicalRecord.ts`), and a reply composer pinned to the bottom.

## Data model reuse

No new schema needed — every field shown here already exists on the `MedicalRecord` Mongoose model built for the patient side (`status`, `conversation[]`, `doctorReview`). This design only adds the doctor-facing surface to read/write those same fields; `conversation` messages sent from here get `sender: "doctor"`.
