import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PublicWhatsAppButton from "@/components/layout/PublicWhatsAppButton";
import { DoctorProfileProvider } from "@/lib/context/DoctorProfileContext";
import { getCmsProfile } from "@/services/mongodb/repositories/cms.repository";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

export async function generateMetadata(): Promise<Metadata> {
  const doctor = await getCmsProfile();
  return {
    title: `${doctor.name} | Consultant Gastroenterologist`,
    description: `Leading Consultant Gastroenterologist and Hepatologist with over ${doctor.experienceYears}+ years of clinical excellence.`,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getCmsProfile();

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <DoctorProfileProvider profile={profile}>
          <Header />
          {children}
          <Footer />
          <PublicWhatsAppButton />
        </DoctorProfileProvider>
        <ToastContainer position="bottom-right" autoClose={4000} theme="colored" />
      </body>
    </html>
  );
}
