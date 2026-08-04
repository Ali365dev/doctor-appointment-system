// One-off script to permanently remove every "cancelled" appointment (and its
// linked payment, if any) from the database.
//
// Usage (Node 20.6+, needs --env-file to load MONGODB_URI):
//   node --env-file=.env.local scripts/delete-cancelled-appointments.mjs           (dry run — preview only)
//   node --env-file=.env.local scripts/delete-cancelled-appointments.mjs --confirm  (actually deletes)
//
// Safe by default: without --confirm this only prints what WOULD be deleted.

import { MongoClient } from "mongodb";

const confirm = process.argv.includes("--confirm");

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Missing MONGODB_URI environment variable.");
  process.exit(1);
}

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db();
  const appointments = db.collection("appointments");
  const payments = db.collection("payments");

  const cancelled = await appointments
    .find({ status: "cancelled" }, { projection: { appointmentNumber: 1, date: 1, time: 1, paymentId: 1 } })
    .toArray();

  if (cancelled.length === 0) {
    console.log("No cancelled appointments found. Nothing to do.");
    process.exit(0);
  }

  // Payment.appointmentId is stored as a real ObjectId (mongoose ref), so the
  // raw MongoDB driver needs the ObjectId instances here, not their string form.
  const appointmentIds = cancelled.map((a) => a._id);
  const paymentCount = await payments.countDocuments({ appointmentId: { $in: appointmentIds } });

  console.log(`Found ${cancelled.length} cancelled appointment(s) and ${paymentCount} linked payment(s):`);
  for (const a of cancelled) {
    console.log(`  - ${a.appointmentNumber ?? a._id} · ${a.date ?? "—"} ${a.time ?? ""}`);
  }

  if (!confirm) {
    console.log("\nDry run only — nothing was deleted. Re-run with --confirm to actually delete these records.");
    process.exit(0);
  }

  const paymentResult = await payments.deleteMany({ appointmentId: { $in: appointmentIds } });
  const appointmentResult = await appointments.deleteMany({ _id: { $in: appointmentIds } });

  console.log(`\nDeleted ${appointmentResult.deletedCount} appointment(s) and ${paymentResult.deletedCount} payment(s).`);
} finally {
  await client.close();
}
