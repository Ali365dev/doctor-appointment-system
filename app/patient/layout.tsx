import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../(public)/globals.css";
import PatientSidebar from "@/components/patient/PatientSidebar";
import PatientTopBar from "@/components/patient/PatientTopBar";
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
  title: "Patient Portal | CarePlus",
  description: "Manage your appointments and health records.",
};

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("patient");
  const user = await findUserById(session.userId);
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
      <body className="min-h-full bg-background text-on-background">
        <DoctorProfileProvider profile={profile}>
        <div className="flex min-h-screen">
          <PatientSidebar />
          <main className="flex-1 md:ml-64 min-w-0 flex flex-col">
            <PatientTopBar
              user={
                user
                  ? { name: user.name, phone: user.phone ?? undefined, avatar: user.avatar ?? undefined }
                  : { name: "Patient", phone: undefined }
              }
            />
            <div className="flex-1 pb-16 md:pb-0">
              {children}
            </div>
            {/* Footer */}
            <footer className="w-full py-lg px-gutter flex flex-col items-center gap-md border-t border-outline-variant/30 bg-surface-container-low">
              <div className="flex flex-col items-center gap-sm">
                <img src="/dr_zaid_gul_logo.svg" alt="Dr. Zaid Gul" className="h-12 w-auto" />
                <p className="text-caption text-on-surface-variant">© 2024 Dr. Zaid Gul Specialist Portal. All rights reserved.</p>
              </div>
              <div className="flex gap-lg">
                <a href="#" className="text-body-md text-on-surface-variant hover:text-secondary transition-colors">Privacy Policy</a>
                <a href="#" className="text-body-md text-on-surface-variant hover:text-secondary transition-colors">Terms of Service</a>
                <a href="#" className="text-body-md text-on-surface-variant hover:text-secondary transition-colors">Contact Support</a>
              </div>
            </footer>
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t border-outline-variant/20 z-50 flex justify-around items-center py-sm px-1">
          <a href="/patient/dashboard" className="flex flex-col items-center text-primary min-w-0">
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            <span className="text-[10px]">Home</span>
          </a>
          <a href="/patient/appointments" className="flex flex-col items-center text-on-surface-variant min-w-0">
            <span className="material-symbols-outlined text-[20px]">calendar_month</span>
            <span className="text-[10px]">Appts</span>
          </a>
          <a href="/patient/procedures" className="flex flex-col items-center text-on-surface-variant min-w-0">
            <span className="material-symbols-outlined text-[20px]">medical_services</span>
            <span className="text-[10px]">Procedures</span>
          </a>
          <a href="/patient/medical-records" className="flex flex-col items-center text-on-surface-variant min-w-0">
            <span className="material-symbols-outlined text-[20px]">folder_shared</span>
            <span className="text-[10px]">Records</span>
          </a>
          <a href="/patient/profile" className="flex flex-col items-center text-on-surface-variant min-w-0">
            <span className="material-symbols-outlined text-[20px]">person</span>
            <span className="text-[10px]">Profile</span>
          </a>
        </nav>
        </DoctorProfileProvider>

        <ToastContainer position="bottom-right" autoClose={4000} theme="colored" />
      </body>
    </html>
  );
}
