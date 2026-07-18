import { Types } from "mongoose";
import { GENDERS, VISIT_TYPES, APPOINTMENT_TYPES, type PatientSnapshot, type VisitType, type Gender, type AppointmentType } from "@/types/appointment";
import { PAYMENT_METHODS, type PaymentMethod } from "@/types/payment";
import { DAYS_OF_WEEK, SLOT_DURATION_OPTIONS, type WeeklySchedule } from "@/types/clinic";

export function isValidObjectId(value: unknown): value is string {
  return typeof value === "string" && Types.ObjectId.isValid(value);
}

export function isValidDateString(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime());
}

export function isPastDate(dateStr: string): boolean {
  const date = new Date(`${dateStr}T00:00:00`);
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  return date < todayMidnight;
}

export function isValidTimeString(value: unknown): value is string {
  return typeof value === "string" && /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/.test(value.trim());
}

export function isValidPhone(value: unknown): value is string {
  return typeof value === "string" && /^[0-9+\-\s()]{7,15}$/.test(value.trim());
}

export function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidGender(value: unknown): value is Gender {
  return typeof value === "string" && (GENDERS as readonly string[]).includes(value);
}

export function isValidVisitType(value: unknown): value is VisitType {
  return typeof value === "string" && (VISIT_TYPES as readonly string[]).includes(value);
}

export function isValidPaymentMethod(value: unknown): value is PaymentMethod {
  return typeof value === "string" && (PAYMENT_METHODS as readonly string[]).includes(value);
}

export function isValidAppointmentType(value: unknown): value is AppointmentType {
  return typeof value === "string" && (APPOINTMENT_TYPES as readonly string[]).includes(value);
}

export interface CreateAppointmentRequestBody {
  clinicId: string;
  visitType: VisitType;
  date: string;
  time: string;
  reason?: string;
  patient: PatientSnapshot;
  paymentMethod?: PaymentMethod;
  appointmentType?: AppointmentType;
  procedureId?: string;
  referralDoctor?: string;
  medicalReportUrl?: string;
}

/**
 * Validates the raw request body for POST /api/appointments.
 * Returns an error message for the first invalid field found, or null if valid.
 */
export function validateCreateAppointmentBody(body: unknown): string | null {
  if (!body || typeof body !== "object") return "Request body is required";
  const b = body as Partial<CreateAppointmentRequestBody>;

  if (!isValidObjectId(b.clinicId)) return "A valid clinicId is required";
  if (!isValidVisitType(b.visitType)) return "visitType must be 'clinic' or 'online'";
  if (!isValidDateString(b.date)) return "date must be a valid YYYY-MM-DD string";
  if (isPastDate(b.date as string)) return "Cannot book an appointment in the past";
  if (!isValidTimeString(b.time)) return "time must be a valid 'HH:MM AM/PM' string";

  const patient = b.patient;
  if (!patient || typeof patient !== "object") return "Patient information is required";
  if (!patient.fullName || !patient.fullName.trim()) return "Patient full name is required";
  if (!isValidPhone(patient.phone)) return "A valid patient phone number is required";
  if (!Number.isFinite(patient.age) || patient.age < 1 || patient.age > 120) return "Patient age must be between 1 and 120";
  if (!isValidGender(patient.gender)) return "Patient gender must be Male, Female, or Other";
  if (!patient.city || !patient.city.trim()) return "Patient city is required";
  if (patient.email && !isValidEmail(patient.email)) return "Patient email is invalid";

  if (b.paymentMethod !== undefined && !isValidPaymentMethod(b.paymentMethod)) {
    return "paymentMethod must be one of bank, jazzcash, easypaisa, reception";
  }
  if (b.appointmentType !== undefined && !isValidAppointmentType(b.appointmentType)) {
    return "appointmentType must be one of consultation, procedure, follow_up";
  }
  if (b.procedureId !== undefined && !isValidObjectId(b.procedureId)) {
    return "A valid procedureId is required";
  }

  return null;
}

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export interface UpdateProfileRequestBody {
  name?: string;
  email?: string;
  gender?: string;
  dob?: string;
  bloodType?: string;
  address?: string;
  city?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergies?: string;
  medications?: string;
}

