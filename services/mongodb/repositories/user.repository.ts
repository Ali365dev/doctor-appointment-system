import { connectDB } from "../connection";
import User, { type UserDoc } from "../models/User";

export interface CreateEmailPatientInput {
  email: string;
  phone: string;
  name: string;
  passwordHash: string;
}

export interface CreateGoogleUserInput {
  firebaseUid: string;
  email: string;
  name: string;
  avatar?: string;
  passwordHash: string;
}

export async function findUserByFirebaseUid(firebaseUid: string): Promise<UserDoc | null> {
  await connectDB();
  return User.findOne({ firebaseUid }).lean<UserDoc>();
}

export async function findUserByPhone(phone: string): Promise<UserDoc | null> {
  await connectDB();
  return User.findOne({ phone }).lean<UserDoc>();
}

export async function findUserByEmail(email: string): Promise<UserDoc | null> {
  await connectDB();
  return User.findOne({ email: email.trim().toLowerCase() }).lean<UserDoc>();
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
 * Creates a new patient via the email+password registration flow.
 * emailVerified starts false — the caller still needs to send/verify the OTP.
 */
export async function createEmailPatient(input: CreateEmailPatientInput): Promise<UserDoc> {
  await connectDB();
  const created = await User.create({
    email: input.email.trim().toLowerCase(),
    phone: input.phone,
    name: input.name,
    passwordHash: input.passwordHash,
    mustChangePassword: false,
    emailVerified: false,
    role: "patient",
    isActive: true,
  });
  return created.toObject() as UserDoc;
}

/**
 * Creates a brand-new patient from a first-time Google Sign-In. Google's
 * email is inherently confirmed, so emailVerified starts true. A generated
 * password is stored (hashed) so the user can also log in with email+password
 * — see linkGoogleToUser for the case where the email already has an account.
 */
export async function createGoogleUser(input: CreateGoogleUserInput): Promise<UserDoc> {
  await connectDB();
  const created = await User.create({
    firebaseUid: input.firebaseUid,
    email: input.email.trim().toLowerCase(),
    name: input.name,
    avatar: input.avatar,
    passwordHash: input.passwordHash,
    mustChangePassword: false,
    emailVerified: true,
    temporaryPasswordSent: false,
    role: "patient",
    isActive: true,
  });
  return created.toObject() as UserDoc;
}

/** Links a Google identity to an existing email/password account (account linking, one account per email). */
export async function linkGoogleToUser(userId: string, firebaseUid: string): Promise<UserDoc | null> {
  await connectDB();
  return User.findByIdAndUpdate(userId, { $set: { firebaseUid } }, { new: true }).lean<UserDoc>();
}

export async function markEmailVerified(userId: string): Promise<void> {
  await connectDB();
  await User.updateOne({ _id: userId }, { $set: { emailVerified: true } });
}

export async function markTemporaryPasswordSent(userId: string): Promise<void> {
  await connectDB();
  await User.updateOne({ _id: userId }, { $set: { temporaryPasswordSent: true } });
}

export async function updateEmail(userId: string, newEmail: string): Promise<UserDoc | null> {
  await connectDB();
  return User.findByIdAndUpdate(
    userId,
    { $set: { email: newEmail.trim().toLowerCase(), emailVerified: false } },
    { new: true }
  ).lean<UserDoc>();
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
