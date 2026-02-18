import { SignJWT, jwtVerify } from "jose";

/**
 * Liste officielle des rôles autorisés.
 * On la définit en constante readonly pour garantir
 * l'alignement entre TypeScript et la logique métier.
 */
const ALLOWED_ROLES = ["ADMIN", "MANAGER", "EMPLOYEE"] as const;

/**
 * Type Role généré automatiquement à partir de ALLOWED_ROLES.
 * Cela évite toute divergence future.
 */
type Role = (typeof ALLOWED_ROLES)[number];

/**
 * Structure du payload JWT.
 * Ce que l'on stocke dans le token :
 * - id : identifiant utilisateur
 * - role : rôle validé
 */
export interface JwtPayload {
  id: string;
  role: Role;
}

/**
 * Récupère et encode le secret JWT.
 * Si le secret est absent → erreur immédiate.
 * Cela évite de démarrer l'application dans un état dangereux.
 */
function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET manquant dans les variables d'environnement");
  }

  return new TextEncoder().encode(secret);
}

/**
 * Génère un JWT signé.
 *
 * - alg HS256 : signature HMAC sécurisée
 * - setIssuedAt : ajoute la date d'émission
 * - setExpirationTime : expiration courte (15 minutes)
 */
export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(getSecret());
}

/**
 * Vérifie qu'un token est valide :
 * - Signature correcte
 * - Non expiré
 * - Payload conforme à notre structure attendue
 *
 * Si le payload ne respecte pas notre format → erreur.
 */
export async function verifyToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getSecret());

  // Validation runtime stricte du payload
  if (typeof payload.id !== "string") {
    throw new Error("Payload JWT invalide : id manquant ou incorrect");
  }

  if (
    typeof payload.role !== "string" ||
    !ALLOWED_ROLES.includes(payload.role as Role)
  ) {
    throw new Error("Payload JWT invalide : rôle incorrect");
  }

  return {
    id: payload.id,
    role: payload.role as Role,
  };
}
