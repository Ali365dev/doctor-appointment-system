"use client";

import Image from "next/image";
import { useState, useRef, DragEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { uploadWithProgress } from "@/lib/uploadWithProgress";
import ChangePasswordSection from "./ChangePasswordSection";

export interface ProfileData {
  name: string;
  email: string;
  phone: string;
  gender: "Male" | "Female" | "Other";
  dob: string;
  avatar: string;
  bloodType: string;
  address: string;
  city: string;
  country: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  allergies: string;
  medications: string;
}

interface ProfileFormProps {
  initialUser: ProfileData;
}

const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

export default function ProfileForm({ initialUser }: ProfileFormProps) {
  const router = useRouter();
  const [data, setData] = useState<ProfileData>(initialUser);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);
  const [deletingAvatar, setDeletingAvatar] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [unsaved, setUnsaved] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileData, string>>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  function handleChange(key: keyof ProfileData, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
    setUnsaved(true);
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate() {
    const newErrors: Partial<Record<keyof ProfileData, string>> = {};
    if (!data.name.trim()) newErrors.name = "Name is required.";
    if (data.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      newErrors.email = "Enter a valid email address.";
    }
    if (data.phone.trim() && !/^\+?[0-9]{7,15}$/.test(data.phone.trim())) {
      newErrors.phone = "Enter a valid phone number.";
    }
    return newErrors;
  }

  async function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email || undefined,
          phone: data.phone || undefined,
          gender: data.gender,
          dob: data.dob || undefined,
          bloodType: data.bloodType || undefined,
          address: data.address || undefined,
          city: data.city || undefined,
          country: data.country || undefined,
          emergencyContactName: data.emergencyContactName || undefined,
          emergencyContactPhone: data.emergencyContactPhone || undefined,
          allergies: data.allergies || undefined,
          medications: data.medications || undefined,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error ?? "Could not update profile");
        return;
      }
      setUnsaved(false);
      toast.success("Profile updated successfully");
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setData(initialUser);
    setUnsaved(false);
    setErrors({});
  }

  function validateAvatarFile(file: File): string | null {
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      return "Only JPG, PNG, or WEBP images are accepted.";
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      return "Photo must be 5 MB or smaller.";
    }
    return null;
  }

  async function uploadAvatar(file: File) {
    const validationError = validateAvatarFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setUploadingAvatar(true);
    setAvatarProgress(0);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadWithProgress<{ avatar?: string; error?: string }>(
        "/api/profile/avatar",
        formData,
        setAvatarProgress
      );
      if (!result.ok) {
        toast.error(result.data.error ?? "Could not upload photo");
        return;
      }
      setData((prev) => ({ ...prev, avatar: result.data.avatar ?? "" }));
      toast.success("Profile photo updated");
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setUploadingAvatar(false);
      setAvatarProgress(0);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadAvatar(file);
  }

  function handleAvatarDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadAvatar(file);
  }

  async function handleRemoveAvatar() {
    setDeletingAvatar(true);
    try {
      const res = await fetch("/api/profile/avatar", { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error ?? "Could not remove photo");
        return;
      }
      setData((prev) => ({ ...prev, avatar: "" }));
      toast.success("Profile photo removed");
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setDeletingAvatar(false);
    }
  }

  const field = (
    key: keyof ProfileData,
    label: string,
    type = "text",
    placeholder = "",
    disabled = false
  ) => (
    <div>
      <label className="block text-label-md text-on-surface-variant mb-xs">{label}</label>
      <input
        type={type}
        value={data[key]}
        disabled={disabled}
        onChange={(e) => handleChange(key, e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-surface-container-lowest border rounded-lg py-sm px-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md disabled:opacity-60 disabled:cursor-not-allowed ${
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
          <div
            className="relative group"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleAvatarDrop}
          >
            <div
              className={`w-24 h-24 rounded-full overflow-hidden border-4 shadow-md bg-surface-container-high flex items-center justify-center transition-colors ${
                isDragging ? "border-primary" : "border-surface-container-high"
              }`}
            >
              {data.avatar ? (
                <Image
                  src={data.avatar}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <span className="material-symbols-outlined text-on-surface-variant text-[40px]">person</span>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-[10px] font-bold text-white">{avatarProgress}%</span>
                </div>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <span className="material-symbols-outlined text-white text-[28px]">photo_camera</span>
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
          <div className="flex flex-col gap-xs text-center sm:text-left">
            <h3 className="text-headline-md font-bold text-on-surface">{data.name || "—"}</h3>
            <p className="text-caption text-on-surface-variant">{data.phone}</p>
            <p className="text-caption text-outline">JPG, PNG, or WEBP · Max 5 MB · drag &amp; drop onto photo</p>
            <div className="flex gap-xs justify-center sm:justify-start">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploadingAvatar}
                className="px-md py-xs text-label-md bg-primary text-on-primary rounded-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-60"
              >
                {data.avatar ? "Replace Photo" : "Upload Photo"}
              </button>
              {data.avatar && (
                <button
                  onClick={handleRemoveAvatar}
                  disabled={uploadingAvatar || deletingAvatar}
                  className="px-md py-xs text-label-md border border-outline-variant text-error rounded-lg hover:bg-error/5 transition-colors disabled:opacity-60"
                >
                  {deletingAvatar ? "Removing…" : "Remove"}
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
          {field("name", "Full Name", "text", "Full name")}
          {field("email", "Email Address", "email", "you@email.com")}
          {field("phone", "Phone Number", "tel", "+92 300 0000000")}
          {field("dob", "Date of Birth", "date")}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-xs">Gender</label>
            <select
              value={data.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-sm px-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md"
            >
              {["Male", "Female", "Other"].map((g) => (
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
              <option value="">Not specified</option>
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
          {field("city", "City", "text", "Faisalabad")}
          {field("country", "Country", "text", "Pakistan")}
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
        <div className="p-md border-b border-outline-variant/30 flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary">emergency</span>
          <h3 className="text-headline-md font-bold text-on-surface">Emergency Contact</h3>
        </div>
        <div className="p-md grid grid-cols-1 md:grid-cols-2 gap-md">
          {field("emergencyContactName", "Contact Name", "text", "Full name")}
          {field("emergencyContactPhone", "Contact Phone", "tel", "+92 300 0000000")}
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

      {/* Change Password */}
      <ChangePasswordSection />

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
          disabled={saving}
          className="px-lg py-sm font-bold rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-xs bg-primary text-on-primary hover:brightness-110 disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[20px]">save</span>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
