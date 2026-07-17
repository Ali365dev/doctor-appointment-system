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
  };
}

async function loadCmsProfile(): Promise<CmsProfile> {
  await connectDB();
  const existing = await Cms.findOne({}).lean();
  if (existing) {
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
