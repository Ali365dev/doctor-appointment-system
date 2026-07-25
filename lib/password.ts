import "server-only";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const SALT_ROUNDS = 12;
const TEMP_PASSWORD_LENGTH = 14;
// Unambiguous charset — no 0/O/1/l/I — since this is read off an email/SMS by hand.
const UPPER_CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZ";
const LOWER_CHARSET = "abcdefghjkmnpqrstuvwxyz";
const DIGIT_CHARSET = "23456789";
const SYMBOL_CHARSET = "!@#$%";
const TEMP_PASSWORD_CHARSET = UPPER_CHARSET + LOWER_CHARSET + DIGIT_CHARSET + SYMBOL_CHARSET;

function randomChar(charset: string): string {
  return charset[crypto.randomInt(charset.length)];
}

/**
 * Generates a random password that always satisfies isPasswordStrong (at
 * least one uppercase, one lowercase, one digit) by seeding one char from
 * each required category before filling/shuffling the rest — a pure random
 * draw over the full charset could, in rare cases, miss a category entirely.
 */
export function generateTemporaryPassword(length: number = TEMP_PASSWORD_LENGTH): string {
  const required = [randomChar(UPPER_CHARSET), randomChar(LOWER_CHARSET), randomChar(DIGIT_CHARSET)];
  const rest = Array.from({ length: Math.max(0, length - required.length) }, () =>
    randomChar(TEMP_PASSWORD_CHARSET)
  );
  const chars = [...required, ...rest];

  // Fisher-Yates shuffle using a CSPRNG so the required chars aren't always at the front.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_STRENGTH_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

/** At least 8 chars with an uppercase, lowercase, and digit. */
export function isPasswordStrong(password: string): boolean {
  return password.length >= PASSWORD_MIN_LENGTH && PASSWORD_STRENGTH_REGEX.test(password);
}
