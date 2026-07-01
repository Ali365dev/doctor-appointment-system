"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SelectedClinic {
  id: string;
  name: string;
  address: string | null;
  fee_pkr: number;
  timings: Record<string, string>;
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

  setClinic: (clinic: SelectedClinic) => void;
  setVisitType: (type: "clinic" | "online") => void;
  setReason: (reason: string) => void;
  setDate: (date: string) => void;
  setTime: (time: string) => void;
  setPatientInfo: (info: Partial<PatientInfo>) => void;
  setReceiptUploaded: (uploaded: boolean) => void;
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

      setClinic: (clinic) => set({ selectedClinic: clinic }),
      setVisitType: (visitType) => set({ visitType }),
      setReason: (reason) => set({ reason }),
      setDate: (selectedDate) => set({ selectedDate }),
      setTime: (selectedTime) => set({ selectedTime }),
      setPatientInfo: (info) =>
        set((s) => ({ patientInfo: { ...s.patientInfo, ...info } })),
      setReceiptUploaded: (receiptUploaded) => set({ receiptUploaded }),
      reset: () =>
        set({
          selectedClinic: null,
          visitType: "clinic",
          reason: "",
          selectedDate: null,
          selectedTime: null,
          patientInfo: defaultPatient,
          receiptUploaded: false,
        }),
    }),
    { name: "booking-store" }
  )
);
