import doctorData from "@/data.json";

export const doctor = doctorData;

export type PracticeLocation = (typeof doctorData.practice_locations)[number];
export type Treatment = (typeof doctorData.treatments_offered)[number];
export type Review = (typeof doctorData.sample_reviews)[number];

/** Builds a wa.me chat link from a CMS-managed WhatsApp phone number. */
export function buildWhatsappLink(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  return digits ? `https://wa.me/${digits}` : doctorData.contact.whatsapp;
}

export default doctorData;
