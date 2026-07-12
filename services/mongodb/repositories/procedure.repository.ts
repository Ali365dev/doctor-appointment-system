import { connectDB } from "../connection";
import Procedure, { type ProcedureDoc } from "../models/Procedure";

export interface ProcedureInput {
  name: string;
  slug: string;
  shortDescription?: string;
  fullDescription?: string;
  location: string;
  pricePkr: number;
  originalPricePkr: number;
  discountPercent: number;
  isActive?: boolean;
  order?: number;
}

export async function findActiveProcedures(): Promise<ProcedureDoc[]> {
  await connectDB();
  return Procedure.find({ isActive: true })
    .sort({ createdAt: -1 })
    .lean<ProcedureDoc[]>();
}

export async function findAllProcedures(): Promise<ProcedureDoc[]> {
  await connectDB();
  return Procedure.find({}).sort({ createdAt: -1 }).lean<ProcedureDoc[]>();
}

export async function findProcedureById(id: string): Promise<ProcedureDoc | null> {
  await connectDB();
  return Procedure.findById(id).lean<ProcedureDoc>();
}

export async function findProcedureBySlug(slug: string): Promise<ProcedureDoc | null> {
  await connectDB();
  return Procedure.findOne({ slug }).lean<ProcedureDoc>();
}

export async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  await connectDB();
  const query: Record<string, unknown> = { slug };
  if (excludeId) query._id = { $ne: excludeId };
  const existing = await Procedure.findOne(query).select("_id").lean();
  return !!existing;
}

export async function createProcedure(input: ProcedureInput): Promise<ProcedureDoc> {
  await connectDB();
  const doc = await Procedure.create(input);
  return doc.toObject();
}

export async function updateProcedure(
  id: string,
  input: Partial<ProcedureInput>
): Promise<ProcedureDoc | null> {
  await connectDB();
  return Procedure.findByIdAndUpdate(id, input, { new: true }).lean<ProcedureDoc>();
}

export async function deleteProcedure(id: string): Promise<boolean> {
  await connectDB();
  const res = await Procedure.findByIdAndDelete(id);
  return !!res;
}
