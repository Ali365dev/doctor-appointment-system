import { connectDB } from "../connection";
import ClinicProcedure, { type ClinicProcedureDoc } from "../models/ClinicProcedure";
import "../models/Clinic"; // registers "Clinic" for populate("clinicId")
import "../models/Procedure"; // registers "Procedure" for populate("procedureId")
import type { DayOfWeek } from "@/types/clinic";

export interface ClinicProcedureInput {
  clinicId: string;
  procedureId: string;
  priceOverridePkr?: number;
  durationOverrideMinutes?: number;
  availableDays?: DayOfWeek[];
  isActive?: boolean;
}

export async function findAssignmentsForProcedure(procedureId: string): Promise<ClinicProcedureDoc[]> {
  await connectDB();
  return ClinicProcedure.find({ procedureId }).populate("clinicId", "name city address").lean<ClinicProcedureDoc[]>();
}

export async function findAssignmentsForClinic(clinicId: string): Promise<ClinicProcedureDoc[]> {
  await connectDB();
  return ClinicProcedure.find({ clinicId }).populate("procedureId", "name pricePkr durationMinutes").lean<ClinicProcedureDoc[]>();
}

export async function findAssignment(clinicId: string, procedureId: string): Promise<ClinicProcedureDoc | null> {
  await connectDB();
  return ClinicProcedure.findOne({ clinicId, procedureId }).lean<ClinicProcedureDoc>();
}

export async function upsertAssignment(input: ClinicProcedureInput): Promise<ClinicProcedureDoc> {
  await connectDB();
  const updated = await ClinicProcedure.findOneAndUpdate(
    { clinicId: input.clinicId, procedureId: input.procedureId },
    {
      $set: {
        priceOverridePkr: input.priceOverridePkr,
        durationOverrideMinutes: input.durationOverrideMinutes,
        availableDays: input.availableDays,
        isActive: input.isActive ?? true,
      },
    },
    { new: true, upsert: true }
  ).lean<ClinicProcedureDoc>();
  return updated!;
}

export async function updateAssignment(
  clinicId: string,
  procedureId: string,
  input: Partial<Omit<ClinicProcedureInput, "clinicId" | "procedureId">>
): Promise<ClinicProcedureDoc | null> {
  await connectDB();
  return ClinicProcedure.findOneAndUpdate({ clinicId, procedureId }, { $set: input }, { new: true }).lean<ClinicProcedureDoc>();
}

export async function removeAssignment(clinicId: string, procedureId: string): Promise<boolean> {
  await connectDB();
  const res = await ClinicProcedure.findOneAndDelete({ clinicId, procedureId });
  return !!res;
}
