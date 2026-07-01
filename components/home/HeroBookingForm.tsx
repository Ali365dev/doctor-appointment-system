"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/store/bookingStore";
import { doctor } from "@/lib/data";

type FormState = {
  fullName: string;
  phone: string;
  gender: string;
  age: string;
  visitType: string;
  date: string;
  time: string;
  notes: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

const initialForm: FormState = {
  fullName: "",
  phone: "",
  gender: "Male",
  age: "",
  visitType: "New Consult",
  date: "",
  time: "",
  notes: "",
};

export default function HeroBookingForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const setPatientInfo = useBookingStore((s) => s.setPatientInfo);

  const today = new Date().toISOString().split("T")[0];

  const validate = (): boolean => {
    const e: Errors = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!/^[+\d][\d\s\-()]{6,}$/.test(form.phone)) e.phone = "Enter a valid phone number";
    if (!form.age.trim()) e.age = "Age is required";
    else if (Number(form.age) < 1 || Number(form.age) > 120) e.age = "Enter a valid age";
    if (!form.date) e.date = "Select a date";
    else if (form.date < today) e.date = "Date cannot be in the past";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setPatientInfo({
      fullName: form.fullName,
      phone: form.phone,
      gender: form.gender as "Male" | "Female" | "Other",
      age: form.age,
      notes: form.notes,
    });
    setTimeout(() => {
      setSubmitting(false);
      router.push("/book-appointment/step-1");
    }, 600);
  };

  const inputCls = (field: keyof FormState) =>
    `w-full bg-surface-container-lowest border rounded-lg px-sm py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${
      errors[field] ? "border-error" : "border-outline-variant/30"
    }`;

  const locations = doctor.practice_locations;
  const defaultFee = locations.length > 0 ? `Rs. ${locations[0].fee_pkr.toLocaleString()}` : "";

  return (
    <div className="glass-card p-md rounded-2xl shadow-xl border border-white/30">
      <div className="mb-md">
        <h3 className="text-headline-md font-semibold text-on-surface">Book Appointment</h3>
        <p className="text-caption text-on-surface-variant">
          Secure your consultation — {defaultFee} consultation fee
        </p>
      </div>

      <form className="space-y-sm" onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-2 gap-sm">
          {/* Full Name */}
          <div className="col-span-2">
            <label className="block text-caption font-bold mb-xs text-outline">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="e.g. Ahmed Khan"
              className={inputCls("fullName")}
            />
            {errors.fullName && <p className="text-caption text-error mt-xs">{errors.fullName}</p>}
          </div>

          {/* Phone */}
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-caption font-bold mb-xs text-outline">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+92 300 0000000"
              className={inputCls("phone")}
            />
            {errors.phone && <p className="text-caption text-error mt-xs">{errors.phone}</p>}
          </div>

          {/* Gender */}
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-caption font-bold mb-xs text-outline">Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange} className={inputCls("gender")}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          {/* Age */}
          <div>
            <label className="block text-caption font-bold mb-xs text-outline">Age</label>
            <input
              type="number"
              name="age"
              value={form.age}
              onChange={handleChange}
              placeholder="25"
              min={1}
              max={120}
              className={inputCls("age")}
            />
            {errors.age && <p className="text-caption text-error mt-xs">{errors.age}</p>}
          </div>

          {/* Visit Type */}
          <div>
            <label className="block text-caption font-bold mb-xs text-outline">Visit Type</label>
            <select name="visitType" value={form.visitType} onChange={handleChange} className={inputCls("visitType")}>
              <option>New Consult</option>
              <option>Follow-up</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-caption font-bold mb-xs text-outline">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              min={today}
              className={inputCls("date")}
            />
            {errors.date && <p className="text-caption text-error mt-xs">{errors.date}</p>}
          </div>

          {/* Time */}
          <div>
            <label className="block text-caption font-bold mb-xs text-outline">Preferred Time</label>
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              className={inputCls("time")}
            />
          </div>

          {/* Notes */}
          <div className="col-span-2">
            <label className="block text-caption font-bold mb-xs text-outline">Additional Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Reason for visit, symptoms..."
              rows={2}
              className={inputCls("notes")}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary text-on-primary py-sm rounded-xl font-bold shadow-lg hover:bg-primary/90 transition-all mt-md disabled:opacity-60 flex items-center justify-center gap-sm"
        >
          {submitting ? (
            <>
              <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
              Processing…
            </>
          ) : (
            "Confirm Booking"
          )}
        </button>
      </form>
    </div>
  );
}
