import { connectDB } from "../connection";
import MedicalRecord, { type MedicalRecordDoc } from "../models/MedicalRecord";
import "../models/User"; // registers "User" so populate("patientId") below can resolve it
import type { ReportStatus } from "@/components/patient/reports/data";

export interface DoctorReviewInput {
  reviewedAt: Date;
  summary: string;
  recommendations: string[];
  medicineChanges: string[];
}

export interface MedicalRecordFileInput {
  name: string;
  type: "image" | "pdf";
  sizeLabel: string;
  url: string;
  publicId: string;
  thumbnail?: string;
}

export interface MedicalRecordAttachmentInput {
  name: string;
  type: "image" | "pdf";
  url: string;
  publicId: string;
  thumbnail?: string;
}

export interface CreateMedicalRecordInput {
  patientId: string;
  title: string;
  description?: string;
  category: string;
  appointmentId?: string;
  appointmentDateSnapshot?: string;
  appointmentClinicSnapshot?: string;
  files: MedicalRecordFileInput[];
}

export async function createMedicalRecord(input: CreateMedicalRecordInput): Promise<MedicalRecordDoc> {
  await connectDB();
  const created = await MedicalRecord.create({
    ...input,
    status: "pending",
    conversation: [],
    doctorReview: null,
  });
  return created.toObject() as MedicalRecordDoc;
}

export async function findMedicalRecordsByPatientId(patientId: string): Promise<MedicalRecordDoc[]> {
  await connectDB();
  return MedicalRecord.find({ patientId }).sort({ createdAt: -1 }).lean<MedicalRecordDoc[]>();
}

export async function findMedicalRecordById(id: string): Promise<MedicalRecordDoc | null> {
  await connectDB();
  return MedicalRecord.findById(id).lean<MedicalRecordDoc>();
}

/** Admin-only: every patient's records, with the patient's name populated for the list view. */
export async function findAllMedicalRecords(): Promise<MedicalRecordDoc[]> {
  await connectDB();
  return MedicalRecord.find({})
    .populate("patientId", "name")
    .sort({ createdAt: -1 })
    .lean<MedicalRecordDoc[]>();
}

export async function findMedicalRecordByIdPopulated(id: string): Promise<MedicalRecordDoc | null> {
  await connectDB();
  return MedicalRecord.findById(id).populate("patientId", "name").lean<MedicalRecordDoc>();
}

export async function updateMedicalRecordStatus(id: string, status: ReportStatus): Promise<MedicalRecordDoc | null> {
  await connectDB();
  return MedicalRecord.findByIdAndUpdate(id, { $set: { status } }, { new: true }).lean<MedicalRecordDoc>();
}

export async function setMedicalRecordDoctorReview(
  id: string,
  review: DoctorReviewInput
): Promise<MedicalRecordDoc | null> {
  await connectDB();
  return MedicalRecord.findByIdAndUpdate(
    id,
    { $set: { doctorReview: review, status: "replied" } },
    { new: true }
  ).lean<MedicalRecordDoc>();
}

export async function deleteMedicalRecord(id: string): Promise<boolean> {
  await connectDB();
  const res = await MedicalRecord.findByIdAndDelete(id);
  return !!res;
}

export async function addFilesToMedicalRecord(
  id: string,
  files: MedicalRecordFileInput[]
): Promise<MedicalRecordDoc | null> {
  await connectDB();
  return MedicalRecord.findByIdAndUpdate(
    id,
    { $push: { files: { $each: files } } },
    { new: true }
  ).lean<MedicalRecordDoc>();
}

export async function addMessageToMedicalRecord(
  id: string,
  message: { sender: "patient" | "doctor" | "system"; message: string; attachments?: MedicalRecordAttachmentInput[] }
): Promise<MedicalRecordDoc | null> {
  await connectDB();
  return MedicalRecord.findByIdAndUpdate(
    id,
    {
      $push: {
        conversation: {
          sender: message.sender,
          message: message.message,
          attachments: message.attachments ?? [],
          createdAt: new Date(),
        },
      },
    },
    { new: true }
  ).lean<MedicalRecordDoc>();
}
