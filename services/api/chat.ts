import { connectDB } from "@/services/mongodb";

export async function getChats(): Promise<never> {
  await connectDB();

  // TODO:
  // MongoDB implementation
  throw new Error("Not implemented");
}
