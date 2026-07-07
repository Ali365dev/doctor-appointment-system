import { connectDB } from "../connection";
import User, { type UserDoc } from "../models/User";

export interface CreatePatientInput {
  firebaseUid: string;
  phone: string;
  name: string;
  passwordHash: string;
}

export interface CreateGooglePatientInput {
  firebaseUid: string;
  email: string;
  name: string;
  avatar?: string;
}

export async function findUserByFirebaseUid(firebaseUid: string): Promise<UserDoc | null> {
  await connectDB();
  return User.findOne({ firebaseUid }).lean<UserDoc>();
}

export async function findUserByPhone(phone: string): Promise<UserDoc | null> {
  await connectDB();
  return User.findOne({ phone }).lean<UserDoc>();
}

export async function findUserById(userId: string): Promise<UserDoc | null> {
  await connectDB();
  return User.findById(userId).lean<UserDoc>();
}

export async function findAllPatientUsers(): Promise<UserDoc[]> {
  await connectDB();
  return User.find({ role: "patient" }).sort({ createdAt: -1 }).lean<UserDoc[]>();
}

/**
 * Creates a new patient with a temporary password (phone+OTP registration flow).
 * isVerified is true because Firebase already confirmed the phone via OTP.
 */
export async function createPatient(input: CreatePatientInput): Promise<UserDoc> {
  await connectDB();
  const created = await User.create({
    firebaseUid: input.firebaseUid,
    phone: input.phone,
    name: input.name,
    passwordHash: input.passwordHash,
    mustChangePassword: true,
    isVerified: true,
    role: "patient",
    isActive: true,
  });
  return created.toObject() as UserDoc;
}

/**
 * Creates a new patient from Google Sign-In. No password/mustChangePassword —
 * Google is the credential. Doctor accounts are never created this way.
 */
export async function createGooglePatient(input: CreateGooglePatientInput): Promise<UserDoc> {
  await connectDB();
  const created = await User.create({
    firebaseUid: input.firebaseUid,
    email: input.email,
    name: input.name,
    avatar: input.avatar,
    mustChangePassword: false,
    isVerified: true,
    role: "patient",
    isActive: true,
  });
  return created.toObject() as UserDoc;
}

export async function updatePasswordAndClearMustChange(userId: string, passwordHash: string): Promise<void> {
  await connectDB();
  await User.updateOne(
    { _id: userId },
    { $set: { passwordHash, mustChangePassword: false } }
  );
}

export async function touchLastLogin(userId: string): Promise<void> {
  await connectDB();
  await User.updateOne({ _id: userId }, { $set: { lastLoginAt: new Date() } });
}

export interface UpdateProfileInput {
  name?: string;
  email?: string;
  gender?: "Male" | "Female" | "Other";
  dob?: string;
  bloodType?: string;
  address?: string;
  city?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergies?: string;
  medications?: string;
}

export async function updateUserProfile(userId: string, input: UpdateProfileInput): Promise<UserDoc | null> {
  await connectDB();
  const { dob, ...rest } = input;
  return User.findByIdAndUpdate(
    userId,
    { $set: { ...rest, ...(dob ? { dob: new Date(dob) } : {}) } },
    { new: true, runValidators: true }
  ).lean<UserDoc>();
}

export async function updateUserAvatar(userId: string, avatar: string, avatarPublicId?: string): Promise<void> {
  await connectDB();
  await User.updateOne(
    { _id: userId },
    avatarPublicId
      ? { $set: { avatar, avatarPublicId } }
      : { $set: { avatar }, $unset: { avatarPublicId: "" } }
  );
}
