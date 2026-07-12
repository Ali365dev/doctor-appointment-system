"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WeeklySchedule } from "@/types/clinic";

export interface SelectedClinic {
  id: string;
  name: string;
  address: string | null;
  fee_pkr: number;
  timings: Record<string, string>;
  schedule?: WeeklySchedule;
  defaultSlotDurationMinutes?: number;
  booking_link?: string;
  map_link?: string;
}

export interface PatientInfo {
  fullName: string;
  phone: string;
  gender: "Male" | "Female" | "Other";
  age: string;
  cnic: string;
  email: string;
  city: string;
  isExisting: boolean;
  condition: string;
  notes: string;
}

interface BookingState {
  selectedClinic: SelectedClinic | null;
  visitType: "clinic" | "online";
  reason: string;
  selectedDate: string | null;
  selectedTime: string | null;
  patientInfo: PatientInfo;
  receiptUploaded: boolean;
  appointmentId: string | null;
  appointmentNumber: string | null;
  paymentMethod: "stripe" | "jazzcash" | "easypaisa" | "reception" | null;

  setClinic: (clinic: SelectedClinic) => void;
  setVisitType: (type: "clinic" | "online") => void;
  setReason: (reason: string) => void;
  setDate: (date: string) => void;
  setTime: (time: string) => void;
  setPatientInfo: (info: Partial<PatientInfo>) => void;
  setReceiptUploaded: (uploaded: boolean) => void;
  setAppointment: (appointmentId: string, appointmentNumber: string) => void;
  setPaymentMethod: (method: "stripe" | "jazzcash" | "easypaisa" | "reception") => void;
  clearAppointment: () => void;
  reset: () => void;
}

const defaultPatient: PatientInfo = {
  fullName: "",
  phone: "",
  gender: "Male",
  age: "",
  cnic: "",
  email: "",
  city: "",
  isExisting: false,
  condition: "",
  notes: "",
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      selectedClinic: null,
      visitType: "clinic",
      reason: "",
      selectedDate: null,
      selectedTime: null,
      patientInfo: defaultPatient,
      receiptUploaded: false,
      appointmentId: null,
      appointmentNumber: null,
      paymentMethod: null,

      setClinic: (clinic) => set({ selectedClinic: clinic }),
      setVisitType: (visitType) => set({ visitType }),
      setReason: (reason) => set({ reason }),
      setDate: (selectedDate) => set({ selectedDate }),
      setTime: (selectedTime) => set({ selectedTime }),
      setPatientInfo: (info) =>
        set((s) => ({ patientInfo: { ...s.patientInfo, ...info } })),
      setReceiptUploaded: (receiptUploaded) => set({ receiptUploaded }),
      setAppointment: (appointmentId, appointmentNumber) => set({ appointmentId, appointmentNumber }),
      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
      // Called when a new booking flow starts (Step 1 mount) so an appointment from a
      // previous booking in this same tab can never be silently reused by Step 4.
      clearAppointment: () =>
        set({
          appointmentId: null,
          appointmentNumber: null,
          paymentMethod: null,
          receiptUploaded: false,
        }),
      reset: () =>
        set({
          selectedClinic: null,
          visitType: "clinic",
          reason: "",
          selectedDate: null,
          selectedTime: null,
          patientInfo: defaultPatient,
          receiptUploaded: false,
          appointmentId: null,
          appointmentNumber: null,
          paymentMethod: null,
        }),
    }),
    {
      name: "booking-store",
      // appointmentId/appointmentNumber/paymentMethod/receiptUploaded must NOT survive
      // a full page reload or a new browser session — a stale appointmentId here makes
      // Step 4 silently reuse an old (possibly already-completed) appointment instead of
      // creating a new one, so a "completed" booking never actually reaches the database.
      // Within a single continuous flow (client-side navigation, no reload) these fields
      // still work fine since zustand keeps them in memory regardless of persistence.
      partialize: (state) => ({
        selectedClinic: state.selectedClinic,
        visitType: state.visitType,
        reason: state.reason,
        selectedDate: state.selectedDate,
        selectedTime: state.selectedTime,
        patientInfo: state.patientInfo,
      }),
    }
  )
);
