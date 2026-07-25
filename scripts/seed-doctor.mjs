// One-off script to seed the single hardcoded doctor account.
// There is no doctor registration page — this is the only way a
// "role: doctor" user document gets created.
//
// Usage (Node 20.6+, needs --env-file to load MONGODB_URI):
//   node --env-file=.env.local scripts/seed-doctor.mjs <email> <password> <phone> <name>
//
// The doctor logs in via the normal /login email+password flow using the
// credentials given here.

import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const [, , emailArg, passwordArg, phone, ...nameParts] = process.argv;
const email = emailArg?.trim().toLowerCase();
const password = passwordArg;
const name = nameParts.join(" ");

if (!email || !password || !phone || !name) {
  console.error("Usage: node --env-file=.env.local scripts/seed-doctor.mjs <email> <password> <phone> <name>");
  process.exit(1);
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Missing MONGODB_URI environment variable.");
  process.exit(1);
}

const SALT_ROUNDS = 12;
const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db();
  const users = db.collection("users");

  const now = new Date();
  const result = await users.findOneAndUpdate(
    { email },
    {
      $set: {
        email,
        phone,
        name,
        passwordHash,
        mustChangePassword: false,
        emailVerified: true,
        role: "doctor",
        isActive: true,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true, returnDocument: "after" }
  );

  console.log("Doctor account ready:", result);
} finally {
  await client.close();
}
