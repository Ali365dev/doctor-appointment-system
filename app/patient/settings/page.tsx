import { redirect } from "next/navigation";

// Settings page is disabled for now (mostly non-functional mock UI) —
// redirect away so direct URL access doesn't reach it either.
export default function PatientSettingsPage() {
  redirect("/patient/dashboard");
}
