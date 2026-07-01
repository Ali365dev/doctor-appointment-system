"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-1030 bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm">
      <div className="max-w-[1280px] mx-auto flex justify-between items-center px-gutter py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img src="/dr_zaid_gul_logo_navbar.svg" alt="Dr. Zaid Gul" className="h-12 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-lg">
          <Link
            href="#about"
            className="text-on-surface-variant text-label-md font-semibold tracking-wide hover:text-primary transition-colors"
          >
            About
          </Link>
          <Link
            href="#services"
            className="text-on-surface-variant text-label-md font-semibold tracking-wide hover:text-primary transition-colors"
          >
            Services
          </Link>
          <Link
            href="#clinic-info"
            className="text-on-surface-variant text-label-md font-semibold tracking-wide hover:text-primary transition-colors"
          >
            Clinic Info
          </Link>
          <Link
            href="/login"
            className="bg-primary text-on-primary px-sm py-xs rounded-lg text-label-md font-semibold hover:opacity-90 transition-all"
          >
            Login
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-on-surface-variant"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined">{menuOpen ? "close" : "menu"}</span>
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-surface border-t border-outline-variant/30 px-gutter py-4 flex flex-col gap-4">
          {[
            { href: "#about", label: "About" },
            { href: "#services", label: "Services" },
            { href: "#clinic-info", label: "Clinic Info" },
          ].map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className="text-on-surface-variant text-label-md font-semibold hover:text-primary transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/login"
            className="bg-primary text-on-primary px-sm py-xs rounded-lg text-label-md font-semibold text-center hover:opacity-90 transition-all"
            onClick={() => setMenuOpen(false)}
          >
            Login
          </Link>
        </div>
      )}
    </header>
  );
}
