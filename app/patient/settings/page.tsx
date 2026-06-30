import SettingsContent from "@/components/patient/SettingsContent";

export const metadata = { title: "Settings | CarePlus Patient Portal" };

export default function PatientSettingsPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-gutter py-xl">
      <div className="mb-lg">
        <h2 className="text-headline-lg font-bold text-on-surface">Account Settings</h2>
        <p className="text-body-md text-on-surface-variant">
          Manage your account preferences, security, and notification settings.
        </p>
      </div>
      <SettingsContent />
    </div>
  );
}