/**
 * Validates the raw request body for PATCH /api/profile.
 * Every field is optional (a partial update); returns an error message for
 * the first invalid field found, or null if valid.
 */
export function validateProfileUpdateBody(body: unknown): string | null {
  if (!body || typeof body !== "object") return "Request body is required";
  const b = body as UpdateProfileRequestBody;

  if (b.name !== undefined && !b.name.trim()) return "Name cannot be empty";
  if (b.email !== undefined && b.email !== "" && !isValidEmail(b.email)) return "Enter a valid email address";
  if (b.gender !== undefined && !isValidGender(b.gender)) return "Gender must be Male, Female, or Other";
  if (b.dob !== undefined && b.dob !== "" && !isValidDateString(b.dob)) return "Date of birth must be a valid date";
  if (b.bloodType !== undefined && b.bloodType !== "" && !BLOOD_TYPES.includes(b.bloodType)) {
    return "Blood type must be one of A+, A-, B+, B-, AB+, AB-, O+, O-";
  }
  if (b.emergencyContactPhone !== undefined && b.emergencyContactPhone !== "" && !isValidPhone(b.emergencyContactPhone)) {
    return "Enter a valid emergency contact phone number";
  }

  return null;
}

export interface ProcedureRequestBody {
  name?: string;
  slug?: string;
  shortDescription?: string;
  fullDescription?: string;
  location?: string;
  pricePkr?: number;
  originalPricePkr?: number;
  discountPercent?: number;
  isActive?: boolean;
  isArchived?: boolean;
  order?: number;
  durationMinutes?: number;
  benefits?: string[];
  risks?: string[];
  preparationInstructions?: string;
  recoveryTime?: string;
  faqs?: { question: string; answer: string }[];
}

/**
 * Validates the raw request body for POST/PATCH /api/procedures.
 * `partial` skips required-field checks (used for PATCH updates).
 * `pricePkr` and `discountPercent` are always optional — price is derived
 * from originalPricePkr and discountPercent (see deriveProcedurePrice).
 */
export function validateProcedureBody(body: unknown, partial = false): string | null {
  if (!body || typeof body !== "object") return "Request body is required";
  const b = body as ProcedureRequestBody;

  if (!partial || b.name !== undefined) {
    if (!b.name || !b.name.trim()) return "Procedure name is required";
  }
  if (b.slug !== undefined && b.slug !== "" && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(b.slug)) {
    return "Slug must be lowercase letters, numbers, and hyphens only";
  }
  if (!partial || b.location !== undefined) {
    if (!b.location || !b.location.trim()) return "Location is required";
  }
  if (b.pricePkr !== undefined && (!Number.isFinite(b.pricePkr) || (b.pricePkr as number) < 0)) {
    return "Price must be a non-negative number";
  }
  if (!partial || b.originalPricePkr !== undefined) {
    if (!Number.isFinite(b.originalPricePkr) || (b.originalPricePkr as number) < 0) {
      return "Original price must be a non-negative number";
    }
  }
  if (b.discountPercent !== undefined && (!Number.isFinite(b.discountPercent) || (b.discountPercent as number) < 0 || (b.discountPercent as number) > 100)) {
    return "Discount percent must be between 0 and 100";
  }
  if (b.isActive !== undefined && typeof b.isActive !== "boolean") return "isActive must be a boolean";
  if (b.isArchived !== undefined && typeof b.isArchived !== "boolean") return "isArchived must be a boolean";
  if (b.order !== undefined && !Number.isFinite(b.order)) return "order must be a number";
  if (b.durationMinutes !== undefined && (!Number.isFinite(b.durationMinutes) || (b.durationMinutes as number) <= 0)) {
    return "Duration must be a positive number of minutes";
  }
  if (b.benefits !== undefined && !Array.isArray(b.benefits)) return "benefits must be an array of strings";
  if (b.risks !== undefined && !Array.isArray(b.risks)) return "risks must be an array of strings";
  if (b.faqs !== undefined) {
    if (!Array.isArray(b.faqs)) return "faqs must be an array";
    for (const faq of b.faqs) {
      if (!faq || typeof faq !== "object" || !faq.question?.trim() || !faq.answer?.trim()) {
        return "Each FAQ needs a question and an answer";
      }
    }
  }

  return null;
}

