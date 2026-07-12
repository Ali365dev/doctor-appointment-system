import { Schema, model, models, Types, type InferSchemaType } from "mongoose";
import { DAYS_OF_WEEK, SLOT_DURATION_OPTIONS } from "@/types/clinic";

const scheduleDaySchema = new Schema(
  {
    day: { type: String, required: true, enum: DAYS_OF_WEEK },
    isOpen: { type: Boolean, required: true, default: false },
    startTime: { type: String, default: "09:00 AM" },
    endTime: { type: String, default: "05:00 PM" },
  },
  { _id: false }
);

const clinicSchema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String },
    city: { type: String, required: true },
    // Legacy free-form contact string, kept for backward compatibility with
    // older records — new code should use phone/whatsapp/email below.
    contact: { type: String },
    phone: { type: String },
    whatsapp: { type: String },
    email: { type: String },
    feePkr: { type: Number, required: true },
    // Legacy Record<DayName, "H:MM AM - H:MM PM"> map, kept for backward
    // compatibility. `schedule` below is the source of truth going forward.
    timings: { type: Schema.Types.Mixed },
    mapLink: { type: String },
    mapEmbed: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    displayOrder: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, required: true, default: true },
    image: { type: String },
    imagePublicId: { type: String },
    defaultSlotDurationMinutes: {
      type: Number,
      required: true,
      default: 30,
      enum: SLOT_DURATION_OPTIONS,
    },
    schedule: { type: [scheduleDaySchema], default: [] },
  },
  { timestamps: true }
);

export type ClinicDoc = InferSchemaType<typeof clinicSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const Clinic = models.Clinic ?? model("Clinic", clinicSchema);
export default Clinic;
