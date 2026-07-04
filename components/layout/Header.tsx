"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/appointment", label: "Appointment" },
  { href: "/clinic", label: "Clinic" },
  { href: "/services", label: "Services" },

];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="fixed top-0 left-0 w-full z-1030 bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm">
      <div className="max-w-[1280px] mx-auto flex justify-between items-center px-gutter py-4">
        <Link href="/" className="flex items-center">
          <img src="/dr_zaid_gul_logo_navbar.svg" alt="Dr. Zaid Gul" className="h-12 w-auto" />
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
          <Link
            href="/login"
            className="border border-outline-variant text-on-surface-variant px-sm py-xs rounded-lg text-label-md font-semibold hover:border-primary hover:text-primary transition-all"
          >
            Login
          </Link>
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
          <Link
            href="/login"
            className="border border-outline-variant text-on-surface-variant px-sm py-xs rounded-lg text-label-md font-semibold text-center hover:border-primary hover:text-primary transition-all"
            onClick={() => setMenuOpen(false)}
          >
            Login
          </Link>
        </div>
      )}
    </header>
  );
}
