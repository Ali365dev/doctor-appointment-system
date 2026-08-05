"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { useDoctorProfile, useSetDoctorProfile } from "@/lib/context/DoctorProfileContext";
import type {
  CmsEducationEntry,
  CmsJourneyEntry,
  CmsWhyChooseFeature,
  CmsGalleryImage,
  CmsSpecializedService,
  CmsPrepGuideStep,
  CmsPrepGuideTile,
  CmsFooterLink,
} from "@/services/mongodb/repositories/cms.repository";

/** Curated set of doctor/medical-themed Material Symbols icons for feature & service cards. */
const ICON_OPTIONS = [
  "medical_services", "stethoscope", "local_hospital", "health_and_safety", "biotech", "vaccines",
  "monitor_heart", "ecg_heart", "bloodtype", "healing", "medication", "medical_information",
  "personal_injury", "psychology", "visibility", "search", "emergency", "vital_signs",
  "school", "person", "verified", "favorite", "support_agent", "groups",
  "spa", "self_improvement", "fitness_center", "restaurant", "water_drop", "air",
  "sick", "coronavirus", "thermostat", "accessibility_new", "elderly", "pregnant_woman",
  "child_care", "wc", "science", "diversity_3",
];

function IconPicker({ value, onChange }: { value: string; onChange: (icon: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-xs bg-surface border border-outline-variant rounded-lg p-sm text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
      >
        <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{value || "medical_services"}</span>
        <span className="text-on-surface-variant truncate flex-1 text-left">{value || "Select icon"}</span>
        <span className="material-symbols-outlined text-outline text-[18px]">expand_more</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-xs w-64 max-h-56 overflow-y-auto bg-surface border border-outline-variant rounded-lg shadow-lg p-xs grid grid-cols-6 gap-1">
            {ICON_OPTIONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => {
                  onChange(icon);
                  setOpen(false);
                }}
                title={icon}
                className={`p-xs rounded-lg flex items-center justify-center hover:bg-primary/10 transition-colors ${
                  value === icon ? "bg-primary/15 text-primary" : "text-on-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const tabs = [
  { id: "general", label: "General Info" },
  { id: "clinical", label: "Clinical Profile" },
  { id: "homepage", label: "Homepage Sections" },
  { id: "social", label: "Social Media" },
  { id: "announcements", label: "Announcements" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const BIO_MAX = 1200;

const socialFields = [
  { key: "facebook" as const, label: "Facebook", placeholder: "https://facebook.com/yourpage", icon: "thumb_up", color: "#1877F2" },
  { key: "instagram" as const, label: "Instagram", placeholder: "https://instagram.com/yourhandle", icon: "photo_camera", color: "#E4405F" },
  { key: "linkedin" as const, label: "LinkedIn", placeholder: "https://linkedin.com/in/yourprofile", icon: "work", color: "#0077B5" },
  { key: "x" as const, label: "X (Twitter)", placeholder: "@yourhandle", icon: "close", color: "#191b23" },
  { key: "youtube" as const, label: "YouTube", placeholder: "https://youtube.com/c/yourchannel", icon: "play_circle", color: "#FF0000" },
  { key: "website" as const, label: "Website", placeholder: "https://yourclinic.com", icon: "language", color: "#0f766e" },
];

function isValidSocialValue(key: string, value: string) {
  if (!value.trim()) return true;
  if (key === "x") return /^@?[\w.]{1,30}$|^https?:\/\/.+/i.test(value);
  return /^https?:\/\/.+\..+/i.test(value);
}

const emptyEducationEntry: CmsEducationEntry = { name: "", institute: "", location: "", year: undefined };
const emptyJourneyEntry: CmsJourneyEntry = { role: "", place: "", period: "", detail: "" };

export default function CmsContent() {
  const doctorProfile = useDoctorProfile();
  const setDoctorProfile = useSetDoctorProfile();

  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [newCertification, setNewCertification] = useState("");
  const [uploadingWhyChooseIndex, setUploadingWhyChooseIndex] = useState<number | null>(null);
  const [uploadingGalleryIndex, setUploadingGalleryIndex] = useState<number | null>(null);
  const [uploadingPrepGuide, setUploadingPrepGuide] = useState(false);
  const prepGuideInputRef = useRef<HTMLInputElement>(null);
  const [uploadingProceduresHero, setUploadingProceduresHero] = useState(false);
  const [uploadingPrepGuideTileIndex, setUploadingPrepGuideTileIndex] = useState<number | null>(null);

  function buildFormState() {
    return {
      fullName: doctorProfile.name,
      designation: doctorProfile.designation,
      email: doctorProfile.contactEmail,
      phone: doctorProfile.contactPhone,
      whatsapp: doctorProfile.contactWhatsapp,
      biography: doctorProfile.about,
      experienceYears: doctorProfile.experienceYears,
      education: doctorProfile.education.length ? doctorProfile.education : [emptyEducationEntry],
      professionalJourney: doctorProfile.professionalJourney.length ? doctorProfile.professionalJourney : [emptyJourneyEntry],
      languages: doctorProfile.languagesSpoken,
      certifications: doctorProfile.professionalMemberships,
      social: {
        facebook: doctorProfile.social?.facebook ?? "",
        instagram: doctorProfile.social?.instagram ?? "",
        linkedin: doctorProfile.social?.linkedin ?? "",
        x: doctorProfile.social?.x ?? "",
        youtube: doctorProfile.social?.youtube ?? "",
        website: doctorProfile.social?.website ?? "",
      },
      whyChooseSubtitle: doctorProfile.whyChooseSubtitle,
      whyChooseFeatures: doctorProfile.whyChooseFeatures,
      careGalleryTitle: doctorProfile.careGalleryTitle,
      careGallerySubtitle: doctorProfile.careGallerySubtitle,
      careGalleryImages: doctorProfile.careGalleryImages,
      servicesTitle: doctorProfile.servicesTitle,
      servicesSubtitle: doctorProfile.servicesSubtitle,
      specializedServices: doctorProfile.specializedServices,
      proceduresHeroBadge: doctorProfile.proceduresHeroBadge,
      proceduresHeroTitle: doctorProfile.proceduresHeroTitle,
      proceduresHeroDescription: doctorProfile.proceduresHeroDescription,
      proceduresHeroCtaLabel: doctorProfile.proceduresHeroCtaLabel,
      prepGuideTitle: doctorProfile.prepGuideTitle,
      prepGuideDescription: doctorProfile.prepGuideDescription,
      prepGuideSteps: doctorProfile.prepGuideSteps,
      prepGuideTiles: doctorProfile.prepGuideTiles,
      footerDescription: doctorProfile.footerDescription,
      footerQuickLinksHeading: doctorProfile.footerQuickLinksHeading,
      footerQuickLinks: doctorProfile.footerQuickLinks,
      footerContactHeading: doctorProfile.footerContactHeading,
      footerLegalLinks: doctorProfile.footerLegalLinks,
      footerCopyrightText: doctorProfile.footerCopyrightText,
      clinicClosedMessageEn: doctorProfile.clinicClosedMessageEn,
      clinicClosedMessageUr: doctorProfile.clinicClosedMessageUr,
      generalAnnouncementMessageEn: doctorProfile.generalAnnouncementMessageEn,
      generalAnnouncementMessageUr: doctorProfile.generalAnnouncementMessageUr,
    };
  }

  const [form, setForm] = useState(buildFormState);

  const bioCount = form.biography.length;

  const availableLanguages = useMemo(
    () => Array.from(new Set([...doctorProfile.languagesSpoken, "Urdu", "Punjabi", "Arabic"])),
    [doctorProfile.languagesSpoken]
  );

  function toggleLanguage(lang: string) {
    setForm((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang) ? prev.languages.filter((l) => l !== lang) : [...prev.languages, lang],
    }));
  }

  function addCertification() {
    const value = newCertification.trim();
    if (!value || form.certifications.includes(value)) return;
    setForm((prev) => ({ ...prev, certifications: [...prev.certifications, value] }));
    setNewCertification("");
  }

  function removeCertification(item: string) {
    setForm((prev) => ({ ...prev, certifications: prev.certifications.filter((c) => c !== item) }));
  }

  function updateEducationEntry(index: number, patch: Partial<CmsEducationEntry>) {
    setForm((prev) => ({
      ...prev,
      education: prev.education.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
    }));
  }

  function addEducationEntry() {
    setForm((prev) => ({ ...prev, education: [...prev.education, { ...emptyEducationEntry }] }));
  }

  function removeEducationEntry(index: number) {
    setForm((prev) => ({ ...prev, education: prev.education.filter((_, i) => i !== index) }));
  }

  function updateJourneyEntry(index: number, patch: Partial<CmsJourneyEntry>) {
    setForm((prev) => ({
      ...prev,
      professionalJourney: prev.professionalJourney.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
    }));
  }

  function addJourneyEntry() {
    setForm((prev) => ({ ...prev, professionalJourney: [...prev.professionalJourney, { ...emptyJourneyEntry }] }));
  }

  function removeJourneyEntry(index: number) {
    setForm((prev) => ({ ...prev, professionalJourney: prev.professionalJourney.filter((_, i) => i !== index) }));
  }

  function updateWhyChooseFeature(index: number, patch: Partial<CmsWhyChooseFeature>) {
    setForm((prev) => ({
      ...prev,
      whyChooseFeatures: prev.whyChooseFeatures.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
    }));
  }

  function addWhyChooseFeature() {
    setForm((prev) => ({
      ...prev,
      whyChooseFeatures: [...prev.whyChooseFeatures, { icon: "star", title: "", desc: "", image: "" }],
    }));
  }

  function removeWhyChooseFeature(index: number) {
    setForm((prev) => ({ ...prev, whyChooseFeatures: prev.whyChooseFeatures.filter((_, i) => i !== index) }));
  }

  async function handleWhyChooseImageChange(index: number, file: File) {
    setUploadingWhyChooseIndex(index);
    try {
      const formData = new FormData();
      formData.append("index", String(index));
      formData.append("file", file);
      const res = await fetch("/api/cms/why-choose-image", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not upload image");
        return;
      }
      setDoctorProfile(data.cms);
      const updatedFeature: CmsWhyChooseFeature = data.cms.whyChooseFeatures[index];
      setForm((prev) => ({
        ...prev,
        // Patch only this index — replacing the whole array would drop any other
        // locally-added card the admin hasn't uploaded an image for yet.
        whyChooseFeatures: prev.whyChooseFeatures.map((entry, i) => (i === index ? updatedFeature : entry)),
      }));
      toast.success("Feature image updated");
    } catch {
      toast.error("Network error while uploading image");
    } finally {
      setUploadingWhyChooseIndex(null);
    }
  }

  function updateGalleryImage(index: number, patch: Partial<CmsGalleryImage>) {
    setForm((prev) => ({
      ...prev,
      careGalleryImages: prev.careGalleryImages.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
    }));
  }

  function addGalleryImage() {
    setForm((prev) => ({ ...prev, careGalleryImages: [...prev.careGalleryImages, { image: "", label: "" }] }));
  }

  function removeGalleryImage(index: number) {
    setForm((prev) => ({ ...prev, careGalleryImages: prev.careGalleryImages.filter((_, i) => i !== index) }));
  }

  function updateSpecializedService(index: number, patch: Partial<CmsSpecializedService>) {
    setForm((prev) => ({
      ...prev,
      specializedServices: prev.specializedServices.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
    }));
  }

  function addSpecializedService() {
    setForm((prev) => ({
      ...prev,
      specializedServices: [...prev.specializedServices, { icon: "medical_services", title: "", desc: "" }],
    }));
  }

  function removeSpecializedService(index: number) {
    setForm((prev) => ({ ...prev, specializedServices: prev.specializedServices.filter((_, i) => i !== index) }));
  }

  async function handleGalleryImageChange(index: number, file: File) {
    setUploadingGalleryIndex(index);
    try {
      const formData = new FormData();
      formData.append("index", String(index));
      formData.append("file", file);
      const res = await fetch("/api/cms/care-gallery-image", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not upload image");
        return;
      }
      setDoctorProfile(data.cms);
      const updatedImage: CmsGalleryImage = data.cms.careGalleryImages[index];
      setForm((prev) => ({
        ...prev,
        // Patch only this index — see the equivalent comment in handleWhyChooseImageChange.
        careGalleryImages: prev.careGalleryImages.map((entry, i) => (i === index ? updatedImage : entry)),
      }));
      toast.success("Gallery image updated");
    } catch {
      toast.error("Network error while uploading image");
    } finally {
      setUploadingGalleryIndex(null);
    }
  }

  function updatePrepGuideStep(index: number, patch: Partial<CmsPrepGuideStep>) {
    setForm((prev) => ({
      ...prev,
      prepGuideSteps: prev.prepGuideSteps.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
    }));
  }

  function addPrepGuideStep() {
    setForm((prev) => ({ ...prev, prepGuideSteps: [...prev.prepGuideSteps, { title: "", desc: "" }] }));
  }

  function removePrepGuideStep(index: number) {
    setForm((prev) => ({ ...prev, prepGuideSteps: prev.prepGuideSteps.filter((_, i) => i !== index) }));
  }

  function updatePrepGuideTile(index: number, patch: Partial<CmsPrepGuideTile>) {
    setForm((prev) => ({
      ...prev,
      prepGuideTiles: prev.prepGuideTiles.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
    }));
  }

  function addPrepGuideTile() {
    setForm((prev) => ({
      ...prev,
      prepGuideTiles: [...prev.prepGuideTiles, { icon: "verified_user", label: "", image: "" }],
    }));
  }

  function removePrepGuideTile(index: number) {
    setForm((prev) => ({ ...prev, prepGuideTiles: prev.prepGuideTiles.filter((_, i) => i !== index) }));
  }

  async function handlePrepGuideTileImageChange(index: number, file: File) {
    setUploadingPrepGuideTileIndex(index);
    try {
      const formData = new FormData();
      formData.append("index", String(index));
      formData.append("file", file);
      const res = await fetch("/api/cms/prep-guide-tile-image", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not upload image");
        return;
      }
      setDoctorProfile(data.cms);
      const updatedTile: CmsPrepGuideTile = data.cms.prepGuideTiles[index];
      setForm((prev) => ({
        ...prev,
        // Patch only this index — see the equivalent comment in handleWhyChooseImageChange.
        prepGuideTiles: prev.prepGuideTiles.map((entry, i) => (i === index ? updatedTile : entry)),
      }));
      toast.success("Tile image updated");
    } catch {
      toast.error("Network error while uploading image");
    } finally {
      setUploadingPrepGuideTileIndex(null);
    }
  }

  async function handleProceduresHeroImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingProceduresHero(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/cms/procedures-hero-image", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not upload image");
        return;
      }
      setDoctorProfile(data.cms);
      toast.success("Hero image updated");
    } catch {
      toast.error("Network error while uploading image");
    } finally {
      setUploadingProceduresHero(false);
      e.target.value = "";
    }
  }

  function updateFooterQuickLink(index: number, patch: Partial<CmsFooterLink>) {
    setForm((prev) => ({
      ...prev,
      footerQuickLinks: prev.footerQuickLinks.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
    }));
  }

  function addFooterQuickLink() {
    setForm((prev) => ({ ...prev, footerQuickLinks: [...prev.footerQuickLinks, { label: "", href: "#" }] }));
  }

  function removeFooterQuickLink(index: number) {
    setForm((prev) => ({ ...prev, footerQuickLinks: prev.footerQuickLinks.filter((_, i) => i !== index) }));
  }

  function updateFooterLegalLink(index: number, patch: Partial<CmsFooterLink>) {
    setForm((prev) => ({
      ...prev,
      footerLegalLinks: prev.footerLegalLinks.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
    }));
  }

  function addFooterLegalLink() {
    setForm((prev) => ({ ...prev, footerLegalLinks: [...prev.footerLegalLinks, { label: "", href: "#" }] }));
  }

  function removeFooterLegalLink(index: number) {
    setForm((prev) => ({ ...prev, footerLegalLinks: prev.footerLegalLinks.filter((_, i) => i !== index) }));
  }

  function handleDiscard() {
    setForm(buildFormState());
    toast.info("Changes discarded");
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/cms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.fullName,
          designation: form.designation,
          contactEmail: form.email,
          contactPhone: form.phone,
          contactWhatsapp: form.whatsapp,
          about: form.biography,
          experienceYears: form.experienceYears,
          education: form.education.filter((e) => e.name.trim()),
          professionalJourney: form.professionalJourney.filter((j) => j.role.trim()),
          languagesSpoken: form.languages,
          professionalMemberships: form.certifications,
          social: form.social,
          whyChooseSubtitle: form.whyChooseSubtitle,
          whyChooseFeatures: form.whyChooseFeatures.filter((f) => f.title.trim() && f.image.trim()),
          careGalleryTitle: form.careGalleryTitle,
          careGallerySubtitle: form.careGallerySubtitle,
          careGalleryImages: form.careGalleryImages.filter((g) => g.image.trim()),
          servicesTitle: form.servicesTitle,
          servicesSubtitle: form.servicesSubtitle,
          specializedServices: form.specializedServices.filter((s) => s.title.trim()),
          proceduresHeroBadge: form.proceduresHeroBadge,
          proceduresHeroTitle: form.proceduresHeroTitle,
          proceduresHeroDescription: form.proceduresHeroDescription,
          proceduresHeroCtaLabel: form.proceduresHeroCtaLabel,
          prepGuideTitle: form.prepGuideTitle,
          prepGuideDescription: form.prepGuideDescription,
          prepGuideSteps: form.prepGuideSteps.filter((s) => s.title.trim()),
          prepGuideTiles: form.prepGuideTiles.filter((t) => t.label.trim()),
          footerDescription: form.footerDescription,
          footerQuickLinksHeading: form.footerQuickLinksHeading,
          footerQuickLinks: form.footerQuickLinks.filter((l) => l.label.trim()),
          footerContactHeading: form.footerContactHeading,
          footerLegalLinks: form.footerLegalLinks.filter((l) => l.label.trim()),
          footerCopyrightText: form.footerCopyrightText,
          clinicClosedMessageEn: form.clinicClosedMessageEn,
          clinicClosedMessageUr: form.clinicClosedMessageUr,
          generalAnnouncementMessageEn: form.generalAnnouncementMessageEn,
          generalAnnouncementMessageUr: form.generalAnnouncementMessageUr,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not save changes");
        return;
      }
      setDoctorProfile(data.cms);
      toast.success("Changes published");
    } catch {
      toast.error("Network error while saving");
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/cms/photo", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not upload photo");
        return;
      }
      setDoctorProfile(data.cms);
      toast.success("Profile photo updated");
    } catch {
      toast.error("Network error while uploading photo");
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/cms/logo", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not upload logo");
        return;
      }
      setDoctorProfile(data.cms);
      toast.success("Website logo updated");
    } catch {
      toast.error("Network error while uploading logo");
    } finally {
      setUploadingLogo(false);
      e.target.value = "";
    }
  }

  async function handlePrepGuideChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPrepGuide(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/cms/prep-guide-pdf", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not upload PDF");
        return;
      }
      setDoctorProfile(data.cms);
      toast.success("Preparation guide PDF updated");
    } catch {
      toast.error("Network error while uploading PDF");
    } finally {
      setUploadingPrepGuide(false);
      e.target.value = "";
    }
  }

  return (
    <div className="px-gutter py-lg overflow-y-auto h-[calc(100vh-72px)]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-md mb-lg">
          <div>
            <h2 className="text-headline-lg font-bold text-on-surface">Website Content Manager</h2>
            <p className="text-on-surface-variant text-body-md mt-xs">Update your public clinical profile and digital presence in real-time.</p>
          </div>
          <div className="flex gap-sm">
            <button
              onClick={handleDiscard}
              disabled={saving}
              className="px-md py-sm rounded-xl border border-outline-variant text-on-surface font-semibold hover:bg-surface-container-low transition-colors disabled:opacity-50"
            >
              Discard Changes
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-md py-sm rounded-xl font-bold shadow-lg transition-all flex items-center gap-xs bg-primary text-on-primary hover:brightness-110 disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[20px]">{saving ? "sync" : "publish"}</span>
              {saving ? "Saving..." : "Publish Changes"}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-lg border-b border-outline-variant mb-xl overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`pb-md px-xs text-label-md font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === t.id ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-primary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: General Info */}
        {activeTab === "general" && (
          <div className="grid grid-cols-12 gap-gutter">
            {/* Profile Card + Logo */}
            <div className="col-span-12 lg:col-span-4 space-y-md">
              <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm text-center">
                <div className="relative inline-block mb-md group">
                  <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-surface-container shadow-inner relative mx-auto">
                    <Image src={doctorProfile.profileImage} alt={doctorProfile.name} fill className="object-cover" unoptimized />
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-on-primary cursor-pointer w-full"
                    >
                      <span className="material-symbols-outlined text-[28px]">{uploadingPhoto ? "sync" : "photo_camera"}</span>
                      <span className="text-xs font-bold uppercase mt-xs">{uploadingPhoto ? "Uploading..." : "Replace"}</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="absolute bottom-1 right-1 bg-primary text-on-primary p-2 rounded-full shadow-lg hover:scale-105 transition-transform"
                  >
                    <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                  </button>
                  <input ref={photoInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handlePhotoChange} />
                </div>
                <h3 className="text-headline-md font-semibold text-on-surface">{form.fullName}</h3>
                <div className="flex items-center justify-center gap-xs text-primary-container font-label-md mt-xs">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  {doctorProfile.verification}
                </div>
                <p className="text-caption text-on-surface-variant mt-md">Max size: 5MB. Recommended: 800x800px JPG/PNG</p>
              </div>

              {/* Website Logo */}
              <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm text-center">
                <h4 className="text-label-md text-on-surface mb-md font-semibold text-left">Website Logo</h4>
                <div className="w-full h-24 rounded-lg border border-dashed border-outline-variant bg-surface flex items-center justify-center overflow-hidden relative mb-sm">
                  {doctorProfile.logoUrl ? (
                    <Image src={doctorProfile.logoUrl} alt="Website logo" fill className="object-contain p-sm" unoptimized />
                  ) : (
                    <span className="material-symbols-outlined text-on-surface-variant text-3xl">image</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="w-full py-sm border border-outline-variant rounded-lg text-on-surface-variant text-caption font-semibold hover:border-primary hover:text-primary transition-all disabled:opacity-50"
                >
                  {uploadingLogo ? "Uploading..." : "Replace Logo"}
                </button>
                <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogoChange} />
              </div>
            </div>

            {/* Basic Information */}
            <div className="col-span-12 lg:col-span-8 space-y-md">
              <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm">
                <h4 className="text-label-md text-on-surface mb-md font-semibold">Basic Information</h4>
                <div className="grid grid-cols-2 gap-md">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-caption text-on-surface-variant mb-xs ml-xs">Full Name</label>
                    <input
                      value={form.fullName}
                      onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                      className="w-full bg-surface border border-outline-variant rounded-lg p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      type="text"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-caption text-on-surface-variant mb-xs ml-xs">Designation</label>
                    <input
                      value={form.designation}
                      onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))}
                      className="w-full bg-surface border border-outline-variant rounded-lg p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      type="text"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-caption text-on-surface-variant mb-xs ml-xs">Contact Email</label>
                    <input
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      className="w-full bg-surface border border-outline-variant rounded-lg p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      type="email"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-caption text-on-surface-variant mb-xs ml-xs">Phone Number</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                      className="w-full bg-surface border border-outline-variant rounded-lg p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      type="tel"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-caption text-on-surface-variant mb-xs ml-xs">WhatsApp Business</label>
                    <input
                      value={form.whatsapp}
                      onChange={(e) => setForm((p) => ({ ...p, whatsapp: e.target.value }))}
                      className="w-full bg-surface border border-outline-variant rounded-lg p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      type="tel"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Clinical Profile */}
        {activeTab === "clinical" && (
          <div className="grid grid-cols-12 gap-gutter">
            <div className="col-span-12 lg:col-span-8 space-y-gutter">
              {/* Biography */}
              <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant shadow-sm">
                <div className="flex items-center gap-xs mb-md">
                  <span className="material-symbols-outlined text-primary">history_edu</span>
                  <h3 className="text-[18px] font-bold text-on-surface">Biography</h3>
                </div>
                <textarea
                  value={form.biography}
                  onChange={(e) => setForm((p) => ({ ...p, biography: e.target.value.slice(0, BIO_MAX) }))}
                  placeholder="Describe your medical philosophy, training, and commitment to patient care..."
                  rows={7}
                  className="w-full p-sm bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-body-md"
                />
                <p className="text-caption text-on-surface-variant mt-xs text-right">{bioCount} / {BIO_MAX} characters</p>
              </div>

              {/* Education & Qualifications */}
              <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant shadow-sm">
                <div className="flex items-center gap-xs mb-md">
                  <span className="material-symbols-outlined text-primary">school</span>
                  <h3 className="text-[18px] font-bold text-on-surface">Education &amp; Qualifications</h3>
                </div>
                <div className="space-y-md">
                  {form.education.map((entry, i) => (
                    <div key={i} className="flex gap-sm items-start pb-md border-b border-outline-variant last:border-0 last:pb-0">
                      <div className="w-10 h-10 rounded bg-surface flex-shrink-0 flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-surface-variant">school</span>
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-sm">
                        <input
                          value={entry.name}
                          onChange={(e) => updateEducationEntry(i, { name: e.target.value })}
                          placeholder="Qualification name (e.g. M.B.B.S.)"
                          className="col-span-2 bg-surface border border-outline-variant rounded-lg p-sm text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                        <input
                          value={entry.institute ?? ""}
                          onChange={(e) => updateEducationEntry(i, { institute: e.target.value })}
                          placeholder="Institute"
                          className="bg-surface border border-outline-variant rounded-lg p-sm text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                        <input
                          value={entry.location ?? ""}
                          onChange={(e) => updateEducationEntry(i, { location: e.target.value })}
                          placeholder="Location (city, country)"
                          className="bg-surface border border-outline-variant rounded-lg p-sm text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                        <input
                          value={entry.year ?? ""}
                          onChange={(e) => updateEducationEntry(i, { year: e.target.value ? Number(e.target.value) : undefined })}
                          placeholder="Year"
                          type="number"
                          className="col-span-2 md:col-span-1 bg-surface border border-outline-variant rounded-lg p-sm text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEducationEntry(i)}
                        className="p-xs hover:bg-error/10 rounded-full text-error transition-colors shrink-0"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addEducationEntry}
                    className="w-full py-sm border border-dashed border-outline-variant rounded-lg text-on-surface-variant text-caption hover:border-primary hover:text-primary transition-all"
                  >
                    + Add New Education
                  </button>
                </div>
              </div>

              {/* Professional Journey */}
              <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant shadow-sm">
                <div className="flex items-center gap-xs mb-md">
                  <span className="material-symbols-outlined text-primary">timeline</span>
                  <h3 className="text-[18px] font-bold text-on-surface">Professional Journey</h3>
                </div>
                <div className="space-y-md">
                  {form.professionalJourney.map((entry, i) => (
                    <div key={i} className="flex gap-sm items-start pb-md border-b border-outline-variant last:border-0 last:pb-0">
                      <div className="w-10 h-10 rounded bg-surface flex-shrink-0 flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-surface-variant">work_history</span>
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-sm">
                        <input
                          value={entry.role}
                          onChange={(e) => updateJourneyEntry(i, { role: e.target.value })}
                          placeholder="Role (e.g. Senior Consultant)"
                          className="col-span-2 bg-surface border border-outline-variant rounded-lg p-sm text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                        <input
                          value={entry.place ?? ""}
                          onChange={(e) => updateJourneyEntry(i, { place: e.target.value })}
                          placeholder="Place"
                          className="bg-surface border border-outline-variant rounded-lg p-sm text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                        <input
                          value={entry.period ?? ""}
                          onChange={(e) => updateJourneyEntry(i, { period: e.target.value })}
                          placeholder="Period (e.g. 2021 — Present)"
                          className="bg-surface border border-outline-variant rounded-lg p-sm text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                        <textarea
                          value={entry.detail ?? ""}
                          onChange={(e) => updateJourneyEntry(i, { detail: e.target.value })}
                          placeholder="Detail"
                          rows={2}
                          className="col-span-2 bg-surface border border-outline-variant rounded-lg p-sm text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeJourneyEntry(i)}
                        className="p-xs hover:bg-error/10 rounded-full text-error transition-colors shrink-0"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addJourneyEntry}
                    className="w-full py-sm border border-dashed border-outline-variant rounded-lg text-on-surface-variant text-caption hover:border-primary hover:text-primary transition-all"
                  >
                    + Add Journey Entry
                  </button>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-gutter">
              {/* Experience Years */}
              <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant shadow-sm">
                <div className="flex items-center gap-xs mb-md">
                  <span className="material-symbols-outlined text-primary">work_history</span>
                  <h3 className="text-[18px] font-bold text-on-surface">Experience</h3>
                </div>
                <label className="block text-caption text-on-surface-variant mb-xs">Years of Clinical Experience</label>
                <input
                  value={form.experienceYears}
                  onChange={(e) => setForm((p) => ({ ...p, experienceYears: Number(e.target.value) || 0 }))}
                  type="number"
                  min={0}
                  className="w-full bg-surface border border-outline-variant rounded-lg p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>

              {/* Languages */}
              <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant shadow-sm">
                <div className="flex items-center gap-xs mb-md">
                  <span className="material-symbols-outlined text-primary">translate</span>
                  <h3 className="text-[18px] font-bold text-on-surface">Languages</h3>
                </div>
                <div className="space-y-xs">
                  {availableLanguages.map((lang) => (
                    <label key={lang} className="flex items-center gap-sm p-xs rounded-lg hover:bg-surface-container-low cursor-pointer transition-colors group">
                      <input
                        type="checkbox"
                        checked={form.languages.includes(lang)}
                        onChange={() => toggleLanguage(lang)}
                        className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20"
                      />
                      <span className="text-body-md text-on-surface group-hover:text-primary">{lang}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant shadow-sm">
                <div className="flex items-center gap-xs mb-md">
                  <span className="material-symbols-outlined text-primary">card_membership</span>
                  <h3 className="text-[18px] font-bold text-on-surface">Certifications</h3>
                </div>
                <div className="min-h-[100px] p-xs bg-surface border border-outline-variant rounded-lg flex flex-wrap gap-xs content-start focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  {form.certifications.map((item) => (
                    <span key={item} className="inline-flex items-center gap-xs px-sm py-1 bg-primary/10 text-primary text-caption font-bold rounded-full border border-primary/20">
                      {item}
                      <button onClick={() => removeCertification(item)} className="hover:text-error transition-colors">
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </span>
                  ))}
                  <input
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCertification();
                      }
                    }}
                    className="flex-grow bg-transparent border-none focus:ring-0 p-0 text-body-md min-w-[100px]"
                    placeholder="Add membership..."
                    type="text"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Homepage Sections */}
        {activeTab === "homepage" && (
          <div className="space-y-gutter">
            {/* Why Choose Us */}
            <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant shadow-sm">
              <div className="flex items-center gap-xs mb-md">
                <span className="material-symbols-outlined text-primary">stars</span>
                <h3 className="text-[18px] font-bold text-on-surface">Why Choose {form.fullName || "Us"}?</h3>
              </div>
              <label className="block text-caption text-on-surface-variant mb-xs">Subtitle</label>
              <input
                value={form.whyChooseSubtitle}
                onChange={(e) => setForm((p) => ({ ...p, whyChooseSubtitle: e.target.value }))}
                placeholder="Setting new benchmarks in gastrointestinal health through expertise and empathy."
                className="w-full bg-surface border border-outline-variant rounded-lg p-sm mb-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-body-md"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                {form.whyChooseFeatures.map((feature, i) => (
                  <div key={i} className="flex gap-sm items-start p-sm border border-outline-variant rounded-lg">
                    <label className="relative w-16 h-16 rounded-lg overflow-hidden bg-surface border border-outline-variant shrink-0 cursor-pointer group">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleWhyChooseImageChange(i, file);
                        }}
                      />
                      {feature.image ? (
                        <Image src={feature.image} alt={feature.title || "Feature"} fill className="object-cover" unoptimized />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center text-outline">
                          <span className="material-symbols-outlined">add_photo_alternate</span>
                        </span>
                      )}
                      <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-[18px]">
                          {uploadingWhyChooseIndex === i ? "progress_activity" : "upload"}
                        </span>
                      </span>
                    </label>
                    <div className="flex-1 grid grid-cols-2 gap-sm">
                      <IconPicker
                        value={feature.icon}
                        onChange={(icon) => updateWhyChooseFeature(i, { icon })}
                      />
                      <input
                        value={feature.title}
                        onChange={(e) => updateWhyChooseFeature(i, { title: e.target.value })}
                        placeholder="Title"
                        className="bg-surface border border-outline-variant rounded-lg p-sm text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      />
                      <textarea
                        value={feature.desc ?? ""}
                        onChange={(e) => updateWhyChooseFeature(i, { desc: e.target.value })}
                        placeholder="Description"
                        rows={2}
                        className="col-span-2 bg-surface border border-outline-variant rounded-lg p-sm text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeWhyChooseFeature(i)}
                      className="p-xs hover:bg-error/10 rounded-full text-error transition-colors shrink-0"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addWhyChooseFeature}
                className="w-full mt-md py-sm border border-dashed border-outline-variant rounded-lg text-on-surface-variant text-caption hover:border-primary hover:text-primary transition-all"
              >
                + Add Feature
              </button>
            </div>

            {/* Care You Can See gallery */}
            <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant shadow-sm">
              <div className="flex items-center gap-xs mb-md">
                <span className="material-symbols-outlined text-primary">photo_library</span>
                <h3 className="text-[18px] font-bold text-on-surface">Care &amp; Facility Gallery</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm mb-md">
                <div>
                  <label className="block text-caption text-on-surface-variant mb-xs">Section Title</label>
                  <input
                    value={form.careGalleryTitle}
                    onChange={(e) => setForm((p) => ({ ...p, careGalleryTitle: e.target.value }))}
                    placeholder="Care You Can See"
                    className="w-full bg-surface border border-outline-variant rounded-lg p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-body-md"
                  />
                </div>
                <div>
                  <label className="block text-caption text-on-surface-variant mb-xs">Subtitle</label>
                  <input
                    value={form.careGallerySubtitle}
                    onChange={(e) => setForm((p) => ({ ...p, careGallerySubtitle: e.target.value }))}
                    placeholder="A calm, modern environment designed around patient comfort."
                    className="w-full bg-surface border border-outline-variant rounded-lg p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-body-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
                {form.careGalleryImages.map((img, i) => (
                  <div key={i} className="p-sm border border-outline-variant rounded-lg space-y-sm">
                    <label className="relative block w-full h-32 rounded-lg overflow-hidden bg-surface border border-outline-variant cursor-pointer group">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleGalleryImageChange(i, file);
                        }}
                      />
                      {img.image ? (
                        <Image src={img.image} alt={img.label || "Gallery image"} fill className="object-cover" unoptimized />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center text-outline">
                          <span className="material-symbols-outlined">add_photo_alternate</span>
                        </span>
                      )}
                      <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-[18px]">
                          {uploadingGalleryIndex === i ? "progress_activity" : "upload"}
                        </span>
                      </span>
                    </label>
                    <div className="flex gap-sm items-center">
                      <input
                        value={img.label ?? ""}
                        onChange={(e) => updateGalleryImage(i, { label: e.target.value })}
                        placeholder="Caption (e.g. Modern Facilities)"
                        className="flex-1 bg-surface border border-outline-variant rounded-lg p-sm text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(i)}
                        className="p-xs hover:bg-error/10 rounded-full text-error transition-colors shrink-0"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addGalleryImage}
                className="w-full mt-md py-sm border border-dashed border-outline-variant rounded-lg text-on-surface-variant text-caption hover:border-primary hover:text-primary transition-all"
              >
                + Add Image
              </button>
            </div>

            {/* Specialized Services */}
            <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant shadow-sm">
              <div className="flex items-center gap-xs mb-md">
                <span className="material-symbols-outlined text-primary">medical_services</span>
                <h3 className="text-[18px] font-bold text-on-surface">Specialized Services</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md mb-md">
                <div>
                  <label className="block text-caption text-on-surface-variant mb-xs">Section Title</label>
                  <input
                    value={form.servicesTitle}
                    onChange={(e) => setForm((p) => ({ ...p, servicesTitle: e.target.value }))}
                    placeholder="Specialized Services"
                    className="w-full bg-surface border border-outline-variant rounded-lg p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-body-md"
                  />
                </div>
                <div>
                  <label className="block text-caption text-on-surface-variant mb-xs">Subtitle</label>
                  <input
                    value={form.servicesSubtitle}
                    onChange={(e) => setForm((p) => ({ ...p, servicesSubtitle: e.target.value }))}
                    placeholder="Comprehensive care for all digestive health issues..."
                    className="w-full bg-surface border border-outline-variant rounded-lg p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-body-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                {form.specializedServices.map((service, i) => (
                  <div key={i} className="flex gap-sm items-start p-sm border border-outline-variant rounded-lg">
                    <div className="w-10 h-10 rounded bg-surface flex-shrink-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface-variant">
                        {service.icon || "medical_services"}
                      </span>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-sm">
                      <IconPicker
                        value={service.icon}
                        onChange={(icon) => updateSpecializedService(i, { icon })}
                      />
                      <input
                        value={service.title}
                        onChange={(e) => updateSpecializedService(i, { title: e.target.value })}
                        placeholder="Service name"
                        className="bg-surface border border-outline-variant rounded-lg p-sm text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      />
                      <textarea
                        value={service.desc ?? ""}
                        onChange={(e) => updateSpecializedService(i, { desc: e.target.value })}
                        placeholder="Description"
                        rows={2}
                        className="col-span-2 bg-surface border border-outline-variant rounded-lg p-sm text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSpecializedService(i)}
                      className="p-xs hover:bg-error/10 rounded-full text-error transition-colors shrink-0"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addSpecializedService}
                className="w-full mt-md py-sm border border-dashed border-outline-variant rounded-lg text-on-surface-variant text-caption hover:border-primary hover:text-primary transition-all"
              >
                + Add Service
              </button>
            </div>

            {/* Procedures Page Hero */}
            <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant shadow-sm">
              <div className="flex items-center gap-xs mb-md">
                <span className="material-symbols-outlined text-primary">medical_information</span>
                <h3 className="text-[18px] font-bold text-on-surface">Procedures Page Hero</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-md items-start">
                <div className="space-y-sm">
                  <div>
                    <label className="block text-caption text-on-surface-variant mb-xs">Badge Text</label>
                    <input
                      value={form.proceduresHeroBadge}
                      onChange={(e) => setForm((p) => ({ ...p, proceduresHeroBadge: e.target.value }))}
                      placeholder="PREMIUM CLINICAL SERVICES"
                      className="w-full bg-surface border border-outline-variant rounded-lg p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-body-md"
                    />
                  </div>
                  <div>
                    <label className="block text-caption text-on-surface-variant mb-xs">Heading</label>
                    <input
                      value={form.proceduresHeroTitle}
                      onChange={(e) => setForm((p) => ({ ...p, proceduresHeroTitle: e.target.value }))}
                      placeholder="Procedures & Transparency"
                      className="w-full bg-surface border border-outline-variant rounded-lg p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-body-md"
                    />
                  </div>
                  <div>
                    <label className="block text-caption text-on-surface-variant mb-xs">Description</label>
                    <textarea
                      value={form.proceduresHeroDescription}
                      onChange={(e) => setForm((p) => ({ ...p, proceduresHeroDescription: e.target.value }))}
                      placeholder="Specialized gastroenterology care with transparent pricing..."
                      rows={3}
                      className="w-full bg-surface border border-outline-variant rounded-lg p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-body-md resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-caption text-on-surface-variant mb-xs">Button Label</label>
                    <input
                      value={form.proceduresHeroCtaLabel}
                      onChange={(e) => setForm((p) => ({ ...p, proceduresHeroCtaLabel: e.target.value }))}
                      placeholder="Book a Procedure"
                      className="w-full bg-surface border border-outline-variant rounded-lg p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-body-md"
                    />
                  </div>
                </div>
                <label className="relative block w-full md:w-48 h-32 rounded-lg overflow-hidden bg-surface border border-outline-variant cursor-pointer group shrink-0">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleProceduresHeroImageChange}
                  />
                  {doctorProfile.proceduresHeroImage ? (
                    <Image src={doctorProfile.proceduresHeroImage} alt="Procedures hero" fill className="object-cover" unoptimized />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-outline">
                      <span className="material-symbols-outlined">add_photo_alternate</span>
                    </span>
                  )}
                  <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-[18px]">
                      {uploadingProceduresHero ? "progress_activity" : "upload"}
                    </span>
                  </span>
                </label>
              </div>
            </div>

            {/* Preparation Guide */}
            <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant shadow-sm">
              <div className="flex items-center gap-xs mb-md">
                <span className="material-symbols-outlined text-primary">checklist</span>
                <h3 className="text-[18px] font-bold text-on-surface">Preparation Guide</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm mb-md">
                <div>
                  <label className="block text-caption text-on-surface-variant mb-xs">Heading</label>
                  <input
                    value={form.prepGuideTitle}
                    onChange={(e) => setForm((p) => ({ ...p, prepGuideTitle: e.target.value }))}
                    placeholder="Preparation Guide"
                    className="w-full bg-surface border border-outline-variant rounded-lg p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-body-md"
                  />
                </div>
                <div>
                  <label className="block text-caption text-on-surface-variant mb-xs">Description</label>
                  <input
                    value={form.prepGuideDescription}
                    onChange={(e) => setForm((p) => ({ ...p, prepGuideDescription: e.target.value }))}
                    placeholder="Accurate results depend on proper preparation..."
                    className="w-full bg-surface border border-outline-variant rounded-lg p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-body-md"
                  />
                </div>
              </div>

              <p className="text-caption text-on-surface-variant mb-xs font-semibold">Numbered Steps</p>
              <div className="space-y-sm mb-md">
                {form.prepGuideSteps.map((step, i) => (
                  <div key={i} className="flex gap-sm items-start p-sm border border-outline-variant rounded-lg">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-semibold text-caption">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="flex-1 space-y-sm">
                      <input
                        value={step.title}
                        onChange={(e) => updatePrepGuideStep(i, { title: e.target.value })}
                        placeholder="Step title"
                        className="w-full bg-surface border border-outline-variant rounded-lg p-sm text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      />
                      <textarea
                        value={step.desc ?? ""}
                        onChange={(e) => updatePrepGuideStep(i, { desc: e.target.value })}
                        placeholder="Step description"
                        rows={2}
                        className="w-full bg-surface border border-outline-variant rounded-lg p-sm text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removePrepGuideStep(i)}
                      className="p-xs hover:bg-error/10 rounded-full text-error transition-colors shrink-0"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addPrepGuideStep}
                className="w-full mb-lg py-sm border border-dashed border-outline-variant rounded-lg text-on-surface-variant text-caption hover:border-primary hover:text-primary transition-all"
              >
                + Add Step
              </button>

              <p className="text-caption text-on-surface-variant mb-xs font-semibold">Feature Tiles</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                {form.prepGuideTiles.map((tile, i) => (
                  <div key={i} className="flex gap-sm items-start p-sm border border-outline-variant rounded-lg">
                    <label className="relative w-16 h-16 rounded-lg overflow-hidden bg-surface border border-outline-variant shrink-0 cursor-pointer group">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePrepGuideTileImageChange(i, file);
                        }}
                      />
                      {tile.image ? (
                        <Image src={tile.image} alt={tile.label || "Tile"} fill className="object-cover" unoptimized />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center text-outline">
                          <span className="material-symbols-outlined">add_photo_alternate</span>
                        </span>
                      )}
                      <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-[18px]">
                          {uploadingPrepGuideTileIndex === i ? "progress_activity" : "upload"}
                        </span>
                      </span>
                    </label>
                    <div className="flex-1 grid grid-cols-2 gap-sm">
                      <IconPicker
                        value={tile.icon}
                        onChange={(icon) => updatePrepGuideTile(i, { icon })}
                      />
                      <input
                        value={tile.label}
                        onChange={(e) => updatePrepGuideTile(i, { label: e.target.value })}
                        placeholder="Label"
                        className="bg-surface border border-outline-variant rounded-lg p-sm text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removePrepGuideTile(i)}
                      className="p-xs hover:bg-error/10 rounded-full text-error transition-colors shrink-0"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addPrepGuideTile}
                className="w-full mt-md py-sm border border-dashed border-outline-variant rounded-lg text-on-surface-variant text-caption hover:border-primary hover:text-primary transition-all"
              >
                + Add Tile
              </button>
            </div>

            {/* Footer */}
            <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant shadow-sm">
              <div className="flex items-center gap-xs mb-md">
                <span className="material-symbols-outlined text-primary">web_asset</span>
                <h3 className="text-[18px] font-bold text-on-surface">Footer</h3>
              </div>

              <label className="block text-caption text-on-surface-variant mb-xs">Brand Description</label>
              <textarea
                value={form.footerDescription}
                onChange={(e) => setForm((p) => ({ ...p, footerDescription: e.target.value }))}
                placeholder="Consultant Gastroenterologist & Hepatologist providing world-class medical care..."
                rows={3}
                className="w-full bg-surface border border-outline-variant rounded-lg p-sm mb-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-body-md resize-none"
              />

              <label className="block text-caption text-on-surface-variant mb-xs">Copyright Text</label>
              <input
                value={form.footerCopyrightText}
                onChange={(e) => setForm((p) => ({ ...p, footerCopyrightText: e.target.value }))}
                placeholder="All rights reserved."
                className="w-full bg-surface border border-outline-variant rounded-lg p-sm mb-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-body-md"
              />
              <p className="text-caption text-on-surface-variant mb-lg -mt-sm">
                Shown as: &quot;© {new Date().getFullYear()} {form.fullName || "Doctor Name"}. {form.footerCopyrightText || "All rights reserved."}&quot;
              </p>

              <label className="block text-caption text-on-surface-variant mb-xs">Quick Links Heading</label>
              <input
                value={form.footerQuickLinksHeading}
                onChange={(e) => setForm((p) => ({ ...p, footerQuickLinksHeading: e.target.value }))}
                placeholder="Quick Links"
                className="w-full bg-surface border border-outline-variant rounded-lg p-sm mb-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-body-md"
              />
              <div className="space-y-sm mb-md">
                {form.footerQuickLinks.map((link, i) => (
                  <div key={i} className="flex gap-sm items-center">
                    <input
                      value={link.label}
                      onChange={(e) => updateFooterQuickLink(i, { label: e.target.value })}
                      placeholder="Label (e.g. Book Appointment)"
                      className="flex-1 bg-surface border border-outline-variant rounded-lg p-sm text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                    <input
                      value={link.href}
                      onChange={(e) => updateFooterQuickLink(i, { href: e.target.value })}
                      placeholder="Link (e.g. #hero)"
                      className="flex-1 bg-surface border border-outline-variant rounded-lg p-sm text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeFooterQuickLink(i)}
                      className="p-xs hover:bg-error/10 rounded-full text-error transition-colors shrink-0"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addFooterQuickLink}
                className="w-full mb-lg py-sm border border-dashed border-outline-variant rounded-lg text-on-surface-variant text-caption hover:border-primary hover:text-primary transition-all"
              >
                + Add Quick Link
              </button>

              <label className="block text-caption text-on-surface-variant mb-xs">Contact Section Heading</label>
              <input
                value={form.footerContactHeading}
                onChange={(e) => setForm((p) => ({ ...p, footerContactHeading: e.target.value }))}
                placeholder="Contact & Locations"
                className="w-full bg-surface border border-outline-variant rounded-lg p-sm mb-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-body-md"
              />

              <p className="text-caption text-on-surface-variant mb-xs font-semibold">Legal Links</p>
              <div className="space-y-sm mb-md">
                {form.footerLegalLinks.map((link, i) => (
                  <div key={i} className="flex gap-sm items-center">
                    <input
                      value={link.label}
                      onChange={(e) => updateFooterLegalLink(i, { label: e.target.value })}
                      placeholder="Label (e.g. Privacy Policy)"
                      className="flex-1 bg-surface border border-outline-variant rounded-lg p-sm text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                    <input
                      value={link.href}
                      onChange={(e) => updateFooterLegalLink(i, { href: e.target.value })}
                      placeholder="Link (e.g. /privacy-policy)"
                      className="flex-1 bg-surface border border-outline-variant rounded-lg p-sm text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeFooterLegalLink(i)}
                      className="p-xs hover:bg-error/10 rounded-full text-error transition-colors shrink-0"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addFooterLegalLink}
                className="w-full py-sm border border-dashed border-outline-variant rounded-lg text-on-surface-variant text-caption hover:border-primary hover:text-primary transition-all"
              >
                + Add Legal Link
              </button>
            </div>

            {/* Download Guide PDF */}
            <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant shadow-sm">
              <div className="flex items-center gap-xs mb-md">
                <span className="material-symbols-outlined text-primary">picture_as_pdf</span>
                <h3 className="text-[18px] font-bold text-on-surface">Download Guide (PDF)</h3>
              </div>
              <p className="text-caption text-on-surface-variant mb-md">
                Upload the PDF served by the &quot;Download Guide (PDF)&quot; button on the Services page. If no PDF is
                uploaded, a preparation guide is generated automatically instead.
              </p>
              <div className="flex items-center gap-md">
                <div className="w-14 h-14 rounded-lg border border-dashed border-outline-variant bg-surface flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-surface-variant text-2xl">
                    {doctorProfile.prepGuidePdfUrl ? "description" : "upload_file"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  {doctorProfile.prepGuidePdfUrl ? (
                    <a
                      href={doctorProfile.prepGuidePdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-body-sm font-semibold hover:underline truncate block"
                    >
                      View current PDF
                    </a>
                  ) : (
                    <span className="text-on-surface-variant text-body-sm">No PDF uploaded yet</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => prepGuideInputRef.current?.click()}
                  disabled={uploadingPrepGuide}
                  className="px-md py-sm border border-outline-variant rounded-lg text-on-surface-variant text-caption font-semibold hover:border-primary hover:text-primary transition-all disabled:opacity-50 shrink-0"
                >
                  {uploadingPrepGuide ? "Uploading..." : doctorProfile.prepGuidePdfUrl ? "Replace PDF" : "Upload PDF"}
                </button>
                <input
                  ref={prepGuideInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handlePrepGuideChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab: Announcements */}
        {activeTab === "announcements" && (
          <div className="space-y-lg max-w-3xl">
            <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant shadow-sm space-y-lg">
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary">campaign</span>
                <div>
                  <h3 className="text-[18px] font-bold text-on-surface">General Site-Wide Ticker</h3>
                  <p className="text-caption text-on-surface-variant">
                    Always shown as a scrolling ticker at the top of every page (in the site header) —
                    for general info, not tied to any clinic status. Leave both fields blank to hide it entirely.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div>
                  <label className="block text-caption text-on-surface-variant mb-xs">Message (Urdu)</label>
                  <textarea
                    value={form.generalAnnouncementMessageUr}
                    onChange={(e) => setForm((p) => ({ ...p, generalAnnouncementMessageUr: e.target.value }))}
                    placeholder="کوئی سوال یا استفسار ہے؟ کسی بھی وقت کلینک سے رابطہ کریں۔"
                    dir="rtl"
                    rows={3}
                    className="font-urdu w-full bg-surface border border-outline-variant rounded-lg p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-body-md resize-none"
                  />
                </div>
                <div>
                  <label className="block text-caption text-on-surface-variant mb-xs">Message (English)</label>
                  <textarea
                    value={form.generalAnnouncementMessageEn}
                    onChange={(e) => setForm((p) => ({ ...p, generalAnnouncementMessageEn: e.target.value }))}
                    placeholder="Have a question or query? Feel free to contact the doctor's clinic anytime."
                    rows={3}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-body-md resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant shadow-sm space-y-lg">
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-warning">campaign</span>
                <div>
                  <h3 className="text-[18px] font-bold text-on-surface">Clinic Closed Announcement Bar</h3>
                  <p className="text-caption text-on-surface-variant">
                    Shown only on the booking-appointment pages, when the selected clinic is closed today
                    based on that clinic&apos;s weekly schedule (Clinic Management → edit clinic → weekly hours).
                    Leave a field blank to use the built-in default message.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div>
                  <label className="block text-caption text-on-surface-variant mb-xs">Message (Urdu)</label>
                  <textarea
                    value={form.clinicClosedMessageUr}
                    onChange={(e) => setForm((p) => ({ ...p, clinicClosedMessageUr: e.target.value }))}
                    placeholder="📢 آج یہ کلینک بند ہے، لہٰذا آج کے لیے اپائنٹمنٹ بک نہیں کی جا سکتی۔"
                    dir="rtl"
                    rows={4}
                    className="font-urdu w-full bg-surface border border-outline-variant rounded-lg p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-body-md resize-none"
                  />
                </div>
                <div>
                  <label className="block text-caption text-on-surface-variant mb-xs">Message (English)</label>
                  <textarea
                    value={form.clinicClosedMessageEn}
                    onChange={(e) => setForm((p) => ({ ...p, clinicClosedMessageEn: e.target.value }))}
                    placeholder="📢 This clinic is closed today. Appointments cannot be booked for today."
                    rows={4}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-body-md resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Social Media */}
        {activeTab === "social" && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter items-start">
            <div className="xl:col-span-8">
              <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant shadow-sm space-y-lg">
                {socialFields.map((field) => {
                  const value = form.social[field.key];
                  const valid = isValidSocialValue(field.key, value);
                  return (
                    <div key={field.key} className="space-y-xs">
                      <label className="block text-label-md text-on-surface font-bold uppercase tracking-wider">{field.label}</label>
                      <div
                        className={`flex items-center bg-surface border rounded-lg transition-all ${
                          valid ? "border-outline-variant focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20" : "border-error focus-within:ring-2 focus-within:ring-error/20"
                        }`}
                      >
                        <div className="px-md border-r border-outline-variant flex items-center justify-center w-12 h-12 shrink-0 rounded-l-lg" style={{ color: field.color }}>
                          <span className="material-symbols-outlined">{field.icon}</span>
                        </div>
                        <input
                          value={value}
                          onChange={(e) => setForm((p) => ({ ...p, social: { ...p.social, [field.key]: e.target.value } }))}
                          placeholder={field.placeholder}
                          type="text"
                          className="w-full bg-transparent border-none py-sm px-md text-body-md focus:ring-0 outline-none"
                        />
                      </div>
                      {!valid && <p className="text-caption text-error ml-xs">Enter a valid {field.key === "x" ? "handle or URL" : "URL"}.</p>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="xl:col-span-4 bg-primary/5 p-md rounded-xl border border-primary/20 flex gap-sm items-start">
              <span className="material-symbols-outlined text-primary">info</span>
              <p className="text-caption text-primary leading-relaxed">
                These links will be displayed in the footer and contact sections of your public website. Ensure the URLs are correct to maintain professional credibility.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
