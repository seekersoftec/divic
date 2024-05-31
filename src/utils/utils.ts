import { createVerify, randomBytes } from 'crypto';

/**
 * Verifies a signature using SHA256 hashing and a provided PEM public key.
 *
 * @param signature - The signature to be verified (string).
 * @param data - The data that was signed (string).
 * @param publicKey - The PEM encoded public key (string).
 *
 * @returns True if the signature is valid, false otherwise.
 */
export function verifySignature(
  signature: string,
  data: string,
  publicKey: string,
): boolean {
  const verifier = createVerify('SHA256');
  verifier.update(data);

  return verifier.verify(publicKey, signature, 'hex');
}

/**
 * Generates a secure challenge string.
 * @returns The generated challenge string.
 */
export const generateChallenge = (): string => {
  return randomBytes(32).toString('utf8'); // base64url
};

/**
 * Creates a delayed date by adding the specified number of minutes to the current date.
 * @param minutes - The number of minutes to add.
 * @returns The delayed date.
 */
export const getDelayedDate = (minutes: number): Date => {
  return new Date(Date.now() + minutes * 60000);
};

/**
 * Converts minutes to milliseconds.
 * @param minutes - The number of minutes.
 * @returns The equivalent time in milliseconds.
 */
export const minutesToMilliseconds = (minutes: number): number => {
  return minutes * 60 * 1000;
};

/**
 * Checks if a given string is a valid hexadecimal string.
 * @param str - The string to check.
 * @returns True if the string is a valid hexadecimal, false otherwise.
 */
export function isHex(str: string): boolean {
  return /^[0-9a-fA-F]+$/.test(str);
}
