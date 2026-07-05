// One-off script to seed the single hardcoded doctor account.
// There is no doctor registration page — this is the only way a
// "role: doctor" user document gets created.
//
// Usage (Node 20.6+, needs --env-file to load MONGODB_URI):
//   node --env-file=.env.local scripts/seed-doctor.mjs <firebaseUid> <phone> <name>
//
// <firebaseUid> is the Firebase Auth UID for the doctor's phone number.
// Sign in once via the normal /login phone+OTP flow with the doctor's
// number (it will be created as a "patient" by default), then either:
//   a) copy the uid from the Firebase Console > Authentication > Users, or
//   b) run this script first to create the doctor doc, then have the
//      doctor log in — verify-otp will find the existing doc by
//      firebaseUid and log them in with role "doctor" instead of
//      creating a new patient.

import { MongoClient } from "mongodb";

const [, , firebaseUid, phone, ...nameParts] = process.argv;
const name = nameParts.join(" ");

if (!firebaseUid || !phone || !name) {
  console.error("Usage: node --env-file=.env.local scripts/seed-doctor.mjs <firebaseUid> <phone> <name>");
  process.exit(1);
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Missing MONGODB_URI environment variable.");
  process.exit(1);
}

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db();
  const users = db.collection("users");

  const now = new Date();
  const result = await users.findOneAndUpdate(
    { firebaseUid },
    {
      $set: {
        firebaseUid,
        phone,
        name,
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
