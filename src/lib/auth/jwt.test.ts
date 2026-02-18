import { describe, it, expect, vi, beforeEach } from "vitest";

// On doit mocker la variable d'environnement AVANT d'importer jwt.ts
vi.stubEnv("JWT_SECRET", "test-secret-key-pour-les-tests-1234567890");

import { signToken, verifyToken } from "./jwt";

describe("jwt", () => {
  it("doit créer un token valide", async () => {
    const token = await signToken({ id: "user-123", role: "ADMIN" });

    // Un JWT a 3 parties séparées par des points
    expect(token.split(".")).toHaveLength(3);
  });

  it("doit vérifier un token et retourner le payload", async () => {
    const token = await signToken({ id: "user-123", role: "ADMIN" });

    const payload = await verifyToken(token);

    expect(payload.id).toBe("user-123");
    expect(payload.role).toBe("ADMIN");
  });

  it("doit rejeter un token invalide", async () => {
    await expect(verifyToken("token-bidon")).rejects.toThrow();
  });
});
