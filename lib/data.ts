import doctorData from "@/data.json";

export const doctor = doctorData;

export type PracticeLocation = (typeof doctorData.practice_locations)[number];
export type Treatment = (typeof doctorData.treatments_offered)[number];
export type Review = (typeof doctorData.sample_reviews)[number];

export default doctorData;
