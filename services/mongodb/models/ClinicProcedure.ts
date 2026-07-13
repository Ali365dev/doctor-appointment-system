import { Schema, model, models, Types, type InferSchemaType } from "mongoose";
import { DAYS_OF_WEEK } from "@/types/clinic";

const clinicProcedureSchema = new Schema(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
    procedureId: { type: Schema.Types.ObjectId, ref: "Procedure", required: true },
    priceOverridePkr: { type: Number },
    durationOverrideMinutes: { type: Number },
    availableDays: { type: [String], enum: DAYS_OF_WEEK, default: () => [...DAYS_OF_WEEK] },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

clinicProcedureSchema.index({ clinicId: 1, procedureId: 1 }, { unique: true });

export type ClinicProcedureDoc = InferSchemaType<typeof clinicProcedureSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const ClinicProcedure = models.ClinicProcedure ?? model("ClinicProcedure", clinicProcedureSchema);
export default ClinicProcedure;
