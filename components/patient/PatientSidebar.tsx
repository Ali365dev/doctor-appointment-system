"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", icon: "dashboard", href: "/patient/dashboard" },
  { label: "Appointments", icon: "calendar_today", href: "/patient/appointments" },
  { label: "Profile", icon: "person", href: "/patient/profile" },
  { label: "Settings", icon: "settings", href: "/patient/settings" },
];

export default function PatientSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 py-md px-sm border-r border-outline-variant/30 bg-surface z-40">
      <div className="mb-lg px-xs">
        <img src="/dr_zaid_gul_logo_navbar.svg" alt="Dr. Zaid Gul" className="h-14 w-auto" />
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-sm px-md py-sm rounded-lg transition-all active:scale-95 group ${
                isActive
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-label-md">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-outline-variant/30 pt-md px-xs space-y-1">
        <Link
          href="#"
          className="flex items-center gap-sm px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors group"
        >
          <span className="material-symbols-outlined">help</span>
          <span className="text-label-md">Help &amp; Support</span>
        </Link>
        <Link
          href="/login"
          className="flex items-center gap-sm px-md py-sm rounded-lg text-error hover:bg-error-container/20 transition-colors group"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-label-md">Logout</span>
        </Link>
      </div>
    </aside>
  );
}
