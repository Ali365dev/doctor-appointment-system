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
