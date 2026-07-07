import { Schema, model, models, Types, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    // Optional + sparse: Google-created patients may have no verified phone number.
    phone: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, sparse: true },
    passwordHash: { type: String },
    mustChangePassword: { type: Boolean, required: true, default: false },
    role: { type: String, enum: ["doctor", "patient"], required: true, default: "patient" },
    name: { type: String, required: true },
    avatar: { type: String },
    avatarPublicId: { type: String }, // Cloudinary public ID, needed to delete the asset on replace
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    dob: { type: Date },
    bloodType: { type: String, enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
    address: { type: String },
    city: { type: String },
    country: { type: String },
    emergencyContactName: { type: String },
    emergencyContactPhone: { type: String },
    allergies: { type: String },
    medications: { type: String },
    isActive: { type: Boolean, required: true, default: true },
    isVerified: { type: Boolean, required: true, default: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof userSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const User = models.User ?? model("User", userSchema);

export default User;
