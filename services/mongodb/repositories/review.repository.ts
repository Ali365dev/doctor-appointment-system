import { connectDB } from "../connection";
import Review, { type ReviewDoc } from "../models/Review";
import "../models/Appointment"; // registers "Appointment" model so populate("appointmentId") below can resolve it

export interface CreateReviewInput {
  patientId: string;
  patientNameSnapshot: string;
  appointmentId: string;
  rating: number;
  comment: string;
}

export async function findReviewByAppointmentId(appointmentId: string): Promise<ReviewDoc | null> {
  await connectDB();
  return Review.findOne({ appointmentId }).lean<ReviewDoc>();
}

export async function findReviewById(id: string): Promise<ReviewDoc | null> {
  await connectDB();
  return Review.findById(id).lean<ReviewDoc>();
}

export async function createReview(input: CreateReviewInput): Promise<ReviewDoc> {
  await connectDB();
  const doc = await Review.create(input);
  return doc.toObject();
}

export async function findReviewsByPatientId(patientId: string): Promise<ReviewDoc[]> {
  await connectDB();
  return Review.find({ patientId })
    .populate("appointmentId", "appointmentNumber date")
    .sort({ createdAt: -1 })
    .lean<ReviewDoc[]>();
}

export async function findAllReviews(): Promise<ReviewDoc[]> {
  await connectDB();
  return Review.find({})
    .populate("appointmentId", "appointmentNumber date")
    .sort({ createdAt: -1 })
    .lean<ReviewDoc[]>();
}

export async function findApprovedReviews(limit?: number): Promise<ReviewDoc[]> {
  await connectDB();
  const query = Review.find({ status: "approved" }).sort({ createdAt: -1 });
  if (limit) query.limit(limit);
  return query.lean<ReviewDoc[]>();
}

export async function getApprovedRatingStats(): Promise<{ count: number; average: number }> {
  await connectDB();
  const rows = await Review.aggregate<{ _id: null; count: number; average: number }>([
    { $match: { status: "approved" } },
    { $group: { _id: null, count: { $sum: 1 }, average: { $avg: "$rating" } } },
  ]);
  const row = rows[0];
  return { count: row?.count ?? 0, average: row?.average ?? 0 };
}

export async function updateReviewStatus(id: string, status: string): Promise<ReviewDoc | null> {
  await connectDB();
  return Review.findByIdAndUpdate(id, { $set: { status } }, { new: true }).lean<ReviewDoc>();
}

export async function setReviewDoctorReply(id: string, message: string): Promise<ReviewDoc | null> {
  await connectDB();
  return Review.findByIdAndUpdate(
    id,
    { $set: { doctorReply: { message, repliedAt: new Date() } } },
    { new: true }
  ).lean<ReviewDoc>();
}

export async function deleteReview(id: string): Promise<boolean> {
  await connectDB();
  const res = await Review.findByIdAndDelete(id);
  return !!res;
}
