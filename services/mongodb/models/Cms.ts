import { Schema, model, models, Types, type InferSchemaType } from "mongoose";

const educationEntrySchema = new Schema(
  {
    name: { type: String, required: true },
    institute: { type: String },
    location: { type: String },
    year: { type: Number },
  },
  { _id: false }
);

const journeyEntrySchema = new Schema(
  {
    role: { type: String, required: true },
    place: { type: String },
    period: { type: String },
    detail: { type: String },
  },
  { _id: false }
);

const socialLinksSchema = new Schema(
  {
    facebook: { type: String, default: "" },
    instagram: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    x: { type: String, default: "" },
    youtube: { type: String, default: "" },
    website: { type: String, default: "" },
  },
  { _id: false }
);

const whyChooseFeatureSchema = new Schema(
  {
    icon: { type: String, default: "" },
    title: { type: String, required: true },
    desc: { type: String, default: "" },
    image: { type: String, default: "" },
    imagePublicId: { type: String },
  },
  { _id: false }
);

const careGalleryImageSchema = new Schema(
  {
    image: { type: String, required: true },
    imagePublicId: { type: String },
    label: { type: String, default: "" },
  },
  { _id: false }
);

const specializedServiceSchema = new Schema(
  {
    icon: { type: String, default: "" },
    title: { type: String, required: true },
    desc: { type: String, default: "" },
  },
  { _id: false }
);

const prepGuideStepSchema = new Schema(
  {
    title: { type: String, required: true },
    desc: { type: String, default: "" },
  },
  { _id: false }
);

const prepGuideTileSchema = new Schema(
  {
    icon: { type: String, default: "" },
    label: { type: String, required: true },
    image: { type: String, default: "" },
    imagePublicId: { type: String },
  },
  { _id: false }
);

const footerLinkSchema = new Schema(
  {
    label: { type: String, required: true },
    href: { type: String, default: "#" },
  },
  { _id: false }
);

const cmsSchema = new Schema(
  {
    name: { type: String, required: true },
    designation: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    profileImagePublicId: { type: String },
    logoUrl: { type: String, default: "" },
    logoPublicId: { type: String },
    verification: { type: String, default: "" },
    about: { type: String, default: "" },
    experienceYears: { type: Number, default: 0 },
    city: { type: String, default: "" },
    country: { type: String, default: "" },
    specialization: { type: [String], default: [] },
    professionalMemberships: { type: [String], default: [] },
    languagesSpoken: { type: [String], default: [] },
    education: { type: [educationEntrySchema], default: [] },
    professionalJourney: { type: [journeyEntrySchema], default: [] },
    contactEmail: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    contactWhatsapp: { type: String, default: "" },
    social: { type: socialLinksSchema, default: () => ({}) },
    whyChooseSubtitle: { type: String, default: "" },
    whyChooseFeatures: { type: [whyChooseFeatureSchema], default: [] },
    careGalleryTitle: { type: String, default: "" },
    careGallerySubtitle: { type: String, default: "" },
    careGalleryImages: { type: [careGalleryImageSchema], default: [] },
    servicesTitle: { type: String, default: "" },
    servicesSubtitle: { type: String, default: "" },
    specializedServices: { type: [specializedServiceSchema], default: [] },
    prepGuidePdfUrl: { type: String, default: "" },
    prepGuidePdfPublicId: { type: String },
    proceduresHeroBadge: { type: String, default: "" },
    proceduresHeroTitle: { type: String, default: "" },
    proceduresHeroDescription: { type: String, default: "" },
    proceduresHeroCtaLabel: { type: String, default: "" },
    proceduresHeroImage: { type: String, default: "" },
    proceduresHeroImagePublicId: { type: String },
    prepGuideTitle: { type: String, default: "" },
    prepGuideDescription: { type: String, default: "" },
    prepGuideSteps: { type: [prepGuideStepSchema], default: [] },
    prepGuideTiles: { type: [prepGuideTileSchema], default: [] },
    footerDescription: { type: String, default: "" },
    footerQuickLinksHeading: { type: String, default: "" },
    footerQuickLinks: { type: [footerLinkSchema], default: [] },
    footerContactHeading: { type: String, default: "" },
    footerLegalLinks: { type: [footerLinkSchema], default: [] },
    footerCopyrightText: { type: String, default: "" },
    // Shown on the booking flow when the selected clinic is closed today
    // (per its weekly schedule). Blank falls back to a built-in default message.
    clinicClosedMessageEn: { type: String, default: "" },
    clinicClosedMessageUr: { type: String, default: "" },
    // General-purpose site-wide header ticker (unrelated to clinic-closed
    // status). Blank on both hides the ticker entirely — unlike the
    // clinic-closed message, there's no mandatory fallback since nothing is
    // actually wrong when this is empty.
    generalAnnouncementMessageEn: { type: String, default: "" },
    generalAnnouncementMessageUr: { type: String, default: "" },
  },
  { timestamps: true }
);

export type CmsDoc = InferSchemaType<typeof cmsSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const Cms = models.Cms ?? model("Cms", cmsSchema);
export default Cms;
