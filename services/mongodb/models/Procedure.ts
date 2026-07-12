import { Schema, model, models, Types, type InferSchemaType } from "mongoose";

const procedureSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, sparse: true },
    shortDescription: { type: String, default: "" },
    fullDescription: { type: String, default: "" },
    location: { type: String, required: true },
    pricePkr: { type: Number, required: true },
    originalPricePkr: { type: Number, required: true },
    discountPercent: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, required: true, default: true },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export type ProcedureDoc = InferSchemaType<typeof procedureSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const Procedure = models.Procedure ?? model("Procedure", procedureSchema);
export default Procedure;
