// One-off script to seed the doctor (admin) account — logs in via
// email+password (the auth system no longer has phone/OTP login).
//
// Usage (Node 20.6+, needs --env-file to load MONGODB_URI):
//   node --env-file=.env.local scripts/seed-dummy-admin.mjs [email] [password] [name] [phone]
//
// Defaults: email=drzaidgulofficial@gmail.com, password=Admin@12345, name=<doctor.name from data.json>, phone=+03086889966
//
// NOTE: the live doctor account currently has a randomly generated password
// set directly in the DB (not this default) — re-running this script with no
// password argument WILL overwrite it back to the default below. Pass the
// real password explicitly if you just want to reset name/phone/etc.
//
// Safe to re-run: upserts by email, so re-running just resets the password.
//
// After running, log in at /login using the email and password printed below.

import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import { readFile } from "node:fs/promises";

const [, , emailArg, passwordArg, nameArg, phoneArg] = process.argv;

const email = (emailArg || "drzaidgulofficial@gmail.com").trim().toLowerCase();
const password = passwordArg || "Admin@12345";
const phone = phoneArg || "+03086889966";

let defaultName = "Dr. Zaid Gul";
try {
  const data = JSON.parse(await readFile(new URL("../data.json", import.meta.url), "utf-8"));
  defaultName = data.name ?? defaultName;
} catch {
  // data.json not readable — fall back to the generic default name.
}
const name = nameArg || defaultName;

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

  console.log("Dummy admin (doctor) account ready:", result);
  console.log("\nLog in at /login using:");
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
} finally {
  await client.close();
}
