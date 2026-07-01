import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../(public)/globals.css";
import PatientSidebar from "@/components/patient/PatientSidebar";
import PatientTopBar from "@/components/patient/PatientTopBar";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Patient Portal | CarePlus",
  description: "Manage your appointments and health records.",
};

export default function PatientLayout({ children }: { children: React.ReactNode }) {
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
        <div className="flex min-h-screen">
          <PatientSidebar />
          <main className="flex-1 md:ml-64 min-w-0 flex flex-col">
            <PatientTopBar />
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
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t border-outline-variant/20 z-50 flex justify-around items-center py-sm">
          <a href="/patient/dashboard" className="flex flex-col items-center text-primary">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-caption">Home</span>
          </a>
          <a href="/patient/appointments" className="flex flex-col items-center text-on-surface-variant">
            <span className="material-symbols-outlined">calendar_month</span>
            <span className="text-caption">Appts</span>
          </a>
          <a href="/book-appointment" className="bg-primary text-on-primary w-12 h-12 rounded-full flex items-center justify-center -mt-8 shadow-lg border-4 border-surface">
            <span className="material-symbols-outlined">add</span>
          </a>
          <a href="/patient/profile" className="flex flex-col items-center text-on-surface-variant">
            <span className="material-symbols-outlined">person</span>
            <span className="text-caption">Profile</span>
          </a>
          <a href="/patient/settings" className="flex flex-col items-center text-on-surface-variant">
            <span className="material-symbols-outlined">settings</span>
            <span className="text-caption">Settings</span>
          </a>
        </nav>
      </body>
    </html>
  );
}
