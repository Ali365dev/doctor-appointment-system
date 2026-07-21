"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import type { WeeklySchedule } from "@/types/clinic";

interface Clinic {
  _id: string;
  name: string;
  address?: string;
  city: string;
  feePkr: number;
  isActive: boolean;
  image?: string;
  schedule?: WeeklySchedule;
  defaultSlotDurationMinutes: number;
}

export default function ClinicsListContent() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [scheduleClinic, setScheduleClinic] = useState<Clinic | null>(null);
  const [deleteClinicTarget, setDeleteClinicTarget] = useState<Clinic | null>(null);

  const loadClinics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clinics");
      const data = await res.json();
      if (res.ok) setClinics(data.clinics ?? []);
      else toast.error(data.error ?? "Could not load clinics");
    } catch {
      toast.error("Network error loading clinics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClinics();
  }, []);

  const toggleActive = async (clinic: Clinic) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/clinics/${clinic._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !clinic.isActive }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not update clinic");
        return;
      }
      setClinics((prev) =>
        prev.map((c) => (c._id === clinic._id ? { ...c, isActive: !c.isActive } : c))
      );
      toast.success(clinic.isActive ? "Clinic disabled" : "Clinic enabled");
    } catch {
      toast.error("Network error");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteClinicTarget) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/clinics/${deleteClinicTarget._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not delete clinic");
        return;
      }
      toast.success("Clinic deleted");
      setClinics((prev) => prev.filter((c) => c._id !== deleteClinicTarget._id));
      setDeleteClinicTarget(null);
    } catch {
      toast.error("Network error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-gutter py-lg max-w-[1280px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-xl">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">Clinic Management</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">
            {clinics.length} total · manage locations, schedules, and appointment slots
          </p>
        </div>
        <Link
          href="/admin/clinics/new"
          className="flex items-center gap-xs px-md py-xs rounded-xl bg-primary text-on-primary font-semibold hover:shadow-lg transition-all"
        >
          <span className="material-symbols-outlined">add</span> Add Clinic
        </Link>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-150">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-1">
              <tr className="border-b border-outline-variant/30 bg-surface-container-low">
                {["Image", "Clinic Name", "Address", "Consultation Fee", "Status", "Actions"].map((h, i, arr) => (
                  <th key={h} className={`px-md py-xs text-label-md text-on-surface-variant ${i === arr.length - 1 ? "text-right" : ""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-md py-xl text-center text-on-surface-variant">
                    Loading clinics…
                  </td>
                </tr>
              ) : clinics.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-md py-xl text-center text-on-surface-variant">
                    No clinics yet. Click &ldquo;Add Clinic&rdquo; to create one.
                  </td>
                </tr>
              ) : (
                clinics.map((c) => (
                  <tr key={c._id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-md py-xs">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-container-high flex items-center justify-center shrink-0">
                        {c.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-on-surface-variant">storefront</span>
                        )}
                      </div>
                    </td>
                    <td className="px-md py-xs whitespace-nowrap text-body-md font-semibold text-on-surface">
                      {c.name}
                    </td>
                    <td className="px-md py-xs text-body-md text-on-surface-variant max-w-[260px] truncate">
                      {c.address || "—"}
                    </td>
                    <td className="px-md py-xs whitespace-nowrap text-body-md font-semibold text-primary">
                      Rs. {c.feePkr.toLocaleString()}
                    </td>
                    <td className="px-md py-xs whitespace-nowrap">
                      <button
                        disabled={busy}
                        onClick={() => toggleActive(c)}
                        className={`px-sm py-0.5 rounded-full text-caption font-bold transition-colors ${
                          c.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                        }`}
                      >
                        {c.isActive ? "Active" : "Disabled"}
                      </button>
                    </td>
                    <td className="px-md py-xs text-right">
                      <div className="flex items-center justify-end gap-xs">
                        <div className="relative group/tip">
                          <button
                            onClick={() => setScheduleClinic(c)}
                            className="p-xs rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">schedule</span>
                          </button>
                          <span className="pointer-events-none absolute bottom-full right-0 mb-xs whitespace-nowrap rounded-md bg-on-surface px-sm py-0.5 text-caption text-surface opacity-0 scale-95 transition-all group-hover/tip:opacity-100 group-hover/tip:scale-100 z-10">
                            View Schedule
                          </span>
                        </div>
                        <div className="relative group/tip">
                          <Link
                            href={`/admin/clinics/${c._id}`}
                            className="p-xs rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors block"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </Link>
                          <span className="pointer-events-none absolute bottom-full right-0 mb-xs whitespace-nowrap rounded-md bg-on-surface px-sm py-0.5 text-caption text-surface opacity-0 scale-95 transition-all group-hover/tip:opacity-100 group-hover/tip:scale-100 z-10">
                            Edit
                          </span>
                        </div>
                        <div className="relative group/tip">
                          <button
                            onClick={() => setDeleteClinicTarget(c)}
                            className="p-xs rounded-lg border border-error/20 text-error hover:bg-error/10 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                          <span className="pointer-events-none absolute bottom-full right-0 mb-xs whitespace-nowrap rounded-md bg-on-surface px-sm py-0.5 text-caption text-surface opacity-0 scale-95 transition-all group-hover/tip:opacity-100 group-hover/tip:scale-100 z-10">
                            Delete
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Schedule modal */}
      {scheduleClinic && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-md">
          <div className="bg-surface rounded-2xl shadow-2xl max-w-md w-full mx-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-lg py-md border-b border-outline-variant/30">
              <div>
                <h3 className="text-headline-md font-bold text-on-surface">{scheduleClinic.name}</h3>
                <p className="text-caption text-on-surface-variant">
                  Default slot: {scheduleClinic.defaultSlotDurationMinutes} minutes
                </p>
              </div>
              <button
                onClick={() => setScheduleClinic(null)}
                className="p-xs rounded-lg hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-lg space-y-xs">
              {(scheduleClinic.schedule ?? []).map((d) => (
                <div
                  key={d.day}
                  className={`flex items-center justify-between p-sm rounded-xl ${
                    d.isOpen ? "bg-primary/5 border border-primary/20" : "border border-outline-variant/50"
                  }`}
                >
                  <span className={`text-label-md font-semibold ${d.isOpen ? "text-primary" : "text-on-surface-variant"}`}>
                    {d.day}
                  </span>
                  {d.isOpen ? (
                    <span className="text-body-md text-on-surface">{d.startTime} to {d.endTime}</span>
                  ) : (
                    <span className="text-caption text-on-surface-variant italic">Closed</span>
                  )}
                </div>
              ))}
              {(!scheduleClinic.schedule || scheduleClinic.schedule.length === 0) && (
                <p className="text-body-md text-on-surface-variant text-center py-md">
                  No schedule configured yet.
                </p>
              )}
            </div>
            <div className="px-lg py-md border-t border-outline-variant/20">
              <Link
                href={`/admin/clinics/${scheduleClinic._id}`}
                className="block text-center w-full px-md py-sm rounded-xl bg-primary text-on-primary font-semibold hover:opacity-90"
              >
                Edit Schedule
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteClinicTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-md">
          <div className="bg-surface rounded-2xl p-lg shadow-2xl max-w-sm w-full mx-md">
            <h3 className="text-headline-md font-bold text-on-surface mb-sm">Delete Clinic?</h3>
            <p className="text-body-md text-on-surface-variant mb-lg">
              This will permanently remove{" "}
              <span className="font-semibold text-on-surface">{deleteClinicTarget.name}</span> and
              its image. This action cannot be undone.
            </p>
            <div className="flex gap-sm justify-end">
              <button
                onClick={() => setDeleteClinicTarget(null)}
                className="px-md py-xs rounded-xl border border-outline-variant text-on-surface font-semibold hover:bg-surface-container-high"
              >
                Cancel
              </button>
              <button
                disabled={busy}
                onClick={handleDelete}
                className="px-md py-xs rounded-xl bg-error text-on-error font-semibold hover:opacity-90 disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
