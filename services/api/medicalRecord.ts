import "server-only";
import { connectDB } from "@/services/mongodb";
import { uploadMedicalReport, deleteUploadedAsset } from "@/services/cloudinary";
import { doctor } from "@/lib/data";
import { findAppointmentById } from "@/services/mongodb/repositories/appointment.repository";
import {
  createMedicalRecord as createMedicalRecordRecord,
  findMedicalRecordsByPatientId,
  findMedicalRecordById,
  findAllMedicalRecords,
  findMedicalRecordByIdPopulated,
  updateMedicalRecordStatus,
  setMedicalRecordDoctorReview,
  deleteMedicalRecord as deleteMedicalRecordRecord,
  addFilesToMedicalRecord,
  addMessageToMedicalRecord,
  type MedicalRecordFileInput,
  type MedicalRecordAttachmentInput,
} from "@/services/mongodb/repositories/medicalRecord.repository";
import type { MedicalRecordDoc } from "@/services/mongodb/models/MedicalRecord";
import type { Report, ReportStatus, FileKind, MessageSender } from "@/components/patient/reports/data";

export class MedicalRecordServiceError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function uploadFiles(files: File[]): Promise<MedicalRecordFileInput[]> {
  const uploaded: MedicalRecordFileInput[] = [];
  for (const file of files) {
    const result = await uploadMedicalReport(file);
    const isPdf = file.type === "application/pdf";
    uploaded.push({
      name: file.name,
      type: isPdf ? "pdf" : "image",
      sizeLabel: formatSize(file.size),
      url: result.secureUrl,
      publicId: result.publicId,
      thumbnail: isPdf ? "" : result.secureUrl,
    });
  }
  return uploaded;
}

/** Shape returned to the client — identical to components/patient/reports/data.ts's `Report` interface. */
export type ReportApiShape = Report;

/** Admin list/detail views also need to know which patient a record belongs to. */
export type AdminReportApiShape = Report & { patientName: string };

function toApiShape(doc: MedicalRecordDoc): ReportApiShape {
  return {
    id: String(doc._id),
    title: doc.title,
    description: doc.description ?? "",
    category: doc.category,
    status: doc.status as ReportStatus,
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
    // Single-doctor practice — the doctor reviewing every submission is always
    // Dr. Zaid Gul, so show his identity immediately rather than a permanent
    // "Not yet assigned" placeholder with no real doctor-side UI to assign one.
    doctor: { name: doctor.name, avatar: doctor.profile_image },
    appointment:
      doc.appointmentId && doc.appointmentDateSnapshot && doc.appointmentClinicSnapshot
        ? { id: String(doc.appointmentId), date: doc.appointmentDateSnapshot, clinic: doc.appointmentClinicSnapshot }
        : null,
    files: (doc.files ?? []).map((f) => ({
      id: String((f as unknown as { _id: unknown })._id),
      name: f.name,
      type: f.type as FileKind,
      size: f.sizeLabel,
      url: f.url,
      thumbnail: f.thumbnail || f.url,
    })),
    conversation: (doc.conversation ?? []).map((m) => ({
      id: String((m as unknown as { _id: unknown })._id),
      sender: m.sender as MessageSender,
      message: m.message,
      attachments: (m.attachments ?? []).map((a) => ({
        id: `${a.publicId}`,
        name: a.name,
        type: a.type as FileKind,
        url: a.url,
        thumbnail: a.thumbnail || a.url,
      })),
      createdAt: new Date(m.createdAt).toISOString(),
    })),
    doctorReview: doc.doctorReview
      ? {
          reviewedAt: new Date(doc.doctorReview.reviewedAt).toISOString(),
          summary: doc.doctorReview.summary,
          recommendations: doc.doctorReview.recommendations ?? [],
          medicineChanges: doc.doctorReview.medicineChanges ?? [],
        }
      : null,
  };
}

function toAdminApiShape(doc: MedicalRecordDoc): AdminReportApiShape {
  const patient = doc.patientId as unknown as { name?: string } | null;
  return { ...toApiShape(doc), patientName: patient?.name ?? "Unknown Patient" };
}

export interface CreateMedicalRecordParams {
  patientId: string;
  title: string;
  description?: string;
  category: string;
  appointmentId?: string;
  files: File[];
}

export async function createMedicalRecord(params: CreateMedicalRecordParams): Promise<ReportApiShape> {
  await connectDB();

  if (params.files.length === 0) {
    throw new MedicalRecordServiceError("At least one file is required", 400);
  }

  let appointmentDateSnapshot: string | undefined;
  let appointmentClinicSnapshot: string | undefined;
  if (params.appointmentId) {
    const appointment = await findAppointmentById(params.appointmentId);
    if (!appointment) {
      throw new MedicalRecordServiceError("Appointment not found", 404);
    }
    appointmentDateSnapshot = appointment.date;
    const clinic = appointment.clinicId as unknown as { name?: string };
    appointmentClinicSnapshot = typeof clinic === "object" ? clinic?.name : undefined;
  }

  const uploadedFiles = await uploadFiles(params.files);

  const created = await createMedicalRecordRecord({
    patientId: params.patientId,
    title: params.title,
    description: params.description,
    category: params.category,
    appointmentId: params.appointmentId,
    appointmentDateSnapshot,
    appointmentClinicSnapshot,
    files: uploadedFiles,
  });

  return toApiShape(created);
}

export async function getMedicalRecordsForPatient(patientId: string): Promise<ReportApiShape[]> {
  await connectDB();
  const docs = await findMedicalRecordsByPatientId(patientId);
  return docs.map(toApiShape);
}

