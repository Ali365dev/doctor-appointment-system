"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { DAYS_OF_WEEK, SLOT_DURATION_OPTIONS, defaultWeeklySchedule, type WeeklySchedule } from "@/types/clinic";

interface ClinicRecord {
  _id: string;
  name: string;
  address?: string;
  city: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  feePkr: number;
  mapEmbed?: string;
  latitude?: number;
  longitude?: number;
  displayOrder: number;
  isActive: boolean;
  image?: string;
  defaultSlotDurationMinutes: number;
  schedule: WeeklySchedule;
}

interface FormState {
  name: string;
  address: string;
  city: string;
  phone: string;
  whatsapp: string;
  email: string;
  feePkr: string;
  mapEmbed: string;
  latitude: string;
  longitude: string;
  displayOrder: string;
  isActive: boolean;
  defaultSlotDurationMinutes: number;
  schedule: WeeklySchedule;
}

const EMPTY_FORM: FormState = {
  name: "",
  address: "",
  city: "",
  phone: "",
  whatsapp: "",
  email: "",
  feePkr: "",
  mapEmbed: "",
  latitude: "",
  longitude: "",
  displayOrder: "0",
  isActive: true,
  defaultSlotDurationMinutes: 30,
  schedule: defaultWeeklySchedule(),
};

function recordToForm(c: ClinicRecord): FormState {
  return {
    name: c.name,
    address: c.address ?? "",
    city: c.city,
    phone: c.phone ?? "",
    whatsapp: c.whatsapp ?? "",
    email: c.email ?? "",
    feePkr: String(c.feePkr),
    mapEmbed: c.mapEmbed ?? "",
    latitude: c.latitude !== undefined && c.latitude !== null ? String(c.latitude) : "",
    longitude: c.longitude !== undefined && c.longitude !== null ? String(c.longitude) : "",
    displayOrder: String(c.displayOrder ?? 0),
    isActive: c.isActive,
    defaultSlotDurationMinutes: c.defaultSlotDurationMinutes,
    schedule:
      c.schedule && c.schedule.length === DAYS_OF_WEEK.length ? c.schedule : defaultWeeklySchedule(),
  };
}

