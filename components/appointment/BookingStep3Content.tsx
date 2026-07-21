"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "react-toastify";
import { useBookingStore } from "@/store/bookingStore";
import { doctor as staticDoctor } from "@/lib/data";
import { useDoctorProfile } from "@/lib/context/DoctorProfileContext";

const cities = ["Lahore", "Karachi", "Islamabad", "Faisalabad", "Rawalpindi"];

export default function BookingStep3Content() {
  const doctor = useDoctorProfile();
  const router = useRouter();
  const {
    selectedClinic,
    selectedProcedure,
    selectedDate,
    selectedTime,
    visitType,
    patientInfo,
    setPatientInfo,
    referralDoctor,
    setReferralDoctor,
    medicalReportUrl,
    setMedicalReportUrl,
  } = useBookingStore();

  const [gender, setGender] = useState<"Male" | "Female" | "Other">(patientInfo.gender);
  const [form, setForm] = useState({
    fullName: patientInfo.fullName,
    phone: patientInfo.phone,
    age: patientInfo.age,
    cnic: patientInfo.cnic,
    email: patientInfo.email,
    city: patientInfo.city || "",
    condition: patientInfo.condition,
    notes: patientInfo.notes,
    isExisting: patientInfo.isExisting,
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [uploadingReport, setUploadingReport] = useState(false);

  const formattedDate = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      })
    : "—";

  const set = (field: keyof typeof form, value: string | boolean) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field as keyof typeof errors])
      setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!/^[0-9+\-\s()]{7,15}$/.test(form.phone.trim())) e.phone = "Enter a valid phone number";
    if (!form.age.trim()) e.age = "Age is required";
    else if (Number(form.age) < 1 || Number(form.age) > 120) e.age = "Enter a valid age";
    if (!form.city.trim()) e.city = "Please enter your city";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = "Enter a valid email address";
    setErrors(e as Partial<typeof form>);
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    const errorFields = Object.keys(validationErrors);
    if (errorFields.length > 0) {
      toast.error(validationErrors[errorFields[0]]);
      document.querySelector(`[name="${errorFields[0]}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setPatientInfo({ ...form, gender });
    router.push("/book-appointment/step-4");
  };

  const handleReportUpload = async (file: File) => {
    setUploadingReport(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads/medical-report", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not upload medical report");
        return;
      }
      setMedicalReportUrl(data.url);
      toast.success("Medical report uploaded");
    } catch {
      toast.error("Network error uploading medical report");
    } finally {
      setUploadingReport(false);
    }
  };

  const inputCls = (field: string) =>
    `w-full h-12 px-4 rounded-xl border ${
      (errors as Record<string, string>)[field] ? "border-error" : "border-outline-variant"
    } bg-surface-container-low text-body-md focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      {/* Left: Form */}
      <div className="lg:col-span-8">
        <section className="bg-surface-container-lowest rounded-2xl p-6 md:p-10 shadow-sm border border-outline-variant/30">
          <header className="mb-10">
            <h1 className="text-headline-lg font-bold text-on-surface mb-2">Patient Information</h1>
            <p className="text-body-md text-on-surface-variant">
              Please provide the details of the person attending the appointment.
            </p>
          </header>

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[14px] font-semibold text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">person</span>Full Name
                  <span className="text-error">*</span>
                </label>
                <input type="text" name="fullName" value={form.fullName} onChange={(e) => set("fullName", e.target.value)}
                  placeholder="e.g. Ahmed Khan" required aria-invalid={!!(errors as Record<string, string>).fullName} className={inputCls("fullName")} />
                {(errors as Record<string, string>).fullName && <p className="text-caption text-error">{(errors as Record<string, string>).fullName}</p>}
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[14px] font-semibold text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">phone</span>Phone Number
                  <span className="text-error">*</span>
                </label>
                <input type="tel" name="phone" value={form.phone} onChange={(e) => set("phone", e.target.value)}
                  placeholder="+92 300 0000000" required aria-invalid={!!(errors as Record<string, string>).phone} className={inputCls("phone")} />
                {(errors as Record<string, string>).phone && <p className="text-caption text-error">{(errors as Record<string, string>).phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[14px] font-semibold text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">wc</span>Gender
                </label>
                <div className="flex bg-surface-container-low rounded-xl p-1 border border-outline-variant h-12">
                  {(["Male", "Female", "Other"] as const).map((g) => (
                    <button key={g} type="button" onClick={() => setGender(g)}
                      className={`flex-1 py-2 text-center rounded-lg text-[14px] font-semibold transition-all ${gender === g ? "bg-white shadow-sm text-primary" : "text-on-surface-variant hover:bg-surface-container-high"}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[14px] font-semibold text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">cake</span>Age
                  <span className="text-error">*</span>
                </label>
                <input type="number" name="age" value={form.age} onChange={(e) => set("age", e.target.value)}
                  placeholder="24" min={1} max={120} required aria-invalid={!!(errors as Record<string, string>).age} className={inputCls("age")} />
                {(errors as Record<string, string>).age && <p className="text-caption text-error">{(errors as Record<string, string>).age}</p>}
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[14px] font-semibold text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">badge</span>CNIC (Optional)
                </label>
                <input type="text" value={form.cnic} onChange={(e) => set("cnic", e.target.value)}
                  placeholder="00000-0000000-0" className={inputCls("cnic")} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[14px] font-semibold text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">mail</span>Email (Optional)
                </label>
                <input type="email" name="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                  placeholder="example@email.com" aria-invalid={!!(errors as Record<string, string>).email} className={inputCls("email")} />
                {(errors as Record<string, string>).email && <p className="text-caption text-error">{(errors as Record<string, string>).email}</p>}
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[14px] font-semibold text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>City
                  <span className="text-error">*</span>
                </label>
                <input type="text" name="city" list="city-options" value={form.city} onChange={(e) => set("city", e.target.value)}
                  placeholder="Select or type your city" required aria-invalid={!!(errors as Record<string, string>).city} className={inputCls("city")} />
                <datalist id="city-options">
                  {cities.map((c) => <option key={c} value={c} />)}
                </datalist>
                {(errors as Record<string, string>).city && <p className="text-caption text-error">{(errors as Record<string, string>).city}</p>}
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <label className="text-[14px] font-semibold text-on-surface-variant block">
                Have you visited this clinic before?
              </label>
              <div className="flex gap-8">
                {[true, false].map((val) => (
                  <label key={String(val)} className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="existing" checked={form.isExisting === val}
                      onChange={() => set("isExisting", val)}
                      className="w-5 h-5 text-primary border-outline-variant focus:ring-primary/20" />
                    <span className="text-body-md text-on-surface">
                      {val ? "Yes, I am an existing patient" : "No, this is my first visit"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[14px] font-semibold text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">medical_services</span>
                  Medical Condition / Reason for Visit
                  <span className="normal-case tracking-normal font-normal text-outline text-[12px]">(Optional)</span>
                </label>
                <textarea rows={3} value={form.condition} onChange={(e) => set("condition", e.target.value)}
                  placeholder="Briefly describe your symptoms or medical concern..."
                  className={`w-full p-4 rounded-xl border ${(errors as Record<string, string>).condition ? "border-error" : "border-outline-variant"} bg-surface-container-low text-body-md focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none`} />
                {(errors as Record<string, string>).condition && <p className="text-caption text-error">{(errors as Record<string, string>).condition}</p>}
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[14px] font-semibold text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">sticky_note_2</span>
                  Notes for Doctor (Optional)
                </label>
                <textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)}
                  placeholder="Any specific instructions or additional info..."
                  className="w-full p-4 rounded-xl border border-outline-variant bg-surface-container-low text-body-md focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none" />
              </div>
            </div>

            {selectedProcedure && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[14px] font-semibold text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">badge</span>
                    Referral Doctor (Optional)
                  </label>
                  <input type="text" value={referralDoctor} onChange={(e) => setReferralDoctor(e.target.value)}
                    placeholder="e.g. Dr. Ahmed Khan" className={inputCls("")} />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[14px] font-semibold text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">upload_file</span>
                    Medical Reports (Optional)
                  </label>
                  <label className="flex items-center justify-center h-12 px-4 rounded-xl border border-dashed border-outline-variant bg-surface-container-low cursor-pointer hover:border-primary transition-all">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleReportUpload(e.target.files[0])}
                      disabled={uploadingReport}
                    />
                    <span className="text-caption text-on-surface-variant">
                      {uploadingReport ? "Uploading…" : medicalReportUrl ? "Report uploaded ✓" : "Choose file (image or PDF)"}
                    </span>
                  </label>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-outline-variant/30">
              <button type="button" onClick={() => router.push("/book-appointment/step-2")}
                className="px-8 py-3 rounded-xl border border-outline-variant text-[14px] font-semibold text-on-surface-variant hover:bg-surface-container-high transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>Back
              </button>
              <button type="submit"
                className="px-10 py-3 rounded-xl bg-primary text-on-primary text-[14px] font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2">
                Continue to Review
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* Right: Summary Sidebar */}
      <div className="lg:col-span-4">
        <aside className="sticky top-28 space-y-6">
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
            <div className="p-6 bg-primary/5 border-b border-outline-variant/30">
              <h2 className="text-headline-md font-semibold text-primary">Appointment Summary</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-container-high border-2 border-white shadow-sm">
                  <Image src={doctor.profileImage} alt={doctor.name} width={64} height={64}
                    className="w-full h-full object-cover" unoptimized />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-primary">Your Doctor</p>
                  <h3 className="text-body-lg font-semibold leading-tight text-on-surface">{doctor.name}</h3>
                  <p className="text-caption text-on-surface-variant">{doctor.specialization.join(" & ")}</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  ...(selectedProcedure
                    ? [{ icon: "medical_services", label: "Procedure", value: selectedProcedure.name }]
                    : []),
                  { icon: "festival", label: "Clinic", value: selectedClinic?.name ?? "—" },
                  {
                    icon: "calendar_today", label: "Date & Time",
                    value: `${formattedDate}${selectedTime ? ` at ${selectedTime}` : ""}`,
                  },
                  { icon: "stethoscope", label: "Visit Type", value: visitType === "online" ? "Online Consultation" : "In-Clinic Consultation" },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined">{icon}</span>
                    </div>
                    <div>
                      <p className="text-[12px] uppercase tracking-wider text-on-surface-variant font-semibold">{label}</p>
                      <p className="text-body-md text-on-surface font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-outline-variant/30 flex justify-between items-center">
                <span className="text-body-lg font-semibold text-on-surface">Total Fee</span>
                <span className="text-headline-md font-bold text-primary">
                  Rs. {(selectedProcedure?.pricePkr ?? selectedClinic?.fee_pkr ?? staticDoctor.fee_summary.min_fee_pkr).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
