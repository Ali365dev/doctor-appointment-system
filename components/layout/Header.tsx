"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";
import { useDoctorProfile } from "@/lib/context/DoctorProfileContext";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/appointment", label: "Appointment" },
  { href: "/clinic", label: "Clinic" },
  { href: "/services", label: "Services" },

];

interface CurrentUser {
  name: string | null;
  avatar: string | null;
  role: "doctor" | "patient";
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const { name, logoUrl } = useDoctorProfile();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (!cancelled && res.ok) setUser(data.user);
      } catch {
        // Not logged in / network error — header just shows the Login link.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const dashboardHref = user?.role === "doctor" ? "/admin/dashboard" : "/patient/dashboard";

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="fixed top-0 left-0 w-full z-1030 bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm">
      <div className="max-w-[1280px] mx-auto flex justify-between items-center px-gutter py-4">
        <Link href="/" className="flex items-center">
          <img src={logoUrl || "/dr_zaid_gul_logo_navbar.svg"} alt={name} className="h-12 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-lg">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className={`text-label-md font-semibold tracking-wide transition-colors ${
                isActive(href) ? "text-primary" : "text-on-surface-variant hover:text-primary"
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/book-appointment/step-1"
            className="bg-primary text-on-primary px-sm py-xs rounded-lg text-label-md font-semibold hover:opacity-90 transition-all"
          >
            Book Now
          </Link>
          {user ? (
            <div className="flex items-center gap-sm">
              <Link
                href={dashboardHref}
                className="flex items-center gap-xs text-label-md font-semibold text-on-surface-variant hover:text-primary transition-colors"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center shrink-0">
                  {user.avatar ? (
                    <Image src={user.avatar} alt={user.name ?? "Account"} width={32} height={32} className="w-full h-full object-cover" unoptimized />
                  ) : (
                    <span className="material-symbols-outlined text-on-surface-variant text-[18px]">person</span>
                  )}
                </div>
                <span>{user.name ?? "My Account"}</span>
              </Link>
              {/* <LogoutButton className="flex items-center gap-xs text-label-md font-semibold text-on-surface-variant hover:text-error transition-colors" /> */}
            </div>
          ) : (
            <Link
              href="/login"
              className="border border-outline-variant text-on-surface-variant px-sm py-xs rounded-lg text-label-md font-semibold hover:border-primary hover:text-primary transition-all"
            >
              Login
            </Link>
          )}
        </nav>

        <button
          className="md:hidden text-on-surface-variant"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined">{menuOpen ? "close" : "menu"}</span>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-surface border-t border-outline-variant/30 px-gutter py-4 flex flex-col gap-4">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className={`text-label-md font-semibold transition-colors ${
                isActive(href) ? "text-primary" : "text-on-surface-variant hover:text-primary"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/book-appointment/step-1"
            className="bg-primary text-on-primary px-sm py-xs rounded-lg text-label-md font-semibold text-center hover:opacity-90 transition-all"
            onClick={() => setMenuOpen(false)}
          >
            Book Now
          </Link>
          {user ? (
            <>
              <Link
                href={dashboardHref}
                className="flex items-center justify-center gap-xs text-label-md font-semibold text-on-surface-variant hover:text-primary transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center shrink-0">
                  {user.avatar ? (
                    <Image src={user.avatar} alt={user.name ?? "Account"} width={32} height={32} className="w-full h-full object-cover" unoptimized />
                  ) : (
                    <span className="material-symbols-outlined text-on-surface-variant text-[18px]">person</span>
                  )}
                </div>
                <span>{user.name ?? "My Account"}</span>
              </Link>
              <LogoutButton className="flex items-center justify-center gap-xs text-label-md font-semibold text-on-surface-variant hover:text-error transition-colors" />
            </>
          ) : (
            <Link
              href="/login"
              className="border border-outline-variant text-on-surface-variant px-sm py-xs rounded-lg text-label-md font-semibold text-center hover:border-primary hover:text-primary transition-all"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
