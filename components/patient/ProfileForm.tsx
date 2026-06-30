"use client";

import Image from "next/image";
import { useState, useRef } from "react";

type ProfileData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  bloodType: string;
  address: string;
  city: string;
  country: string;
  emergencyName: string;
  emergencyPhone: string;
  allergies: string;
  medications: string;
};

const initialData: ProfileData = {
  firstName: "James",
  lastName: "Patterson",
  email: "james.patterson@email.com",
  phone: "+1 (555) 012-3456",
  dob: "1985-03-15",
  gender: "Male",
  bloodType: "O+",
  address: "124 Medical Plaza Dr.",
  city: "New York",
  country: "United States",
  emergencyName: "Sarah Patterson",
  emergencyPhone: "+1 (555) 987-6543",
  allergies: "Penicillin, Shellfish",
  medications: "Lisinopril 10mg, Vitamin D3",
};

const avatarSrc =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBYCJysrc3XroQtiaWH68dl0l0m1kqyd-lpNHcCi-6nj-BeBK2z5ULlDaoCU4g72NIAB2B-AkzxCaqKFKzVz4FY5DS1q11_wxCKqq06ahuL2Pw2vRkkMSfFpcXWx9An7gQCV1nwlMQCd5NpcYCUYQNOwuSAmTNNgDYCKmHYJqPte0PTVa3KVcxd7yPWIgD07DWhfQpAuSHYC0q9pUZJsevvIlUl5TtIeU5hb1lBWZmU9gEqaE_LZec_ddfHe5VVex5gEjuwx8hchHc";

