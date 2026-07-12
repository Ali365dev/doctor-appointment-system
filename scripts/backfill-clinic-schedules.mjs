// One-off migration: derives the new structured `schedule` (weekly
// day/isOpen/startTime/endTime) and `defaultSlotDurationMinutes` fields
// from each clinic's legacy `timings: Record<DayName, "H:MM AM - H:MM PM">`
// map, for clinics created before the Clinic Management module existed.
//
// Usage: node --env-file=.env.local scripts/backfill-clinic-schedules.mjs
//
// Safe to re-run: only touches clinics missing a `schedule` array.

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Missing MONGODB_URI environment variable.");
  process.exit(1);
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DEFAULT_SLOT_DURATION_MINUTES = 30;

function scheduleFromTimings(timings) {
  return DAYS_OF_WEEK.map((day) => {
    const range = timings?.[day];
    if (!range) {
      return { day, isOpen: false, startTime: "09:00 AM", endTime: "05:00 PM" };
    }
    const [startTime, endTime] = range.split(" - ").map((s) => s.trim());
    return { day, isOpen: true, startTime, endTime };
  });
}

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db();
  const clinics = db.collection("clinics");

  const docs = await clinics.find({ schedule: { $exists: false } }).toArray();
  for (const doc of docs) {
    const schedule = scheduleFromTimings(doc.timings);
    await clinics.updateOne(
      { _id: doc._id },
      {
        $set: {
          schedule,
          defaultSlotDurationMinutes: doc.defaultSlotDurationMinutes ?? DEFAULT_SLOT_DURATION_MINUTES,
          displayOrder: doc.displayOrder ?? 0,
        },
      }
    );
    console.log("Backfilled schedule for:", doc.name);
  }
  console.log(`Done. ${docs.length} clinic(s) updated.`);
} finally {
  await client.close();
}
