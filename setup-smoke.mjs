import mongoose from "mongoose";
import fs from "fs";

const envFile = fs.readFileSync("/Users/raza/RN-projects/web/doctor-appointment-system/.env.local", "utf8");
const uri = envFile.split("\n").find((l) => l.startsWith("MONGODB_URI=")).slice("MONGODB_URI=".length).trim();

await mongoose.connect(uri);
const db = mongoose.connection.db;

const procedureId = new mongoose.Types.ObjectId("6a539384be3d9caa26b33f46"); // Colonoscopy
const clinicId = new mongoose.Types.ObjectId("6a4aa73bd97f5fdfeaf3ad26"); // Chughtai Medical Centre

await db.collection("procedures").updateOne(
  { _id: procedureId },
  { $set: { durationMinutes: 45, isArchived: false, benefits: ["Early detection"], risks: ["Mild discomfort"], preparationInstructions: "Fast for 12 hours", recoveryTime: "24 hours", faqs: [{ question: "Is it painful?", answer: "Mild discomfort only." }] } }
);

await db.collection("clinicprocedures").deleteMany({ procedureId, clinicId });
const assignment = await db.collection("clinicprocedures").insertOne({
  clinicId, procedureId, isActive: true, availableDays: ["Monday","Tuesday","Wednesday","Thursday","Saturday"], createdAt: new Date(), updatedAt: new Date(),
});

console.log("Assignment created:", assignment.insertedId.toString());
await mongoose.disconnect();
