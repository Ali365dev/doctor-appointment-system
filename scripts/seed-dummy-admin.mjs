// One-off script to seed a dummy doctor (admin) account for local testing —
// logs in via phone+password, no real Firebase phone OTP required.
//
// Usage (Node 20.6+, needs --env-file to load MONGODB_URI):
//   node --env-file=.env.local scripts/seed-dummy-admin.mjs [phone] [password] [name]
//
// Defaults: phone=+10000000001, password=Admin@12345, name=<doctor.name from data.json>
//
// Safe to re-run: upserts by phone, so re-running just resets the password.
//
// After running, log in at /login → "Login with password" using the phone
// and password printed below. This bypasses Firebase entirely since
// /api/auth/login only checks phone + bcrypt-hashed password.

import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import { readFile } from "node:fs/promises";

const [, , phoneArg, passwordArg, ...nameParts] = process.argv;

const phone = phoneArg || "+03086889966";
const password = passwordArg || "Admin@12345";

let defaultName = "Dr. Zaid Gul";
try {
  const data = JSON.parse(await readFile(new URL("../data.json", import.meta.url), "utf-8"));
  defaultName = data.name ?? defaultName;
} catch {
  // data.json not readable — fall back to the generic default name.
}
const name = nameParts.join(" ") || defaultName;

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Missing MONGODB_URI environment variable.");
  process.exit(1);
}

const SALT_ROUNDS = 12;
const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

// Required+unique in the schema but unused by the phone+password login path —
// a stable placeholder keeps re-runs idempotent instead of creating duplicates.
const firebaseUid = `dummy-admin-${phone}`;

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db();
  const users = db.collection("users");

  const now = new Date();
  const result = await users.findOneAndUpdate(
    { phone },
    {
      $set: {
        firebaseUid,
        phone,
        name,
        passwordHash,
        mustChangePassword: false,
        role: "doctor",
        isActive: true,
        isVerified: true,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true, returnDocument: "after" }
  );

  console.log("Dummy admin (doctor) account ready:", result);
  console.log("\nLog in at /login → \"Login with password\" using:");
  console.log(`  Phone:    ${phone}`);
  console.log(`  Password: ${password}`);
} finally {
  await client.close();
}