/**
 * Turns a procedure name into a URL-safe slug, e.g. "ERCP (Advanced)" -> "ercp-advanced".
 */
export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Price is auto-derived from originalPricePkr and discountPercent when not
 * explicitly provided: no discount means price equals the original price.
 */
export function deriveProcedurePrice(originalPricePkr: number, discountPercent: number): number {
  return Math.round(originalPricePkr * (1 - discountPercent / 100));
}

export interface ClinicProcedureRequestBody {
  clinicId?: string;
  priceOverridePkr?: number | null;
  durationOverrideMinutes?: number | null;
  availableDays?: string[];
  isActive?: boolean;
}

/**
 * Validates the raw request body for POST/PATCH clinic↔procedure assignment
 * endpoints. `partial` skips the required clinicId check (used for PATCH,
 * where the clinic is already identified by the URL segment).
 */
export function validateClinicProcedureBody(body: unknown, partial = false): string | null {
  if (!body || typeof body !== "object") return "Request body is required";
  const b = body as ClinicProcedureRequestBody;

  if (!partial && !isValidObjectId(b.clinicId)) return "A valid clinicId is required";
  if (b.priceOverridePkr !== undefined && b.priceOverridePkr !== null && (!Number.isFinite(b.priceOverridePkr) || (b.priceOverridePkr as number) < 0)) {
    return "Price override must be a non-negative number";
  }
  if (
    b.durationOverrideMinutes !== undefined &&
    b.durationOverrideMinutes !== null &&
    (!Number.isFinite(b.durationOverrideMinutes) || (b.durationOverrideMinutes as number) <= 0)
  ) {
    return "Duration override must be a positive number of minutes";
  }
  if (b.availableDays !== undefined) {
    if (!Array.isArray(b.availableDays) || b.availableDays.some((d) => !(DAYS_OF_WEEK as readonly string[]).includes(d))) {
      return "availableDays must be an array of valid day names";
    }
  }
  if (b.isActive !== undefined && typeof b.isActive !== "boolean") return "isActive must be a boolean";

  return null;
}

export interface ClinicRequestBody {
  name?: string;
  address?: string;
  city?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  feePkr?: number;
  mapLink?: string;
  mapEmbed?: string;
  latitude?: number;
  longitude?: number;
  displayOrder?: number;
  isActive?: boolean;
  defaultSlotDurationMinutes?: number;
  schedule?: WeeklySchedule;
}

/** Validates a single { day, isOpen, startTime, endTime } schedule entry. */
function validateScheduleDay(entry: unknown): string | null {
  if (!entry || typeof entry !== "object") return "Each schedule entry must be an object";
  const e = entry as Partial<WeeklySchedule[number]>;
  if (!e.day || !(DAYS_OF_WEEK as readonly string[]).includes(e.day)) {
    return "Each schedule entry needs a valid day";
  }
  if (typeof e.isOpen !== "boolean") return `${e.day}: isOpen must be a boolean`;
  if (e.isOpen) {
    if (!isValidTimeString(e.startTime)) return `${e.day}: a valid opening time is required`;
    if (!isValidTimeString(e.endTime)) return `${e.day}: a valid closing time is required`;
  }
  return null;
}

/**
 * Validates the raw request body for POST/PATCH /api/clinics.
 * `partial` skips required-field checks (used for PATCH updates).
 */
