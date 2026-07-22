import { cache } from "react";
import { connectDB } from "../connection";
import Cms from "../models/Cms";
import { doctor } from "@/lib/data";

export interface CmsEducationEntry {
  name: string;
  institute?: string;
  location?: string;
  year?: number;
}

export interface CmsJourneyEntry {
  role: string;
  place?: string;
  period?: string;
  detail?: string;
}

export interface CmsSocialLinks {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  x?: string;
  youtube?: string;
  website?: string;
}

export interface CmsWhyChooseFeature {
  icon: string;
  title: string;
  desc?: string;
  image: string;
  imagePublicId?: string;
}

export interface CmsGalleryImage {
  image: string;
  imagePublicId?: string;
  label?: string;
}

export interface CmsSpecializedService {
  icon: string;
  title: string;
  desc?: string;
}

export interface CmsInput {
  name?: string;
  designation?: string;
  profileImage?: string;
  profileImagePublicId?: string;
  logoUrl?: string;
  logoPublicId?: string;
  verification?: string;
  about?: string;
  experienceYears?: number;
  city?: string;
  country?: string;
  specialization?: string[];
  professionalMemberships?: string[];
  languagesSpoken?: string[];
  education?: CmsEducationEntry[];
  professionalJourney?: CmsJourneyEntry[];
  contactEmail?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  social?: CmsSocialLinks;
  whyChooseSubtitle?: string;
  whyChooseFeatures?: CmsWhyChooseFeature[];
  careGalleryTitle?: string;
  careGallerySubtitle?: string;
  careGalleryImages?: CmsGalleryImage[];
  servicesTitle?: string;
  servicesSubtitle?: string;
  specializedServices?: CmsSpecializedService[];
  clinicClosedMessageEn?: string;
  clinicClosedMessageUr?: string;
  generalAnnouncementMessageEn?: string;
  generalAnnouncementMessageUr?: string;
}

export interface CmsProfile {
  _id: string;
  name: string;
  designation: string;
  profileImage: string;
  profileImagePublicId?: string;
  logoUrl: string;
  logoPublicId?: string;
  verification: string;
  about: string;
  experienceYears: number;
  city: string;
  country: string;
  specialization: string[];
  professionalMemberships: string[];
  languagesSpoken: string[];
  education: CmsEducationEntry[];
  professionalJourney: CmsJourneyEntry[];
  contactEmail: string;
  contactPhone: string;
  contactWhatsapp: string;
  social: CmsSocialLinks;
  whyChooseSubtitle: string;
  whyChooseFeatures: CmsWhyChooseFeature[];
  careGalleryTitle: string;
  careGallerySubtitle: string;
  careGalleryImages: CmsGalleryImage[];
  servicesTitle: string;
  servicesSubtitle: string;
  specializedServices: CmsSpecializedService[];
  clinicClosedMessageEn: string;
  clinicClosedMessageUr: string;
  generalAnnouncementMessageEn: string;
  generalAnnouncementMessageUr: string;
  createdAt: string;
  updatedAt: string;
}

/** Strips Mongoose-specific types (ObjectId, Date, __v) so the result is safe
 * to pass from a Server Component straight into a Client Component. */
function serialize(doc: unknown): CmsProfile {
  return JSON.parse(JSON.stringify(doc)) as CmsProfile;
}

const DEFAULT_JOURNEY: CmsJourneyEntry[] = [
  {
    role: "Senior Consultant Gastroenterologist",
    place: "Faisal Hospital, Faisalabad",
    period: "2021 — Present",
    detail:
      "Leading the GI endoscopy unit and managing complex hepatobiliary disease cases with state-of-the-art interventional procedures.",
  },
  {
    role: "Fellow in Gastroenterology & Hepatology",
    place: "Shaheed Zulfiqar Ali Bhutto Medical University",
    period: "2018 — 2021",
    detail:
      "Completed post-graduate specialty training in clinical hepatology, interventional endoscopy, and inflammatory bowel disease management.",
  },
  {
    role: "Medical Officer (Internal Medicine)",
    place: "Independent Medical College, Faisalabad",
    period: "2014 — 2018",
    detail:
      "Foundational clinical training encompassing general medicine, acute care management, and diagnostic gastroscopy.",
  },
];

