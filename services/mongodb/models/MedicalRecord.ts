import { Schema, model, models, Types, type InferSchemaType } from "mongoose";

export const REPORT_STATUSES = ["pending", "reviewing", "replied", "closed"] as const;
export const FILE_KINDS = ["image", "pdf"] as const;
export const MESSAGE_SENDERS = ["patient", "doctor", "system"] as const;

const fileSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: FILE_KINDS, required: true },
    sizeLabel: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    thumbnail: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const attachmentSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: FILE_KINDS, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    thumbnail: { type: String, default: "" },
  },
  { _id: false }
);

const messageSchema = new Schema(
  {
    sender: { type: String, enum: MESSAGE_SENDERS, required: true },
    message: { type: String, required: true },
    attachments: { type: [attachmentSchema], default: [] },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { _id: true }
);

const doctorReviewSchema = new Schema(
  {
    reviewedAt: { type: Date, required: true },
    summary: { type: String, required: true },
    recommendations: { type: [String], default: [] },
    medicineChanges: { type: [String], default: [] },
  },
  { _id: false }
);

const medicalRecordSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    category: { type: String, required: true },
    status: { type: String, enum: REPORT_STATUSES, required: true, default: "pending" },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment" },
    appointmentDateSnapshot: { type: String },
    appointmentClinicSnapshot: { type: String },
    files: { type: [fileSchema], default: [] },
    conversation: { type: [messageSchema], default: [] },
    doctorReview: { type: doctorReviewSchema, default: null },
  },
  { timestamps: true }
);

export type MedicalRecordDoc = InferSchemaType<typeof medicalRecordSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const MedicalRecord = models.MedicalRecord ?? model("MedicalRecord", medicalRecordSchema);
export default MedicalRecord;
