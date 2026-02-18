import { describe, it, expect } from "vitest";
import { hashPassword, comparePassword } from "./password";

describe("password", () => {
  it("doit hasher un mot de passe", async () => {
    const hash = await hashPassword("Test123!");
    //le hash ne doit pas être le mot de passe en clair
    expect(hash).not.toBe("Test123!");

    //un hash bcrypt commence toujours par $2a$ ou $2b$
    expect(hash).toMatch(/^\$2[ab]\$/);
  });

  it("doit retourner true si le mot de passe correspond au hash", async () => {
    const hash = await hashPassword("Test123!");

    const result = await comparePassword("Test123!", hash);

    expect(result).toBe(true);
  });

  it("doit retourner false si le mot de passe ne correspond pas", async () => {
    const hash = await hashPassword("Test123!");

    const result = await comparePassword("MauvaiseMotDePasse", hash);

    expect(result).toBe(false);
  });
});
