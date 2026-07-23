"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

interface TopBarProps {
  user: { name: string; avatar?: string };
  onMenuClick?: () => void;
}

interface PatientResult {
  id: string;
  name: string;
  phone: string;
}

interface AppointmentResult {
  id: string;
  appointmentNumber: string;
  patientName: string;
  phone: string;
  date: string;
  time: string;
}

export default function TopBar({ user, onMenuClick }: TopBarProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [patientResults, setPatientResults] = useState<PatientResult[]>([]);
  const [appointmentResults, setAppointmentResults] = useState<AppointmentResult[]>([]);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const term = search.trim().toLowerCase();
    if (term.length < 2) {
      setPatientResults([]);
      setAppointmentResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [pRes, aRes] = await Promise.all([fetch("/api/patients"), fetch("/api/appointments")]);
        const [pData, aData] = await Promise.all([pRes.json(), aRes.json()]);

        if (pRes.ok) {
          const patients = (pData.patients ?? []) as { id: string; name: string; phone: string }[];
          setPatientResults(
            patients
              .filter((p) => p.name.toLowerCase().includes(term) || p.phone.includes(term))
              .slice(0, 5)
              .map((p) => ({ id: p.id, name: p.name, phone: p.phone }))
          );
        }

        if (aRes.ok) {
          const appointments = (aData.appointments ?? []) as {
            _id: string;
            appointmentNumber: string;
            patientSnapshot: { fullName: string; phone?: string };
            date: string;
            time: string;
          }[];
          setAppointmentResults(
            appointments
              .filter(
                (a) =>
                  a.appointmentNumber.toLowerCase().includes(term) ||
                  a.patientSnapshot.fullName.toLowerCase().includes(term) ||
                  (a.patientSnapshot.phone ?? "").toLowerCase().includes(term)
              )
              .slice(0, 5)
              .map((a) => ({
                id: a._id,
                appointmentNumber: a.appointmentNumber,
                patientName: a.patientSnapshot.fullName,
                phone: a.patientSnapshot.phone ?? "",
                date: a.date,
                time: a.time,
              }))
          );
        }
      } catch {
        // Silent — search box degrades to "no results" on network failure.
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const hasQuery = search.trim().length >= 2;
  const hasResults = patientResults.length > 0 || appointmentResults.length > 0;

  function handleBlur() {
    // Delay closing so a click on a result registers before the dropdown unmounts.
    blurTimeout.current = setTimeout(() => setOpen(false), 150);
  }
  function handleFocus() {
    if (blurTimeout.current) clearTimeout(blurTimeout.current);
    setOpen(true);
  }
  function closeNow() {
    if (blurTimeout.current) clearTimeout(blurTimeout.current);
    setOpen(false);
  }

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 z-30 bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 px-gutter py-sm flex items-center justify-between gap-md">
      <div className="flex items-center gap-sm flex-1 min-w-0">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-xs rounded-lg hover:bg-surface-container-high transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-[22px]">menu</span>
        </button>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Search appointments or patients..."
            className="w-full pl-10 pr-sm py-xs bg-surface-container-low border border-outline-variant/50 rounded-lg text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />

          {open && hasQuery && (
            <div className="absolute top-full left-0 right-0 mt-xs bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg overflow-hidden z-40 max-h-96 overflow-y-auto">
              {loading ? (
                <p className="px-md py-sm text-body-md text-on-surface-variant">Searching…</p>
              ) : !hasResults ? (
                <p className="px-md py-sm text-body-md text-on-surface-variant">No matches for &ldquo;{search}&rdquo;.</p>
              ) : (
                <>
                  {patientResults.length > 0 && (
                    <div>
                      <p className="px-md pt-sm pb-xs text-caption font-bold text-on-surface-variant uppercase tracking-wider">Patients</p>
                      {patientResults.map((p) => (
                        <Link
                          key={p.id}
                          href={`/admin/patients/${p.id}`}
                          onClick={closeNow}
                          className="flex items-center gap-sm px-md py-xs hover:bg-surface-container-high transition-colors"
                        >
                          <span className="material-symbols-outlined text-primary text-[18px]">person</span>
                          <span className="text-body-md text-on-surface">{p.name}</span>
                          <span className="text-caption text-on-surface-variant ml-auto">{p.phone}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  {appointmentResults.length > 0 && (
                    <div>
                      <p className="px-md pt-sm pb-xs text-caption font-bold text-on-surface-variant uppercase tracking-wider">Appointments</p>
                      {appointmentResults.map((a) => (
                        <Link
                          key={a.id}
                          href={`/admin/appointments/verify/${a.id}`}
                          onClick={closeNow}
                          className="flex items-center gap-sm px-md py-xs hover:bg-surface-container-high transition-colors"
                        >
                          <span className="material-symbols-outlined text-primary text-[18px]">event</span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-body-md text-on-surface">{a.patientName}</span>
                            {a.phone && <span className="text-caption text-on-surface-variant">{a.phone}</span>}
                          </div>
                          <span className="text-caption text-on-surface-variant ml-auto shrink-0">{a.appointmentNumber} · {a.date}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-md">
        {/* Settings */}
        <Link href="/admin/settings" className="p-xs rounded-lg hover:bg-surface-container-high transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant text-[22px]">settings</span>
        </Link>

        {/* Divider */}
        <div className="h-6 w-px bg-outline-variant/50" />

        {/* Identity */}
        <div className="flex items-center gap-xs">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-highest shrink-0 flex items-center justify-center">
            {user.avatar ? (
              <Image src={user.avatar} alt={user.name} width={32} height={32} className="w-full h-full object-cover" unoptimized />
            ) : (
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">person</span>
            )}
          </div>
          <span className="hidden sm:block text-label-md font-semibold text-on-surface">{user.name}</span>
        </div>
      </div>
    </header>
  );
}
