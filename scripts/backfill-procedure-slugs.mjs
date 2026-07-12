// One-off migration: backfill slug/shortDescription/fullDescription on
// procedures created before those fields existed.
//
// Usage: node --env-file=.env.local scripts/backfill-procedure-slugs.mjs

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Missing MONGODB_URI environment variable.");
  process.exit(1);
}

function slugify(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db();
  const procedures = db.collection("procedures");
  const docs = await procedures
    .find({ $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }] })
    .toArray();

  for (const doc of docs) {
    const slug = slugify(doc.name);
    await procedures.updateOne(
      { _id: doc._id },
      { $set: { slug, shortDescription: doc.shortDescription ?? "", fullDescription: doc.fullDescription ?? "" } }
    );
    console.log("Backfilled:", doc.name, "->", slug);
  }
  console.log(`Done. ${docs.length} procedure(s) updated.`);
} finally {
  await client.close();
}
