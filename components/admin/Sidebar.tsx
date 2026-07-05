"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { doctor } from "@/lib/data";
import LogoutButton from "@/components/auth/LogoutButton";

const navItems = [
  { label: "Dashboard", icon: "dashboard", href: "/admin/dashboard" },
  { label: "Appointments", icon: "calendar_today", href: "/admin/appointments" },
  { label: "Patients", icon: "group", href: "/admin/patients" },
  { label: "Payments", icon: "payments", href: "/admin/payments" },
  { label: "Messages", icon: "mail", href: "/admin/messages" },
  { label: "Website CMS", icon: "web", href: "/admin/cms" },
  { label: "Settings", icon: "settings", href: "/admin/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 bg-surface border-r border-outline-variant/30 py-md px-sm fixed left-0 top-0 z-40">
      {/* Brand */}
      <div className="flex items-center px-xs mb-lg">
        <img src="/dr_zaid_gul_logo_navbar.svg" alt="Dr. Zaid Gul" className="h-12 w-auto" />
      </div>

      {/* Doctor profile */}
      <div className="flex items-center gap-xs px-xs mb-md pb-md border-b border-outline-variant/30">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-highest shrink-0">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVFroceKentGX_zGpM9-kSeItLNGte67uw7a_iy8AVgJDxpncKJUShPW32MHwO_26oqWMbaNOmY8nH8hoWCZ5Fs334tjg1igym1in0KeISACyl951Fp6OZIwn92MQHIraVdZxDVy-MCoT2x3oNF0r7hc7AVu-u4A8cDDIqy2B2QZBA47CbRv9sRwGCLpVvJNyDUbf4Q7vJE7RDOpDOoZ7c6YN0Z_5w_m1CRS94Lhj2Mpd3nu-sQTE0yCzUsrIyXW13fiWdxe5MI-4"
            alt={doctor.name}
            width={40}
            height={40}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-label-md font-semibold text-on-surface truncate">{doctor.name}</span>
          <span className="text-caption text-on-surface-variant opacity-70">Clinical Director</span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-xs">
        {navItems.map(({ label, icon, href }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-sm px-sm py-xs rounded-lg transition-colors text-label-md font-semibold ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* New Appointment CTA */}
      <div className="mt-auto border-t border-outline-variant/30 pt-md px-xs space-y-1">
        <Link
          href="/book-appointment/step-1"
          className="w-full bg-primary-container text-on-primary-container text-label-md font-semibold py-xs rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-xs"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Appointment
        </Link>
        <LogoutButton className="w-full flex items-center gap-sm px-sm py-xs rounded-lg text-error hover:bg-error-container/20 transition-colors" />
      </div>
    </aside>
  );
}