export function validateClinicBody(body: unknown, partial = false): string | null {
  if (!body || typeof body !== "object") return "Request body is required";
  const b = body as ClinicRequestBody;

  if (!partial || b.name !== undefined) {
    if (!b.name || !b.name.trim()) return "Clinic name is required";
  }
  if (!partial || b.city !== undefined) {
    if (!b.city || !b.city.trim()) return "City is required";
  }
  if (!partial || b.feePkr !== undefined) {
    if (!Number.isFinite(b.feePkr) || (b.feePkr as number) < 0) return "Consultation fee must be a non-negative number";
  }
  if (b.email !== undefined && b.email !== "" && !isValidEmail(b.email)) return "Enter a valid email address";
  if (b.phone !== undefined && b.phone !== "" && !isValidPhone(b.phone)) return "Enter a valid phone number";
  if (b.whatsapp !== undefined && b.whatsapp !== "" && !isValidPhone(b.whatsapp)) return "Enter a valid WhatsApp number";
  if (b.latitude !== undefined && b.latitude !== null && !Number.isFinite(b.latitude)) return "Latitude must be a number";
  if (b.longitude !== undefined && b.longitude !== null && !Number.isFinite(b.longitude)) return "Longitude must be a number";
  if (b.displayOrder !== undefined && !Number.isFinite(b.displayOrder)) return "Display order must be a number";
  if (b.isActive !== undefined && typeof b.isActive !== "boolean") return "isActive must be a boolean";
  if (
    b.defaultSlotDurationMinutes !== undefined &&
    !(SLOT_DURATION_OPTIONS as readonly number[]).includes(b.defaultSlotDurationMinutes)
  ) {
    return `Default slot duration must be one of: ${SLOT_DURATION_OPTIONS.join(", ")} minutes`;
  }
  if (b.schedule !== undefined) {
    if (!Array.isArray(b.schedule)) return "schedule must be an array";
    for (const entry of b.schedule) {
      const err = validateScheduleDay(entry);
      if (err) return err;
    }
  }

  return null;
}

interface CmsEducationEntryBody {
  name?: string;
  institute?: string;
  location?: string;
  year?: number;
}

interface CmsJourneyEntryBody {
  role?: string;
  place?: string;
  period?: string;
  detail?: string;
}

interface CmsSocialLinksBody {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  x?: string;
  youtube?: string;
  website?: string;
}

interface CmsWhyChooseFeatureBody {
  icon?: string;
  title?: string;
  desc?: string;
  image?: string;
  imagePublicId?: string;
}

interface CmsGalleryImageBody {
  image?: string;
  imagePublicId?: string;
  label?: string;
}

interface CmsSpecializedServiceBody {
  icon?: string;
  title?: string;
  desc?: string;
}

