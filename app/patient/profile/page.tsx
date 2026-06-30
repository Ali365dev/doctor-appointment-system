import ProfileForm from "@/components/patient/ProfileForm";

export const metadata = { title: "Profile | CarePlus Patient Portal" };

export default function ProfilePage() {
  return (
    <div className="max-w-[1280px] mx-auto px-gutter py-xl">
      <div className="mb-lg">
        <h2 className="text-headline-lg font-bold text-on-surface">My Profile</h2>
        <p className="text-body-md text-on-surface-variant mt-xs">
          Update your personal information and medical details.
        </p>
      </div>
      <ProfileForm />
    </div>
  );
}
