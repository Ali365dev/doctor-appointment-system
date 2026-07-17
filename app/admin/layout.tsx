import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../(public)/globals.css";
import AdminShell from "@/components/admin/AdminShell";
import { requireRole } from "@/lib/auth/requireRole";
import { findUserById } from "@/services/mongodb/repositories/user.repository";
import { DoctorProfileProvider } from "@/lib/context/DoctorProfileContext";
import { getCmsProfile } from "@/services/mongodb/repositories/cms.repository";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Admin Dashboard | MedClinical",
  description: "Doctor administration and appointment management portal.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("doctor");
  const doctorUser = await findUserById(session.userId);
  const user = doctorUser
    ? { name: doctorUser.name, avatar: doctorUser.avatar ?? undefined }
    : { name: "Doctor", avatar: undefined };
  const profile = await getCmsProfile();

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-surface text-on-surface overflow-x-hidden">
        <DoctorProfileProvider profile={profile}>
          <AdminShell user={user}>{children}</AdminShell>
        </DoctorProfileProvider>
        <ToastContainer position="bottom-right" autoClose={4000} theme="colored" />
      </body>
    </html>
  );
}
