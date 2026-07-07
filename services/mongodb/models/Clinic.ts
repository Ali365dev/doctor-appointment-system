import { Schema, model, models, Types, type InferSchemaType } from "mongoose";

const clinicSchema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String },
    city: { type: String, required: true },
    contact: { type: String },
    feePkr: { type: Number, required: true },
    timings: { type: Schema.Types.Mixed, required: true }, // Record<DayName, "H:MM AM - H:MM PM">
    mapLink: { type: String },
    isActive: { type: Boolean, required: true, default: true },
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
