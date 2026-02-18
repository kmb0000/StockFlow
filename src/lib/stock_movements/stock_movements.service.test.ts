import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createStockMovement,
  rejectStockMovement,
  validateStockMovement,
} from "./stock_movements.service";
import * as stockMovementRepository from "./stock_movements.repository";
import * as productRepository from "../products/products.repository";
import { NotFoundError } from "../errors/not-found.error";
import { ValidationError } from "../errors/validation.error";

// Les mocks (une seule fois)
vi.mock("./stock_movements.repository");
vi.mock("../products/products.repository");
vi.mock("../db/connection", () => ({
  db: {
    getClient: vi.fn().mockResolvedValue({
      query: vi.fn(),
      release: vi.fn(),
    }),
    query: vi.fn(),
  },
  pool: {
    query: vi.fn(),
  },
}));

// Les faux objets (une seule fois)
const fakePendingMovement = {
  id: "123",
  product_id: "prod-1",
  created_by: "user-1",
  type: "IN" as const,
  quantity: 10,
  reason: "Réapprovisionnement",
  notes: null,
  reference: null,
  unit_price: null,
  validated_by: null,
  validated_at: null,
  status: "PENDING" as const,
  created_at: new Date(),
};

const fakeProduct = {
  id: "prod-1",
  name: "Clavier",
  quantity: 50,
  status: "active",
};

// ===== rejectStockMovement =====

describe("rejectStockMovement", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("doit rejeter un mouvement PENDING avec succès", async () => {
    vi.mocked(stockMovementRepository.getById).mockResolvedValue(
      fakePendingMovement,
    );
    vi.mocked(stockMovementRepository.markRejected).mockResolvedValue({
      ...fakePendingMovement,
      status: "REJECTED",
      validated_by: "admin-1",
      validated_at: new Date(),
    });

    const result = await rejectStockMovement("123", "admin-1");

    expect(result.status).toBe("REJECTED");
    expect(result.validated_by).toBe("admin-1");
  });

  it("doit lancer une erreur si le mouvement n'existe pas", async () => {
    vi.mocked(stockMovementRepository.getById).mockResolvedValue(null);

    await expect(rejectStockMovement("999", "admin-1")).rejects.toThrow(
      NotFoundError,
    );
  });

  it("doit lancer une erreur si le mouvement n'est pas PENDING", async () => {
    vi.mocked(stockMovementRepository.getById).mockResolvedValue({
      ...fakePendingMovement,
      status: "VALIDATED",
    });

    await expect(rejectStockMovement("123", "admin-1")).rejects.toThrow(
      ValidationError,
    );
  });
});

// ===== validateStockMovement =====

