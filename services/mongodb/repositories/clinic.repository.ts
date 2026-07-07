import { connectDB } from "../connection";
import Clinic, { type ClinicDoc } from "../models/Clinic";

export async function findActiveClinics(): Promise<ClinicDoc[]> {
  await connectDB();
  return Clinic.find({ isActive: true }).sort({ name: 1 }).lean<ClinicDoc[]>();
}

export async function findClinicById(clinicId: string): Promise<ClinicDoc | null> {
  await connectDB();
  return Clinic.findById(clinicId).lean<ClinicDoc>();
}
