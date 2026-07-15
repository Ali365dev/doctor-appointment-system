import { Suspense } from "react";
import MedicalRecordsContent from "@/components/admin/MedicalRecordsContent";

export const metadata = {
  title: "Medical Records | Admin",
};

export default function AdminMedicalRecordsPage() {
  return (
    <Suspense>
      <MedicalRecordsContent />
    </Suspense>
  );
}