describe("validateStockMovement", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("doit lancer NotFoundError si le mouvement n'existe pas", async () => {
    vi.mocked(stockMovementRepository.getById).mockResolvedValue(null);

    await expect(validateStockMovement("999", "admin-1")).rejects.toThrow(
      NotFoundError,
    );
  });

  it("doit lancer ValidationError si le mouvement n'est pas PENDING", async () => {
    vi.mocked(stockMovementRepository.getById).mockResolvedValue({
      ...fakePendingMovement,
      status: "VALIDATED",
    });

    await expect(validateStockMovement("123", "admin-1")).rejects.toThrow(
      ValidationError,
    );
  });

  it("doit lancer NotFoundError si le produit n'existe pas", async () => {
    vi.mocked(stockMovementRepository.getById).mockResolvedValue(
      fakePendingMovement,
    );
    vi.mocked(productRepository.getById).mockResolvedValue(null);

    await expect(validateStockMovement("123", "admin-1")).rejects.toThrow(
      NotFoundError,
    );
  });

  it("doit lancer ValidationError si le produit est archivé", async () => {
    vi.mocked(stockMovementRepository.getById).mockResolvedValue(
      fakePendingMovement,
    );
    vi.mocked(productRepository.getById).mockResolvedValue({
      ...fakeProduct,
      status: "archived",
    });

    await expect(validateStockMovement("123", "admin-1")).rejects.toThrow(
      ValidationError,
    );
  });

  it("doit lancer ValidationError si stock insuffisant pour un OUT", async () => {
    vi.mocked(stockMovementRepository.getById).mockResolvedValue({
      ...fakePendingMovement,
      type: "OUT",
      quantity: 100,
    });
    vi.mocked(productRepository.getById).mockResolvedValue(fakeProduct);

    await expect(validateStockMovement("123", "admin-1")).rejects.toThrow(
      ValidationError,
    );
  });

  it("doit valider un mouvement IN et ajouter au stock", async () => {
    vi.mocked(stockMovementRepository.getById).mockResolvedValue(
      fakePendingMovement,
    );
    vi.mocked(productRepository.getById).mockResolvedValue(fakeProduct);
    vi.mocked(productRepository.updateStockQuantity).mockResolvedValue({
      ...fakeProduct,
      quantity: 60,
    });
    vi.mocked(stockMovementRepository.markValidated).mockResolvedValue({
      ...fakePendingMovement,
      status: "VALIDATED",
      validated_by: "admin-1",
      validated_at: new Date(),
    });

    const result = await validateStockMovement("123", "admin-1");

    expect(result.status).toBe("VALIDATED");
    expect(result.validated_by).toBe("admin-1");
  });

  it("doit valider un mouvement OUT et retirer du stock", async () => {
    vi.mocked(stockMovementRepository.getById).mockResolvedValue({
      ...fakePendingMovement,
      type: "OUT",
      quantity: 10,
    });
    vi.mocked(productRepository.getById).mockResolvedValue(fakeProduct);
    vi.mocked(productRepository.updateStockQuantity).mockResolvedValue({
      ...fakeProduct,
      quantity: 40,
    });
    vi.mocked(stockMovementRepository.markValidated).mockResolvedValue({
      ...fakePendingMovement,
      type: "OUT",
      quantity: 10,
      status: "VALIDATED",
      validated_by: "admin-1",
      validated_at: new Date(),
    });

    const result = await validateStockMovement("123", "admin-1");

    expect(result.status).toBe("VALIDATED");
  });
});

// ===== createStockMovement =====

describe("createStockMovement", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const validData = {
    product_id: "550e8400-e29b-41d4-a716-446655440000",
    type: "IN",
    quantity: 10,
    reason: "Réapprovisionnement",
  };

  it("doit créer un mouvement avec des données valides", async () => {
    vi.mocked(stockMovementRepository.create).mockResolvedValue({
      ...fakePendingMovement,
      product_id: validData.product_id,
      quantity: validData.quantity,
      reason: validData.reason,
    });

    const result = await createStockMovement("user-1", validData);

    expect(result.status).toBe("PENDING");
    expect(result.quantity).toBe(10);
  });

  it("doit lancer une erreur si product_id manque", async () => {
    const badData = { ...validData, product_id: undefined };
    await expect(createStockMovement("user-1", badData)).rejects.toThrow();
  });

  it("doit lancer une erreur si la quantité est négative", async () => {
    const badData = { ...validData, quantity: -5 };
    await expect(createStockMovement("user-1", badData)).rejects.toThrow();
  });

  it("doit lancer une erreur si la quantité est 0", async () => {
    const badData = { ...validData, quantity: 0 };
    await expect(createStockMovement("user-1", badData)).rejects.toThrow();
  });

  it("doit lancer une erreur si la raison est trop courte", async () => {
    const badData = { ...validData, reason: "ab" };
    await expect(createStockMovement("user-1", badData)).rejects.toThrow();
  });

  it("doit lancer une erreur si le type n'est pas IN ou OUT", async () => {
    const badData = { ...validData, type: "INVALID" };
    await expect(createStockMovement("user-1", badData)).rejects.toThrow();
  });
});
