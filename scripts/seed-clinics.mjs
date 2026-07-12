// One-off script to seed the Clinic collection from the static
// practice_locations in data.json, so the booking flow can eventually
// read clinics from MongoDB instead of the static file.
//
// Usage (Node 20.6+, needs --env-file to load MONGODB_URI):
//   node --env-file=.env.local scripts/seed-clinics.mjs
//
// Safe to re-run: upserts by clinic name, so existing clinics are
// updated in place rather than duplicated.

import { MongoClient } from "mongodb";
import { readFile } from "node:fs/promises";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Missing MONGODB_URI environment variable.");
  process.exit(1);
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DEFAULT_SLOT_DURATION_MINUTES = 30;

// Hospital/clinic photos stored locally under public/images/clinics, one per
// seeded location, assigned by index.
const CLINIC_IMAGES = [
  "/images/clinics/chughtai-medical-centre.jpg",
  "/images/clinics/faisal-hospital.jpg",
  "/images/clinics/united-hospital.jpg",
];

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

const data = JSON.parse(await readFile(new URL("../data.json", import.meta.url), "utf-8"));
const city = data.city;
const contact = data.contact?.helpline ?? data.contact?.phone ?? "";
const phone = data.contact?.phone ?? "";
const email = data.contact?.email ?? "";

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db();
  const clinics = db.collection("clinics");
  const now = new Date();

  const locations = data.practice_locations ?? [];
  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const result = await clinics.findOneAndUpdate(
      { name: loc.name },
      {
        $set: {
          name: loc.name,
          address: loc.address ?? null,
          city,
          contact,
          phone,
          email,
          feePkr: loc.fee_pkr,
          timings: loc.timings,
          schedule: scheduleFromTimings(loc.timings),
          defaultSlotDurationMinutes: DEFAULT_SLOT_DURATION_MINUTES,
          mapLink: loc.map_link ?? null,
          latitude: loc.coordinates?.lat ?? null,
          longitude: loc.coordinates?.lng ?? null,
          image: CLINIC_IMAGES[i % CLINIC_IMAGES.length],
          displayOrder: i,
          isActive: true,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true, returnDocument: "after" }
    );
    console.log("Clinic ready:", result?.name ?? loc.name);
  }
} finally {
  await client.close();
}
