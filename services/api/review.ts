import "server-only";
import { connectDB } from "@/services/mongodb";
import { findAppointmentById } from "@/services/mongodb/repositories/appointment.repository";
import { findUserById } from "@/services/mongodb/repositories/user.repository";
import {
  createReview as createReviewRecord,
  findReviewByAppointmentId,
  findReviewById,
  findReviewsByPatientId,
  findAllReviews,
  findApprovedReviews,
  getApprovedRatingStats,
  updateReviewStatus,
  setReviewDoctorReply,
  deleteReview as deleteReviewRecord,
} from "@/services/mongodb/repositories/review.repository";
import type { ReviewDoc } from "@/services/mongodb/models/Review";
import type { Review, ReviewStatus } from "@/types/review";

export class ReviewServiceError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function toApiShape(doc: ReviewDoc): Review {
  const appointment = doc.appointmentId as unknown as { _id?: unknown; appointmentNumber?: string; date?: string } | null;
  return {
    id: String(doc._id),
    patientId: String(doc.patientId),
    patientName: doc.patientNameSnapshot,
    appointmentId: appointment?._id ? String(appointment._id) : String(doc.appointmentId),
    appointmentNumber: appointment?.appointmentNumber ?? "",
    appointmentDate: appointment?.date ?? "",
    rating: doc.rating,
    comment: doc.comment,
    status: doc.status as ReviewStatus,
    doctorReply: doc.doctorReply
      ? { message: doc.doctorReply.message, repliedAt: new Date(doc.doctorReply.repliedAt).toISOString() }
      : null,
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}

export interface SubmitReviewParams {
  patientId: string;
  appointmentId: string;
  rating: number;
  comment: string;
}

export async function submitReview(params: SubmitReviewParams): Promise<Review> {
  await connectDB();

  const appointment = await findAppointmentById(params.appointmentId);
  if (!appointment) {
    throw new ReviewServiceError("Appointment not found", 404);
  }
  if (String(appointment.patientId) !== params.patientId) {
    throw new ReviewServiceError("This appointment does not belong to you", 403);
  }
  if (appointment.status !== "completed") {
    throw new ReviewServiceError("You can only review completed appointments", 400);
  }

  const existing = await findReviewByAppointmentId(params.appointmentId);
  if (existing) {
    throw new ReviewServiceError("You have already reviewed this appointment", 409);
  }

  const patient = await findUserById(params.patientId);
  if (!patient) {
    throw new ReviewServiceError("Patient not found", 404);
  }

  const created = await createReviewRecord({
    patientId: params.patientId,
    patientNameSnapshot: patient.name,
    appointmentId: params.appointmentId,
    rating: params.rating,
    comment: params.comment.trim(),
  });

  return toApiShape(created);
}

export async function getReviewsForPatient(patientId: string): Promise<Review[]> {
  await connectDB();
  const docs = await findReviewsByPatientId(patientId);
  return docs.map(toApiShape);
}

export async function getAllReviewsForAdmin(): Promise<Review[]> {
  await connectDB();
  const docs = await findAllReviews();
  return docs.map(toApiShape);
}

export interface PublicReviewsResult {
  reviews: Review[];
  stats: { count: number; average: number };
}

export async function getPublicReviews(limit = 20): Promise<PublicReviewsResult> {
  await connectDB();
  const [docs, stats] = await Promise.all([findApprovedReviews(limit), getApprovedRatingStats()]);
  return { reviews: docs.map(toApiShape), stats };
}

export async function moderateReview(id: string, status: ReviewStatus): Promise<Review> {
  await connectDB();
  const updated = await updateReviewStatus(id, status);
  if (!updated) {
    throw new ReviewServiceError("Review not found", 404);
  }
  return toApiShape(updated);
}

export async function replyToReview(id: string, message: string): Promise<Review> {
  await connectDB();
  if (!message.trim()) {
    throw new ReviewServiceError("Reply message is required", 400);
  }
  const updated = await setReviewDoctorReply(id, message.trim());
  if (!updated) {
    throw new ReviewServiceError("Review not found", 404);
  }
  return toApiShape(updated);
}

/** Admin-only: doctor can delete any review, no ownership check. */
export async function removeReviewAsAdmin(id: string): Promise<void> {
  await connectDB();
  const doc = await findReviewById(id);
  if (!doc) {
    throw new ReviewServiceError("Review not found", 404);
  }
  await deleteReviewRecord(id);
}

/** Patient can only delete their own review, and only while it's still pending moderation. */
export async function removeOwnReview(id: string, patientId: string): Promise<void> {
  await connectDB();
  const doc = await findReviewById(id);
  if (!doc || String(doc.patientId) !== patientId) {
    throw new ReviewServiceError("Review not found", 404);
  }
  if (doc.status !== "pending") {
    throw new ReviewServiceError("Only pending reviews can be deleted", 400);
  }
  await deleteReviewRecord(id);
}
