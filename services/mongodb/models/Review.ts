import { Schema, model, models, Types, type InferSchemaType } from "mongoose";

export const REVIEW_STATUSES = ["pending", "approved", "rejected"] as const;

const doctorReplySchema = new Schema(
  {
    message: { type: String, required: true },
    repliedAt: { type: Date, required: true },
  },
  { _id: false }
);

const reviewSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    patientNameSnapshot: { type: String, required: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment", required: true, unique: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    status: { type: String, enum: REVIEW_STATUSES, required: true, default: "pending" },
    doctorReply: { type: doctorReplySchema, default: null },
  },
  { timestamps: true }
);

export type ReviewDoc = InferSchemaType<typeof reviewSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const Review = models.Review ?? model("Review", reviewSchema);
export default Review;