const DEFAULT_WHY_CHOOSE_FEATURES: CmsWhyChooseFeature[] = [
  {
    icon: "school",
    title: "Expert Gastroenterologist",
    desc: "UK-trained specialist with advanced fellowships and years of international clinical experience.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop",
  },
  {
    icon: "biotech",
    title: "Modern Diagnostics",
    desc: "Utilizing high-definition endoscopy and state-of-the-art imaging for precise diagnostic accuracy.",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop",
  },
  {
    icon: "person",
    title: "Personalized Treatment",
    desc: "Bespoke treatment plans tailored to each patient's unique clinical profile and lifestyle.",
    image: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?q=80&w=800&auto=format&fit=crop",
  },
  {
    icon: "verified",
    title: "Evidence-Based",
    desc: "Following international clinical guidelines (BSG, AGA, EASL) for the safest medical care.",
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=800&auto=format&fit=crop",
  },
  {
    icon: "favorite",
    title: "Compassionate Care",
    desc: "A patient-first approach centered on dignity, respect, and clear communication.",
    image: "https://images.unsplash.com/photo-1516841273335-e39b37888115?q=80&w=800&auto=format&fit=crop",
  },
  {
    icon: "support_agent",
    title: "Follow-up Support",
    desc: "Comprehensive post-procedure care and ongoing support throughout the recovery journey.",
    image: "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?q=80&w=800&auto=format&fit=crop",
  },
];

const DEFAULT_CARE_GALLERY_IMAGES: CmsGalleryImage[] = [
  {
    image: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?q=80&w=1000&auto=format&fit=crop",
    label: "Personalized Consultations",
  },
  {
    image: "https://images.unsplash.com/photo-1666214280391-8ff5bd3c0bf0?q=80&w=1000&auto=format&fit=crop",
    label: "Experienced Care Team",
  },
  {
    image: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?q=80&w=1000&auto=format&fit=crop",
    label: "Modern Facilities",
  },
];

const SERVICE_ICONS: Record<string, string> = {
  Biopsy: "biotech",
  Colonoscopy: "visibility",
  "Constipation Treatment": "healing",
  "Diarrhea Treatment": "medication",
  "Digital Rectal Examination": "monitor_heart",
  Endoscopist: "stethoscope",
  Endoscopy: "search",
  Gastroscopy: "emergency",
  "Hepatitis A Treatment": "vaccines",
  "Hepatitis B Treatment": "vaccines",
  "Hepatitis C Treatment": "vaccines",
  Oesophagoscopy: "vital_signs",
};

const SERVICE_DESCRIPTIONS: Record<string, string> = {
  Biopsy: "Tissue sample collection for accurate diagnosis.",
  Colonoscopy: "Examination of the colon to detect digestive disorders.",
  "Constipation Treatment": "Diagnosis and treatment for chronic constipation.",
  "Diarrhea Treatment": "Effective care for acute and chronic diarrhea.",
  "Digital Rectal Examination": "Physical examination to assess rectal health.",
  Endoscopist: "Specialist consultation for gastrointestinal diseases.",
  Endoscopy: "Minimally invasive procedure to examine the digestive tract.",
  Gastroscopy: "Examination of the stomach and upper digestive system.",
  "Hepatitis A Treatment": "Medical management of Hepatitis A infection.",
  "Hepatitis B Treatment": "Comprehensive treatment for Hepatitis B.",
  "Hepatitis C Treatment": "Advanced treatment for Hepatitis C infection.",
  Oesophagoscopy: "Examination of the esophagus using an endoscope.",
};

const DEFAULT_SPECIALIZED_SERVICES: CmsSpecializedService[] = (doctor.services ?? []).map((name: string) => ({
  icon: SERVICE_ICONS[name] ?? "medical_services",
  title: name,
  desc: SERVICE_DESCRIPTIONS[name] ?? "",
}));

export const DEFAULT_CLINIC_CLOSED_MESSAGE_EN =
  "📢 This clinic is closed today. Appointments cannot be booked for today. Please select another date or contact the clinic for more information.";
export const DEFAULT_CLINIC_CLOSED_MESSAGE_UR =
  "📢 آج یہ کلینک بند ہے، لہٰذا آج کے لیے اپائنٹمنٹ بک نہیں کی جا سکتی۔ براہِ کرم کوئی دوسری تاریخ منتخب کریں یا مزید معلومات کے لیے کلینک سے رابطہ کریں۔";

export const DEFAULT_GENERAL_ANNOUNCEMENT_MESSAGE_EN =
  "Have a question or query? Feel free to contact the doctor's clinic anytime.";
export const DEFAULT_GENERAL_ANNOUNCEMENT_MESSAGE_UR =
  "کوئی سوال یا استفسار ہے؟ کسی بھی وقت کلینک سے رابطہ کریں۔";

function extractWhatsappPhone(waUrl: string): string {
  const match = waUrl.match(/phone=(\+?\d+)/);
  return match ? match[1] : "";
}

