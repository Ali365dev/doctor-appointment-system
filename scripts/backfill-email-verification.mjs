// One-off migration for the email/password auth refactor:
//   1. Marks emailVerified=true for existing users who already have an email
//      on file (they were already trusted under the old phone/Google auth
//      system) so they can use "Forgot Password" to set a password and log in.
//   2. Reports (never modifies) users with no email at all — these need
//      manual follow-up since login is now email+password only.
//   3. Fixes the firebaseUid index: it used to be `unique` only (required on
//      every user); it's now optional+sparse (Google-only). Mongoose won't
//      reconcile that option change on an existing index, so it must be
//      dropped and recreated here.
//
// Usage (dry run, default):
//   node --env-file=.env.local scripts/backfill-email-verification.mjs
// Usage (apply changes):
//   node --env-file=.env.local scripts/backfill-email-verification.mjs --apply
//
// Safe to re-run.

import { MongoClient } from "mongodb";

const APPLY = process.argv.includes("--apply");

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

  console.log(`\n=== Backfill email verification (${APPLY ? "APPLY" : "DRY RUN"}) ===\n`);

  // 1. Backfill emailVerified for users who already have an email.
  const toVerify = await users
    .find({ email: { $exists: true, $ne: null, $ne: "" }, emailVerified: { $ne: true } })
    .project({ _id: 1, name: 1, email: 1 })
    .toArray();

  console.log(`Users to mark emailVerified=true: ${toVerify.length}`);
  for (const u of toVerify) {
    console.log(`  - ${u.email} (${u.name})`);
  }

  if (APPLY && toVerify.length > 0) {
    const result = await users.updateMany(
      { _id: { $in: toVerify.map((u) => u._id) } },
      { $set: { emailVerified: true } }
    );
    console.log(`Applied: ${result.modifiedCount} user(s) updated.\n`);
  } else {
    console.log("(dry run — no changes made)\n");
  }

  // 2. Report users with no email — never touched, need manual follow-up.
  const noEmail = await users
    .find({ $or: [{ email: { $exists: false } }, { email: null }, { email: "" }] })
    .project({ _id: 1, name: 1, phone: 1, role: 1, createdAt: 1 })
    .toArray();

  console.log(`=== Users with NO email (manual follow-up required): ${noEmail.length} ===`);
  for (const u of noEmail) {
    console.log(`  _id=${u._id} name=${u.name} phone=${u.phone ?? "—"} role=${u.role} createdAt=${u.createdAt?.toISOString?.() ?? u.createdAt}`);
  }
  console.log();

  // 3. Fix the firebaseUid index (unique-only -> unique+sparse).
  const indexes = await users.indexes();
  const firebaseUidIndex = indexes.find((idx) => idx.key?.firebaseUid === 1);

  if (firebaseUidIndex && !firebaseUidIndex.sparse) {
    console.log(`Found non-sparse index "${firebaseUidIndex.name}" on firebaseUid.`);
    if (APPLY) {
      await users.dropIndex(firebaseUidIndex.name);
      await users.createIndex({ firebaseUid: 1 }, { unique: true, sparse: true });
      console.log("Dropped and recreated firebaseUid index as unique+sparse.\n");
    } else {
      console.log("(dry run — would drop and recreate as unique+sparse)\n");
    }
  } else if (firebaseUidIndex) {
    console.log("firebaseUid index is already sparse — nothing to do.\n");
  } else {
    console.log("No firebaseUid index found — nothing to do.\n");
  }

  console.log("=== Summary ===");
  console.log(`emailVerified backfilled: ${APPLY ? toVerify.length : `${toVerify.length} (dry run)`}`);
  console.log(`Users needing manual follow-up (no email): ${noEmail.length}`);
} finally {
  await client.close();
}