export async function getMedicalRecordById(id: string, patientId: string): Promise<ReportApiShape> {
  await connectDB();
  const doc = await findMedicalRecordById(id);
  if (!doc || String(doc.patientId) !== patientId) {
    throw new MedicalRecordServiceError("Report not found", 404);
  }
  return toApiShape(doc);
}

async function deleteRecordAndAssets(doc: MedicalRecordDoc): Promise<void> {
  for (const file of doc.files ?? []) {
    await deleteUploadedAsset(file.publicId, file.type === "pdf" ? "raw" : "image");
  }
  for (const message of doc.conversation ?? []) {
    for (const attachment of message.attachments ?? []) {
      await deleteUploadedAsset(attachment.publicId, attachment.type === "pdf" ? "raw" : "image");
    }
  }
  await deleteMedicalRecordRecord(String(doc._id));
}

export async function removeMedicalRecord(id: string, patientId: string): Promise<void> {
  await connectDB();
  const doc = await findMedicalRecordById(id);
  if (!doc || String(doc.patientId) !== patientId) {
    throw new MedicalRecordServiceError("Report not found", 404);
  }
  await deleteRecordAndAssets(doc);
}

/** Admin-only: doctor can delete any patient's record, no ownership check. */
export async function removeMedicalRecordAsAdmin(id: string): Promise<void> {
  await connectDB();
  const doc = await findMedicalRecordById(id);
  if (!doc) {
    throw new MedicalRecordServiceError("Report not found", 404);
  }
  await deleteRecordAndAssets(doc);
}

export async function addFilesToReport(id: string, patientId: string, files: File[]): Promise<ReportApiShape> {
  await connectDB();
  const doc = await findMedicalRecordById(id);
  if (!doc || String(doc.patientId) !== patientId) {
    throw new MedicalRecordServiceError("Report not found", 404);
  }
  if (files.length === 0) {
    throw new MedicalRecordServiceError("At least one file is required", 400);
  }
  const uploadedFiles = await uploadFiles(files);
  const updated = await addFilesToMedicalRecord(id, uploadedFiles);
  if (!updated) {
    throw new MedicalRecordServiceError("Report not found", 404);
  }
  return toApiShape(updated);
}

export interface AddMessageParams {
  id: string;
  patientId: string;
  message: string;
  attachments?: File[];
}

export async function addMessageToReport(params: AddMessageParams): Promise<ReportApiShape> {
  await connectDB();
  const doc = await findMedicalRecordById(params.id);
  if (!doc || String(doc.patientId) !== params.patientId) {
    throw new MedicalRecordServiceError("Report not found", 404);
  }

  let attachments: MedicalRecordAttachmentInput[] = [];
  if (params.attachments && params.attachments.length > 0) {
    const uploaded = await uploadFiles(params.attachments);
    attachments = uploaded.map((f) => ({
      name: f.name,
      type: f.type,
      url: f.url,
      publicId: f.publicId,
      thumbnail: f.thumbnail,
    }));
  }

  const updated = await addMessageToMedicalRecord(params.id, {
    sender: "patient",
    message: params.message,
    attachments,
  });
  if (!updated) {
    throw new MedicalRecordServiceError("Report not found", 404);
  }
  return toApiShape(updated);
}

// ── Admin (doctor-side) ────────────────────────────────────────────────────

export async function getAllMedicalRecordsForAdmin(): Promise<AdminReportApiShape[]> {
  await connectDB();
  const docs = await findAllMedicalRecords();
  return docs.map(toAdminApiShape);
}

export async function getMedicalRecordForAdmin(id: string): Promise<AdminReportApiShape> {
  await connectDB();
  const doc = await findMedicalRecordByIdPopulated(id);
  if (!doc) {
    throw new MedicalRecordServiceError("Report not found", 404);
  }
  return toAdminApiShape(doc);
}

export async function updateReportStatus(id: string, status: ReportStatus): Promise<ReportApiShape> {
  await connectDB();
  const updated = await updateMedicalRecordStatus(id, status);
  if (!updated) {
    throw new MedicalRecordServiceError("Report not found", 404);
  }
  return toApiShape(updated);
}

export interface SaveDoctorReviewParams {
  id: string;
  summary: string;
  recommendations: string[];
  medicineChanges: string[];
}

export async function saveDoctorReview(params: SaveDoctorReviewParams): Promise<ReportApiShape> {
  await connectDB();
  const updated = await setMedicalRecordDoctorReview(params.id, {
    reviewedAt: new Date(),
    summary: params.summary,
    recommendations: params.recommendations,
    medicineChanges: params.medicineChanges,
  });
  if (!updated) {
    throw new MedicalRecordServiceError("Report not found", 404);
  }
  return toApiShape(updated);
}

export async function addDoctorMessageToReport(
  id: string,
  message: string,
  attachments: File[] = []
): Promise<ReportApiShape> {
  await connectDB();
  const doc = await findMedicalRecordById(id);
  if (!doc) {
    throw new MedicalRecordServiceError("Report not found", 404);
  }

  let uploadedAttachments: MedicalRecordAttachmentInput[] = [];
  if (attachments.length > 0) {
    const uploaded = await uploadFiles(attachments);
    uploadedAttachments = uploaded.map((f) => ({
      name: f.name,
      type: f.type,
      url: f.url,
      publicId: f.publicId,
      thumbnail: f.thumbnail,
    }));
  }

  const updated = await addMessageToMedicalRecord(id, {
    sender: "doctor",
    message,
    attachments: uploadedAttachments,
  });
  if (!updated) {
    throw new MedicalRecordServiceError("Report not found", 404);
  }
  return toApiShape(updated);
}