export default function ClinicFormContent({ clinicId }: { clinicId?: string }) {
  const router = useRouter();
  const isEdit = !!clinicId;

  const [loading, setLoading] = useState(isEdit);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [image, setImage] = useState<string | undefined>(undefined);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentId, setCurrentId] = useState<string | undefined>(clinicId);

  const loadClinic = useCallback(async () => {
    if (!clinicId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/clinics/${clinicId}`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not load clinic");
        return;
      }
      setForm(recordToForm(data.clinic));
      setImage(data.clinic.image);
    } catch {
      toast.error("Network error loading clinic");
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    loadClinic();
  }, [loadClinic]);

  const toggleDay = (day: string) => {
    setForm((f) => ({
      ...f,
      schedule: f.schedule.map((d) => (d.day === day ? { ...d, isOpen: !d.isOpen } : d)),
    }));
  };

  const setDayTime = (day: string, field: "startTime" | "endTime", value: string) => {
    setForm((f) => ({
      ...f,
      schedule: f.schedule.map((d) => (d.day === day ? { ...d, [field]: value } : d)),
    }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Clinic name is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.feePkr || Number(form.feePkr) < 0) e.feePkr = "Enter a valid consultation fee";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    setErrors(e);
    return e;
  };

  const handleSave = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      toast.error(Object.values(validationErrors)[0]);
      return;
    }

    setBusy(true);
    try {
      const body = {
        name: form.name.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        phone: form.phone.trim(),
        whatsapp: form.whatsapp.trim(),
        email: form.email.trim(),
        feePkr: Number(form.feePkr),
        mapEmbed: form.mapEmbed.trim(),
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
        displayOrder: Number(form.displayOrder) || 0,
        isActive: form.isActive,
        defaultSlotDurationMinutes: form.defaultSlotDurationMinutes,
        schedule: form.schedule,
      };

      const res = await fetch(currentId ? `/api/clinics/${currentId}` : "/api/clinics", {
        method: currentId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not save clinic");
        return;
      }

      toast.success(currentId ? "Clinic updated" : "Clinic created");

      if (!currentId) {
        const newId = data.clinic._id;
        setCurrentId(newId);
        router.replace(`/admin/clinics/${newId}`);
      } else {
        await loadClinic();
      }
    } catch {
      toast.error("Network error");
    } finally {
      setBusy(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!currentId) {
      toast.error("Save the clinic first, then upload an image");
      return;
    }
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/clinics/${currentId}/image`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not upload image");
        return;
      }
      setImage(data.clinic.image);
      toast.success("Clinic image updated");
    } catch {
      toast.error("Network error uploading image");
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="px-gutter py-lg max-w-4xl mx-auto text-center text-on-surface-variant py-xl">
        Loading clinic…
      </div>
    );
  }

  return (
    <div className="px-gutter py-lg overflow-y-auto h-[calc(100vh-72px)]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-xl">
          <div>
            <h2 className="text-headline-lg font-bold text-on-surface">
              {isEdit ? "Edit Clinic" : "Add Clinic"}
            </h2>
            <p className="text-on-surface-variant text-body-md">
              Manage clinic information, weekly schedule, and appointment slot duration.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={busy}
            className="px-md py-sm rounded-xl font-bold shadow-lg transition-all flex items-center gap-xs bg-primary text-on-primary hover:brightness-110 disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[20px]">save</span>
            {busy ? "Saving…" : "Save Changes"}
          </button>
        </div>

        <div className="space-y-lg">
          {/* Clinic Information */}
          <section className="bg-surface border border-outline-variant rounded-2xl p-md shadow-sm">
            <h3 className="text-headline-md font-semibold mb-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">business</span> Clinic Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md mb-md">
              <div>
                <label className="block text-label-md text-on-surface-variant mb-xs">
                  Clinic Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={`w-full bg-surface-container-lowest border rounded-xl p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface ${
                    errors.name ? "border-error" : "border-outline-variant"
                  }`}
                />
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-xs">
                  City <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  className={`w-full bg-surface-container-lowest border rounded-xl p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface ${
                    errors.city ? "border-error" : "border-outline-variant"
                  }`}
                />
              </div>
            </div>

            <div className="mb-md">
              <label className="block text-label-md text-on-surface-variant mb-xs">Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-md mb-md">
              <div>
                <label className="block text-label-md text-on-surface-variant mb-xs">Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface"
                />
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-xs">WhatsApp</label>
                <input
                  type="text"
                  value={form.whatsapp}
                  onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface"
                />
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-xs">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className={`w-full bg-surface-container-lowest border rounded-xl p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface ${
                    errors.email ? "border-error" : "border-outline-variant"
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md mb-md">
              <div>
                <label className="block text-label-md text-on-surface-variant mb-xs">
                  Consultation Fee (PKR) <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.feePkr}
                  onChange={(e) => setForm((f) => ({ ...f, feePkr: e.target.value }))}
                  className={`w-full bg-surface-container-lowest border rounded-xl p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface ${
                    errors.feePkr ? "border-error" : "border-outline-variant"
                  }`}
                />
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-xs">Display Order</label>
                <input
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface"
                />
              </div>
            </div>

            <div className="mb-md">
              <label className="block text-label-md text-on-surface-variant mb-xs">Google Map Embed URL</label>
              <input
                type="text"
                value={form.mapEmbed}
                onChange={(e) => setForm((f) => ({ ...f, mapEmbed: e.target.value }))}
                placeholder="https://maps.google.com/maps?...&output=embed"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md mb-md">
              <div>
                <label className="block text-label-md text-on-surface-variant mb-xs">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface"
                />
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-xs">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-sm rounded-xl border border-outline-variant/50">
              <div>
                <p className="font-semibold text-on-surface">Active</p>
                <p className="text-caption text-on-surface-variant">Inactive clinics are hidden from booking</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  checked={form.isActive}
                  onChange={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                  type="checkbox"
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>
          </section>

          {/* Clinic Image */}
          <section className="bg-surface border border-outline-variant rounded-2xl p-md shadow-sm">
            <h3 className="text-headline-md font-semibold mb-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-secondary">palette</span> Clinic Image
            </h3>
            <div className="flex items-center gap-md">
              <label
                className={`w-20 h-20 rounded-2xl border-2 border-dashed border-outline-variant flex items-center justify-center bg-surface-container-low overflow-hidden group transition-colors ${
                  currentId ? "cursor-pointer hover:border-primary" : "opacity-60 cursor-not-allowed"
                }`}
              >
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image} alt="Clinic" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-outline group-hover:text-primary">upload_file</span>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={!currentId || uploadingImage}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                    e.target.value = "";
                  }}
                />
              </label>
              <div>
                <p className="font-semibold text-on-surface">Clinic Photo</p>
                <p className="text-caption text-on-surface-variant mb-sm">
                  {currentId
                    ? "JPG, PNG, or WEBP, up to 5MB"
                    : "Save the clinic first to enable image upload"}
                </p>
                {uploadingImage && <p className="text-caption text-primary">Uploading…</p>}
              </div>
            </div>
          </section>

          {/* Appointment Settings */}
          <section className="bg-surface border border-outline-variant rounded-2xl p-md shadow-sm">
            <h3 className="text-headline-md font-semibold mb-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">timer</span> Appointment Settings
            </h3>
            <div className="max-w-xs">
              <label className="block text-label-md text-on-surface-variant mb-xs">
                Default Appointment Slot Duration
              </label>
              <select
                value={form.defaultSlotDurationMinutes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, defaultSlotDurationMinutes: Number(e.target.value) }))
                }
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface"
              >
                {SLOT_DURATION_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m} minutes
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Weekly Schedule */}
          <section className="bg-surface border border-outline-variant rounded-2xl p-md shadow-sm">
            <h3 className="text-headline-md font-semibold mb-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">schedule</span> Working Days &amp; Hours
            </h3>
            <div className="space-y-xs">
              {form.schedule.map((d) => (
                <div
                  key={d.day}
                  className={`flex items-center gap-md p-sm rounded-xl transition-colors ${
                    d.isOpen ? "bg-primary/5 border border-primary/20" : "border border-outline-variant/50"
                  }`}
                >
                  <label className="flex items-center gap-sm cursor-pointer w-36 shrink-0">
                    <input
                      type="checkbox"
                      checked={d.isOpen}
                      onChange={() => toggleDay(d.day)}
                      className="w-4 h-4 rounded border-outline accent-primary"
                    />
                    <span className={`text-label-md font-semibold ${d.isOpen ? "text-primary" : "text-on-surface-variant"}`}>
                      {d.day}
                    </span>
                  </label>
                  {d.isOpen ? (
                    <div className="flex items-center gap-xs flex-1">
                      <input
                        type="time"
                        value={to24Hour(d.startTime)}
                        onChange={(e) => setDayTime(d.day, "startTime", to12Hour(e.target.value))}
                        className="bg-surface border border-outline-variant rounded-lg px-sm py-xs text-sm text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                      <span className="text-on-surface-variant text-sm">to</span>
                      <input
                        type="time"
                        value={to24Hour(d.endTime)}
                        onChange={(e) => setDayTime(d.day, "endTime", to12Hour(e.target.value))}
                        className="bg-surface border border-outline-variant rounded-lg px-sm py-xs text-sm text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                  ) : (
                    <span className="text-caption text-on-surface-variant italic">Closed</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/** "09:00 AM" -> "09:00" (for <input type="time">) */
function to24Hour(time: string): string {
  if (!time) return "09:00";
  const [timePart, period] = time.trim().split(" ");
  const [h, m] = timePart.split(":").map(Number);
  let hours = h % 12;
  if (period === "PM") hours += 12;
  return `${String(hours).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** "09:00" -> "09:00 AM" (from <input type="time">) */
function to12Hour(time: string): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}