function buildSeed(): CmsInput {
  return {
    name: doctor.name,
    designation: `Consultant ${doctor.specialization.join(" & ")}`,
    profileImage: doctor.profile_image,
    logoUrl: "/dr_zaid_gul_logo_navbar.svg",
    verification: doctor.verification,
    about: doctor.about,
    experienceYears: doctor.experience_years,
    city: doctor.city,
    country: doctor.country,
    specialization: doctor.specialization,
    professionalMemberships: doctor.professional_memberships,
    languagesSpoken: doctor.languages_spoken,
    education: doctor.education.map((edu) => ({
      name: edu.degree,
      institute: edu.institute,
      location: `${doctor.city}, ${doctor.country}`,
      year: edu.year ?? undefined,
    })),
    professionalJourney: DEFAULT_JOURNEY,
    contactEmail: doctor.contact.email,
    contactPhone: doctor.contact.phone,
    contactWhatsapp: extractWhatsappPhone(doctor.contact.whatsapp),
    social: {
      facebook: doctor.social.facebook?.url ?? "",
      instagram: doctor.social.instagram?.url ?? "",
      linkedin: doctor.social.linkedin?.url ?? "",
      x: "",
      youtube: doctor.social.youtube?.url ?? "",
      website: doctor.profile_url,
    },
    whyChooseSubtitle: "Setting new benchmarks in gastrointestinal health through expertise and empathy.",
    whyChooseFeatures: DEFAULT_WHY_CHOOSE_FEATURES,
    careGalleryTitle: "Care You Can See",
    careGallerySubtitle: "A calm, modern environment designed around patient comfort.",
    careGalleryImages: DEFAULT_CARE_GALLERY_IMAGES,
    servicesTitle: "Specialized Services",
    servicesSubtitle:
      "Comprehensive care for all digestive health issues using state-of-the-art diagnostic and therapeutic techniques.",
    specializedServices: DEFAULT_SPECIALIZED_SERVICES,
    clinicClosedMessageEn: DEFAULT_CLINIC_CLOSED_MESSAGE_EN,
    clinicClosedMessageUr: DEFAULT_CLINIC_CLOSED_MESSAGE_UR,
    generalAnnouncementMessageEn: DEFAULT_GENERAL_ANNOUNCEMENT_MESSAGE_EN,
    generalAnnouncementMessageUr: DEFAULT_GENERAL_ANNOUNCEMENT_MESSAGE_UR,
  };
}

async function loadCmsProfile(): Promise<CmsProfile> {
  await connectDB();
  const existing = await Cms.findOne({}).lean();
  if (existing) {
    // Backfills homepage-section fields for CMS docs created before they existed.
    const needsWhyChooseBackfill = !existing.whyChooseFeatures || existing.whyChooseFeatures.length === 0;
    const needsServicesBackfill = !existing.specializedServices || existing.specializedServices.length === 0;
    const needsClinicClosedBackfill = !existing.clinicClosedMessageUr;
    // Strict `undefined` check (not falsy) — an admin deliberately clearing this
    // field to "" to hide the ticker must stay hidden, not get reseeded.
    const needsGeneralAnnouncementBackfill = existing.generalAnnouncementMessageUr === undefined;
    if (needsWhyChooseBackfill || needsServicesBackfill || needsClinicClosedBackfill || needsGeneralAnnouncementBackfill) {
      const seed = buildSeed();
      const backfilled = await Cms.findOneAndUpdate(
        {},
        {
          $set: {
            ...(needsWhyChooseBackfill
              ? {
                  whyChooseSubtitle: existing.whyChooseSubtitle || seed.whyChooseSubtitle,
                  whyChooseFeatures: seed.whyChooseFeatures,
                  careGalleryTitle: existing.careGalleryTitle || seed.careGalleryTitle,
                  careGallerySubtitle: existing.careGallerySubtitle || seed.careGallerySubtitle,
                  careGalleryImages:
                    existing.careGalleryImages && existing.careGalleryImages.length > 0
                      ? existing.careGalleryImages
                      : seed.careGalleryImages,
                }
              : {}),
            ...(needsServicesBackfill
              ? {
                  servicesTitle: existing.servicesTitle || seed.servicesTitle,
                  servicesSubtitle: existing.servicesSubtitle || seed.servicesSubtitle,
                  specializedServices: seed.specializedServices,
                }
              : {}),
            ...(needsClinicClosedBackfill
              ? {
                  clinicClosedMessageEn: existing.clinicClosedMessageEn || seed.clinicClosedMessageEn,
                  clinicClosedMessageUr: existing.clinicClosedMessageUr || seed.clinicClosedMessageUr,
                }
              : {}),
            ...(needsGeneralAnnouncementBackfill
              ? {
                  generalAnnouncementMessageEn: seed.generalAnnouncementMessageEn,
                  generalAnnouncementMessageUr: seed.generalAnnouncementMessageUr,
                }
              : {}),
          },
        },
        { new: true }
      ).lean();
      return serialize(backfilled);
    }
    return serialize(existing);
  }

  const created = await Cms.create(buildSeed());
  return serialize(created.toObject());
}

/** Returns the single CMS profile document, auto-seeding it from data.json on first read. */
export const getCmsProfile = cache(loadCmsProfile);

export async function updateCmsProfile(patch: Partial<CmsInput>): Promise<CmsProfile> {
  await connectDB();
  const updated = await Cms.findOneAndUpdate({}, patch, { new: true, upsert: true }).lean();
  return serialize(updated);
}
