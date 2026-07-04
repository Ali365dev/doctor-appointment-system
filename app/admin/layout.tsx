import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../(public)/globals.css";
import Sidebar from "@/components/admin/Sidebar";
import TopBar from "@/components/admin/TopBar";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Admin Dashboard | MedClinical",
  description: "Doctor administration and appointment management portal.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <div className="flex min-h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 md:ml-64 min-w-0 flex flex-col">
            <TopBar />
            <div className="pt-[72px] flex-1">
              {children}
            </div>
          </main>
        </div>
        <ToastContainer position="bottom-right" autoClose={4000} theme="colored" />
      </body>
    </html>
  );
}
