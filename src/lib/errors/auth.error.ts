export class AuthError extends Error {
  constructor(message = "Non authentifié") {
    super(message);
    this.name = "AuthError";
  }
}
