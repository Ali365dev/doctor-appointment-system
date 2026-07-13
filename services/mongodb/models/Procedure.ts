import { Schema, model, models, Types, type InferSchemaType } from "mongoose";

const faqSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false }
);

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
    isArchived: { type: Boolean, required: true, default: false },
    order: { type: Number, required: true, default: 0 },
    durationMinutes: { type: Number, required: true, default: 30 },
    image: { type: String },
    imagePublicId: { type: String },
    benefits: { type: [String], default: [] },
    risks: { type: [String], default: [] },
    preparationInstructions: { type: String, default: "" },
    recoveryTime: { type: String, default: "" },
    faqs: { type: [faqSchema], default: [] },
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
