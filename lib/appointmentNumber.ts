import "server-only";
import { connectDB } from "@/services/mongodb";
import Counter from "@/services/mongodb/models/Counter";

/**
 * Atomically generates a unique, human-readable appointment number
 * scoped per calendar day, e.g. APT-260705-0001.
 * Uses a $inc counter document so concurrent bookings on the same
 * day never collide, even under load.
 */
export async function generateAppointmentNumber(date = new Date()): Promise<string> {
  await connectDB();

  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const dayKey = `APT-${yy}${mm}${dd}`;

  const counter = await Counter.findByIdAndUpdate(
    dayKey,
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );

  const seq = String(counter.seq).padStart(4, "0");
  return `${dayKey}-${seq}`;
}