export default function ProfileForm() {
  const [data, setData] = useState<ProfileData>(initialData);
  const [saved, setSaved] = useState(false);
  const [unsaved, setUnsaved] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileData, string>>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  function handleChange(key: keyof ProfileData, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
    setUnsaved(true);
    setSaved(false);
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate() {
    const newErrors: Partial<Record<keyof ProfileData, string>> = {};
    if (!data.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!data.lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!data.email.includes("@")) newErrors.email = "Valid email is required.";
    if (!data.phone.trim()) newErrors.phone = "Phone number is required.";
    return newErrors;
  }

  function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSaved(true);
    setUnsaved(false);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleCancel() {
    setData(initialData);
    setAvatarPreview(null);
    setUnsaved(false);
    setErrors({});
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
      setUnsaved(true);
    }
  }

  function handleRemoveAvatar() {
    setAvatarPreview(null);
    setUnsaved(true);
    if (fileRef.current) fileRef.current.value = "";
  }

  const field = (
    key: keyof ProfileData,
    label: string,
    type = "text",
    placeholder = ""
  ) => (
    <div>
      <label className="block text-label-md text-on-surface-variant mb-xs">{label}</label>
      <input
        type={type}
        value={data[key]}
        onChange={(e) => handleChange(key, e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-surface-container-lowest border rounded-lg py-sm px-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md ${
          errors[key] ? "border-error" : "border-outline-variant"
        }`}
      />
      {errors[key] && (
        <p className="text-caption text-error mt-xs">{errors[key]}</p>
      )}
    </div>
  );

  return (
    <div className="max-w-[900px] mx-auto space-y-md">
      {/* Unsaved warning */}
      {unsaved && (
        <div className="flex items-center gap-sm bg-warning/10 border border-warning/30 rounded-xl p-sm">
          <span className="material-symbols-outlined text-warning">warning</span>
          <p className="text-label-md text-on-surface">You have unsaved changes.</p>
        </div>
      )}

      {/* Avatar Card */}
      <section className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-md shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-md">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-surface-container-high shadow-md">
              <Image
                src={avatarPreview ?? avatarSrc}
                alt="Profile"
                width={96}
                height={96}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <span className="material-symbols-outlined text-white text-[28px]">photo_camera</span>
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          <div className="flex flex-col gap-xs text-center sm:text-left">
            <h3 className="text-headline-md font-bold text-on-surface">{data.firstName} {data.lastName}</h3>
            <p className="text-caption text-on-surface-variant">Patient ID: #SP-8821</p>
            <div className="flex gap-xs justify-center sm:justify-start">
              <button
                onClick={() => fileRef.current?.click()}
                className="px-md py-xs text-label-md bg-primary text-on-primary rounded-lg hover:brightness-110 active:scale-95 transition-all"
              >
                Change Photo
              </button>
              {(avatarPreview) && (
                <button
                  onClick={handleRemoveAvatar}
                  className="px-md py-xs text-label-md border border-outline-variant text-error rounded-lg hover:bg-error/5 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Personal Information */}
      <section className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
        <div className="p-md border-b border-outline-variant/30 flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary">person</span>
          <h3 className="text-headline-md font-bold text-on-surface">Personal Information</h3>
        </div>
        <div className="p-md grid grid-cols-1 md:grid-cols-2 gap-md">
          {field("firstName", "First Name", "text", "First name")}
          {field("lastName", "Last Name", "text", "Last name")}
          {field("email", "Email Address", "email", "you@email.com")}
          {field("phone", "Phone Number", "tel", "+1 (555) 000-0000")}
          {field("dob", "Date of Birth", "date")}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-xs">Gender</label>
            <select
              value={data.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-sm px-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md"
            >
              {["Male", "Female", "Non-binary", "Prefer not to say"].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-label-md text-on-surface-variant mb-xs">Blood Type</label>
            <select
              value={data.bloodType}
              onChange={(e) => handleChange("bloodType", e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-sm px-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md"
            >
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Address */}
      <section className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
        <div className="p-md border-b border-outline-variant/30 flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary">location_on</span>
          <h3 className="text-headline-md font-bold text-on-surface">Address</h3>
        </div>
        <div className="p-md grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="md:col-span-2">{field("address", "Street Address", "text", "123 Main St.")}</div>
          {field("city", "City", "text", "New York")}
          {field("country", "Country", "text", "United States")}
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
        <div className="p-md border-b border-outline-variant/30 flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary">emergency</span>
          <h3 className="text-headline-md font-bold text-on-surface">Emergency Contact</h3>
        </div>
        <div className="p-md grid grid-cols-1 md:grid-cols-2 gap-md">
          {field("emergencyName", "Contact Name", "text", "Full name")}
          {field("emergencyPhone", "Contact Phone", "tel", "+1 (555) 000-0000")}
        </div>
      </section>

      {/* Medical Information */}
      <section className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
        <div className="p-md border-b border-outline-variant/30 flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary">medical_information</span>
          <h3 className="text-headline-md font-bold text-on-surface">Medical Information</h3>
        </div>
        <div className="p-md grid grid-cols-1 md:grid-cols-2 gap-md">
          {field("allergies", "Known Allergies", "text", "e.g. Penicillin, Pollen")}
          {field("medications", "Current Medications", "text", "e.g. Lisinopril 10mg")}
        </div>
      </section>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-sm pb-xl">
        <button
          onClick={handleCancel}
          disabled={!unsaved}
          className="px-lg py-sm border border-outline-variant text-on-surface font-bold rounded-lg hover:bg-surface-container-low transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Cancel Changes
        </button>
        <button
          onClick={handleSave}
          className={`px-lg py-sm font-bold rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-xs ${
            saved
              ? "bg-emerald-500 text-white"
              : "bg-primary text-on-primary hover:brightness-110"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">{saved ? "check_circle" : "save"}</span>
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Success toast */}
      {saved && (
        <div className="fixed bottom-lg right-lg z-50 bg-inverse-surface text-inverse-on-surface px-md py-sm rounded-xl shadow-xl flex items-center gap-sm">
          <span className="material-symbols-outlined text-emerald-400">check_circle</span>
          <span className="text-label-md">Profile updated successfully</span>
        </div>
      )}
    </div>
  );
}
