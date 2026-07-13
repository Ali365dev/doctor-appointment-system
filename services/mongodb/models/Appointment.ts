import { Schema, model, models, Types, type InferSchemaType } from "mongoose";
import { APPOINTMENT_STATUSES, APPOINTMENT_TYPES, VISIT_TYPES, GENDERS } from "@/types/appointment";
import { PAYMENT_METHODS } from "@/types/payment";

const patientSnapshotSchema = new Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    gender: { type: String, enum: GENDERS, required: true },
    age: { type: Number, required: true },
    cnic: { type: String },
    email: { type: String },
    city: { type: String, required: true },
    isExisting: { type: Boolean, required: true, default: false },
    condition: { type: String },
    notes: { type: String },
  },
  { _id: false }
);

const statusHistorySchema = new Schema(
  {
    status: { type: String, enum: APPOINTMENT_STATUSES, required: true },
    changedAt: { type: Date, required: true, default: Date.now },
    changedBy: { type: String }, // userId or "system"
    note: { type: String },
  },
  { _id: false }
);

const appointmentSchema = new Schema(
  {
    appointmentNumber: { type: String, required: true, unique: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: "User" },
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
    visitType: { type: String, enum: VISIT_TYPES, required: true, default: "clinic" },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    time: { type: String, required: true }, // "HH:MM AM/PM"
    reason: { type: String },
    patientSnapshot: { type: patientSnapshotSchema, required: true },
    feeSnapshotPkr: { type: Number, required: true },
    appointmentType: { type: String, enum: APPOINTMENT_TYPES, required: true, default: "consultation" },
    procedureId: { type: Schema.Types.ObjectId, ref: "Procedure" },
    procedureNameSnapshot: { type: String },
    durationMinutes: { type: Number, required: true, default: 30 },
    totalAmount: { type: Number, required: true },
    referralDoctor: { type: String },
    medicalReportUrl: { type: String },
    paymentMethod: { type: String, enum: PAYMENT_METHODS },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
    status: { type: String, enum: APPOINTMENT_STATUSES, required: true, default: "pending_payment" },
    statusHistory: { type: [statusHistorySchema], required: true, default: [] },
  },
  { timestamps: true }
);

appointmentSchema.index({ clinicId: 1, date: 1, time: 1 }, { unique: true });

export type AppointmentDoc = InferSchemaType<typeof appointmentSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const Appointment = models.Appointment ?? model("Appointment", appointmentSchema);
export default Appointment;
