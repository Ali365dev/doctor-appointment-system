import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/common/SmoothScroll";
import ScrollProgressBar from "@/components/common/ScrollProgressBar";
import { doctor } from "@/lib/data";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: `${doctor.name} | Consultant Gastroenterologist`,
  description: `Leading Consultant Gastroenterologist and Hepatologist with over ${doctor.experience_years}+ years of clinical excellence.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased scroll-smooth`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SmoothScroll />
        <ScrollProgressBar />
        <Header />
        {children}
        <Footer />
        <ToastContainer position="bottom-right" autoClose={4000} theme="colored" />
      </body>
    </html>
  );
}
