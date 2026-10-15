import { describe, it, expect } from "vitest";
import {
  generateSalt,
  hashPassword,
  verifyPassword,
  generateSessionToken,
  hashSessionToken,
} from "../lib/auth/crypto";

describe("WebCrypto Auth Primitives", () => {
  it("hashes and correctly verifies passwords with unique salts", async () => {
    const password = "SuperSecretPassword123!";
    const salt1 = generateSalt();
    const salt2 = generateSalt();

    expect(salt1).not.toBe(salt2);
    expect(salt1.length).toBe(32); // 16 bytes = 32 hex chars

    const hash1 = await hashPassword(password, salt1);
    const hash2 = await hashPassword(password, salt2);

    expect(hash1).not.toBe(hash2);

    const isValid = await verifyPassword(password, salt1, hash1);
    expect(isValid).toBe(true);

    const isInvalid = await verifyPassword("WrongPassword123!", salt1, hash1);
    expect(isInvalid).toBe(false);
  });

  it("generates 256-bit secure session tokens and verifies SHA-256 digests", async () => {
    const token = generateSessionToken();
    expect(token.length).toBe(64); // 32 bytes in hex

    const hash1 = await hashSessionToken(token);
    const hash2 = await hashSessionToken(token);

    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64);
  });
});
