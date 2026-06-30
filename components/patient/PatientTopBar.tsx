"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function PatientTopBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 backdrop-blur-[12px] bg-surface/70 border-b border-outline-variant/30 px-gutter py-4 flex items-center justify-between">
        <div className="flex items-center gap-md">
          <button
            className="md:hidden text-primary"
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h2 className="hidden sm:block text-label-md text-on-surface-variant uppercase tracking-widest">
            Clinical Dashboard
          </h2>
        </div>

        <div className="flex items-center gap-md">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-label-md font-bold text-on-surface">James Patterson</span>
            <span className="text-caption text-on-surface-variant">Patient ID: #SP-8821</span>
          </div>
          <Link href="/patient/profile">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/30 cursor-pointer">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYCJysrc3XroQtiaWH68dl0l0m1kqyd-lpNHcCi-6nj-BeBK2z5ULlDaoCU4g72NIAB2B-AkzxCaqKFKzVz4FY5DS1q11_wxCKqq06ahuL2Pw2vRkkMSfFpcXWx9An7gQCV1nwlMQCd5NpcYCUYQNOwuSAmTNNgDYCKmHYJqPte0PTVa3KVcxd7yPWIgD07DWhfQpAuSHYC0q9pUZJsevvIlUl5TtIeU5hb1lBWZmU9gEqaE_LZec_ddfHe5VVex5gEjuwx8hchHc"
                alt="Patient Avatar"
                width={40}
                height={40}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
          </Link>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <aside
            className="absolute left-0 top-0 h-full w-64 bg-surface py-md px-sm flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-lg px-xs flex items-center justify-between">
              <div>
                <h1 className="text-headline-md font-bold text-primary">CarePlus</h1>
                <p className="text-label-md text-on-surface-variant/70 uppercase tracking-widest mt-1">Patient Portal</p>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-on-surface-variant">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <nav className="flex-1 space-y-1">
              {[
                { label: "Dashboard", icon: "dashboard", href: "/patient/dashboard" },
                { label: "Appointments", icon: "calendar_today", href: "/patient/appointments" },
                { label: "Profile", icon: "person", href: "/patient/profile" },
                { label: "Settings", icon: "settings", href: "/patient/settings" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-sm px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="text-label-md">{item.label}</span>
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