interface CmsRequestBody {
  name?: string;
  designation?: string;
  profileImage?: string;
  logoUrl?: string;
  verification?: string;
  about?: string;
  experienceYears?: number;
  city?: string;
  country?: string;
  specialization?: string[];
  professionalMemberships?: string[];
  languagesSpoken?: string[];
  education?: CmsEducationEntryBody[];
  professionalJourney?: CmsJourneyEntryBody[];
  contactEmail?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  social?: CmsSocialLinksBody;
  whyChooseSubtitle?: string;
  whyChooseFeatures?: CmsWhyChooseFeatureBody[];
  careGalleryTitle?: string;
  careGallerySubtitle?: string;
  careGalleryImages?: CmsGalleryImageBody[];
  servicesTitle?: string;
  servicesSubtitle?: string;
  specializedServices?: CmsSpecializedServiceBody[];
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

function isValidUrlLike(value: string): boolean {
  return /^https?:\/\/.+\..+/i.test(value);
}

/**
 * Validates the raw request body for PATCH /api/cms.
 * Returns an error message for the first invalid field found, or null if valid.
 */
export function validateCmsBody(body: unknown, partial = false): string | null {
  if (!body || typeof body !== "object") return "Request body is required";
  const b = body as CmsRequestBody;

  if (!partial || b.name !== undefined) {
    if (!b.name || !b.name.trim()) return "Name is required";
  }
  if (b.experienceYears !== undefined && (!Number.isFinite(b.experienceYears) || b.experienceYears < 0)) {
    return "Experience years must be a non-negative number";
  }
  if (b.contactEmail !== undefined && b.contactEmail !== "" && !isValidEmail(b.contactEmail)) {
    return "Enter a valid contact email";
  }
  if (b.contactPhone !== undefined && b.contactPhone !== "" && !isValidPhone(b.contactPhone)) {
    return "Enter a valid contact phone number";
  }
  if (b.contactWhatsapp !== undefined && b.contactWhatsapp !== "" && !isValidPhone(b.contactWhatsapp)) {
    return "Enter a valid WhatsApp number";
  }
  if (b.specialization !== undefined && !isStringArray(b.specialization)) return "specialization must be an array of strings";
  if (b.professionalMemberships !== undefined && !isStringArray(b.professionalMemberships)) {
    return "professionalMemberships must be an array of strings";
  }
  if (b.languagesSpoken !== undefined && !isStringArray(b.languagesSpoken)) return "languagesSpoken must be an array of strings";

  if (b.education !== undefined) {
    if (!Array.isArray(b.education)) return "education must be an array";
    for (const entry of b.education) {
      if (!entry || typeof entry !== "object" || !entry.name || !entry.name.trim()) {
        return "Each education entry requires a name";
      }
    }
  }

  if (b.professionalJourney !== undefined) {
    if (!Array.isArray(b.professionalJourney)) return "professionalJourney must be an array";
    for (const entry of b.professionalJourney) {
      if (!entry || typeof entry !== "object" || !entry.role || !entry.role.trim()) {
        return "Each professional journey entry requires a role";
      }
    }
  }

  if (b.social !== undefined) {
    if (!b.social || typeof b.social !== "object") return "social must be an object";
    const urlFields: (keyof CmsSocialLinksBody)[] = ["facebook", "instagram", "linkedin", "youtube", "website"];
    for (const field of urlFields) {
      const value = b.social[field];
      if (value !== undefined && value !== "" && !isValidUrlLike(value)) {
        return `Enter a valid URL for ${field}`;
      }
    }
  }

  if (b.whyChooseFeatures !== undefined) {
    if (!Array.isArray(b.whyChooseFeatures)) return "whyChooseFeatures must be an array";
    for (const entry of b.whyChooseFeatures) {
      if (!entry || typeof entry !== "object" || !entry.title || !entry.title.trim()) {
        return "Each Why Choose feature requires a title";
      }
    }
  }

  if (b.careGalleryImages !== undefined) {
    if (!Array.isArray(b.careGalleryImages)) return "careGalleryImages must be an array";
    for (const entry of b.careGalleryImages) {
      if (!entry || typeof entry !== "object" || !entry.image || !entry.image.trim()) {
        return "Each gallery image requires an uploaded image";
      }
    }
  }

  if (b.specializedServices !== undefined) {
    if (!Array.isArray(b.specializedServices)) return "specializedServices must be an array";
    for (const entry of b.specializedServices) {
      if (!entry || typeof entry !== "object" || !entry.title || !entry.title.trim()) {
        return "Each specialized service requires a title";
      }
    }
  }

  return null;
}

interface PaymentSettingsRequestBody {
  jazzcashNumber?: unknown;
  jazzcashAccountTitle?: unknown;
  easypaisaNumber?: unknown;
  easypaisaAccountTitle?: unknown;
  bankName?: unknown;
  bankAccountNumber?: unknown;
  bankAccountTitle?: unknown;
}

export function validatePaymentSettingsBody(body: unknown): string | null {
  if (!body || typeof body !== "object") return "Request body is required";
  const b = body as PaymentSettingsRequestBody;

  const stringFields: (keyof PaymentSettingsRequestBody)[] = [
    "jazzcashNumber",
    "jazzcashAccountTitle",
    "easypaisaNumber",
    "easypaisaAccountTitle",
    "bankName",
    "bankAccountNumber",
    "bankAccountTitle",
  ];
  for (const field of stringFields) {
    if (b[field] !== undefined && typeof b[field] !== "string") {
      return `${field} must be a string`;
    }
  }

  return null;
}
