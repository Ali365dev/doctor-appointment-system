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

const data = JSON.parse(await readFile(new URL("../data.json", import.meta.url), "utf-8"));
const city = data.city;
const contact = data.contact?.helpline ?? data.contact?.phone ?? "";

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db();
  const clinics = db.collection("clinics");
  const now = new Date();

  for (const loc of data.practice_locations ?? []) {
    const result = await clinics.findOneAndUpdate(
      { name: loc.name },
      {
        $set: {
          name: loc.name,
          address: loc.address ?? null,
          city,
          contact,
          feePkr: loc.fee_pkr,
          timings: loc.timings,
          mapLink: loc.map_link ?? null,
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
