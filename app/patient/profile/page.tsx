import ProfileForm from "@/components/patient/ProfileForm";
import { getSession } from "@/lib/auth/getSession";
import { findUserById } from "@/services/mongodb/repositories/user.repository";

export const metadata = { title: "Profile | CarePlus Patient Portal" };

export default async function ProfilePage() {
  const session = await getSession();
  const user = session ? await findUserById(session.userId) : null;

  return (
    <div className="max-w-[1280px] mx-auto px-gutter py-xl">
      <div className="mb-lg">
        <h2 className="text-headline-lg font-bold text-on-surface">My Profile</h2>
        <p className="text-body-md text-on-surface-variant mt-xs">
          Update your personal information and medical details.
        </p>
      </div>
      <ProfileForm
        initialUser={{
          name: user?.name ?? "",
          email: user?.email ?? "",
          phone: user?.phone ?? "",
          gender: user?.gender ?? "Male",
          dob: user?.dob ? new Date(user.dob).toISOString().slice(0, 10) : "",
          avatar: user?.avatar ?? "",
          bloodType: user?.bloodType ?? "",
          address: user?.address ?? "",
          city: user?.city ?? "",
          country: user?.country ?? "",
          emergencyContactName: user?.emergencyContactName ?? "",
          emergencyContactPhone: user?.emergencyContactPhone ?? "",
          allergies: user?.allergies ?? "",
          medications: user?.medications ?? "",
        }}
      />
    </div>
  );
}
