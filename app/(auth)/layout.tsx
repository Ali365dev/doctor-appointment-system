import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../(public)/globals.css";
import { getCmsProfile } from "@/services/mongodb/repositories/cms.repository";
import { DoctorProfileProvider } from "@/lib/context/DoctorProfileContext";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const doctor = await getCmsProfile();
  return {
    title: `Login | ${doctor.name}`,
    description: "Securely access your medical portal.",
  };
}

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCmsProfile();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.className} min-h-screen bg-background text-on-background selection:bg-primary-container selection:text-on-primary-container overflow-x-hidden`}
      >
        <DoctorProfileProvider profile={profile}>{children}</DoctorProfileProvider>
      </body>
    </html>
  );
}
