import { connectDB } from "../connection";
import Clinic, { type ClinicDoc } from "../models/Clinic";
import type { WeeklySchedule } from "@/types/clinic";

export interface ClinicInput {
  name: string;
  address?: string;
  city: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  feePkr: number;
  mapLink?: string;
  mapEmbed?: string;
  latitude?: number;
  longitude?: number;
  displayOrder?: number;
  isActive?: boolean;
  image?: string;
  imagePublicId?: string;
  defaultSlotDurationMinutes?: number;
  schedule?: WeeklySchedule;
  /** Legacy Record<DayName, "H:MM AM - H:MM PM"> map, kept in sync with `schedule`. */
  timings?: Record<string, string>;
}

export async function findActiveClinics(): Promise<ClinicDoc[]> {
  await connectDB();
  return Clinic.find({ isActive: true }).sort({ displayOrder: 1, name: 1 }).lean<ClinicDoc[]>();
}

export async function findAllClinics(): Promise<ClinicDoc[]> {
  await connectDB();
  return Clinic.find({}).sort({ displayOrder: 1, name: 1 }).lean<ClinicDoc[]>();
}

export async function findClinicById(clinicId: string): Promise<ClinicDoc | null> {
  await connectDB();
  return Clinic.findById(clinicId).lean<ClinicDoc>();
}

export async function findClinicByNameMatch(pattern: string): Promise<ClinicDoc | null> {
  await connectDB();
  return Clinic.findOne({ name: new RegExp(pattern, "i") }).lean<ClinicDoc>();
}

export async function createClinic(input: ClinicInput): Promise<ClinicDoc> {
  await connectDB();
  const doc = await Clinic.create(input);
  return doc.toObject();
}

export async function updateClinic(
  clinicId: string,
  input: Partial<ClinicInput>
): Promise<ClinicDoc | null> {
  await connectDB();
  return Clinic.findByIdAndUpdate(clinicId, input, { new: true }).lean<ClinicDoc>();
}

export async function deleteClinic(clinicId: string): Promise<boolean> {
  await connectDB();
  const res = await Clinic.findByIdAndDelete(clinicId);
  return !!res;
}
