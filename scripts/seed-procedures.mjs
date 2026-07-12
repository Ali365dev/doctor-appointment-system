// One-off script to seed the Procedure collection from the static
// treatments_offered in data.json, so the /services page and its admin
// management screen can read/write procedures from MongoDB.
//
// Usage (Node 20.6+, needs --env-file to load MONGODB_URI):
//   node --env-file=.env.local scripts/seed-procedures.mjs
//
// Safe to re-run: upserts by procedure name, so existing procedures are
// updated in place rather than duplicated.

import { MongoClient } from "mongodb";
import { readFile } from "node:fs/promises";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Missing MONGODB_URI environment variable.");
  process.exit(1);
}

function slugify(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const data = JSON.parse(await readFile(new URL("../data.json", import.meta.url), "utf-8"));

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db();
  const procedures = db.collection("procedures");
  const now = new Date();

  let order = 0;
  for (const t of data.treatments_offered ?? []) {
    const result = await procedures.findOneAndUpdate(
      { name: t.name },
      {
        $set: {
          name: t.name,
          slug: slugify(t.name),
          location: t.location,
          pricePkr: t.price_pkr,
          originalPricePkr: t.original_price_pkr,
          discountPercent: t.discount_percent,
          isActive: true,
          order: order++,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now, shortDescription: "", fullDescription: "" },
      },
      { upsert: true, returnDocument: "after" }
    );
    console.log("Procedure ready:", result?.name ?? t.name);
  }
} finally {
  await client.close();
}
