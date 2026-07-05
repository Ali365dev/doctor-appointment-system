import "server-only";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const SALT_ROUNDS = 12;
const TEMP_PASSWORD_LENGTH = 14;
// Unambiguous charset — no 0/O/1/l/I — since this is read off an email/SMS by hand.
const TEMP_PASSWORD_CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";

export function generateTemporaryPassword(length: number = TEMP_PASSWORD_LENGTH): string {
  const bytes = crypto.randomBytes(length);
  let password = "";
  for (let i = 0; i < length; i++) {
    password += TEMP_PASSWORD_CHARSET[bytes[i] % TEMP_PASSWORD_CHARSET.length];
  }
  return password;
}

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}
