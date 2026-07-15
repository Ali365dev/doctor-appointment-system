// One-off script: remove all ClinicProcedure assignments that are NOT for
// Faisal Hospital, so every procedure is only bookable at Faisal Hospital.
//
// Usage (Node 20.6+, needs --env-file to load MONGODB_URI):
//   node --env-file=.env.local scripts/restrict-procedures-to-faisal.mjs

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Missing MONGODB_URI environment variable.");
  process.exit(1);
}

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db();
  const clinics = db.collection("clinics");
  const clinicProcedures = db.collection("clinicprocedures");

  const faisal = await clinics.findOne({ name: /faisal/i });
  if (!faisal) {
    console.error("Could not find a clinic matching /faisal/i — aborting.");
    process.exit(1);
  }
  console.log("Keeping assignments only for:", faisal.name, String(faisal._id));

  const result = await clinicProcedures.deleteMany({ clinicId: { $ne: faisal._id } });
  console.log(`Removed ${result.deletedCount} assignment(s) for other clinics.`);

  const remaining = await clinicProcedures.countDocuments({ clinicId: faisal._id });
  console.log(`${remaining} assignment(s) remain, all for ${faisal.name}.`);
} finally {
  await client.close();
}
