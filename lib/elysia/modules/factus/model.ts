import { t } from "elysia";

// ─── Credential CRUD bodies ───────────────────────────────────────────────────

export const CredentialBody = t.Object({
  name: t.String({ minLength: 1 }),
  clientId: t.String({ minLength: 1 }),
  clientSecret: t.String({ minLength: 1 }),
  username: t.String({ minLength: 1 }),
  password: t.String({ minLength: 1 }),
  environment: t.Union([t.Literal("sandbox"), t.Literal("production")]),
});

// ─── Catalog query params ─────────────────────────────────────────────────────

export const AcquirerQuery = t.Object({
  identificationDocumentId: t.String({ minLength: 1 }),
  identificationNumber: t.String({ minLength: 1 }),
});

export const MunicipalitiesQuery = t.Object({
  name: t.Optional(t.String()),
});

// ─── Response bodies ──────────────────────────────────────────────────────────

/**
 * Simplified connection status — just whether the active credential is valid
 * and what environment it targets. Always reflects sandbox if no active credential.
 */
export const ConnectionResponse = t.Object({
  isValid: t.Boolean(),
  environment: t.Union([t.Literal("sandbox"), t.Literal("production")]),
});

/**
 * A credential list item — no secrets returned.
 */
export const CredentialItem = t.Object({
  id: t.String(),
  name: t.String(),
  description: t.String(),
  environment: t.Union([t.Literal("sandbox"), t.Literal("production")]),
  isActive: t.Boolean(),
  isValid: t.Boolean(),
});

/**
 * Full credential detail including decrypted secrets — used for edit prefill.
 */
export const CredentialDetail = t.Object({
  id: t.String(),
  name: t.String(),
  clientId: t.String(),
  clientSecret: t.String(),
  username: t.String(),
  password: t.String(),
  environment: t.Union([t.Literal("sandbox"), t.Literal("production")]),
  isActive: t.Boolean(),
});

export const CredentialListResponse = t.Object({
  items: t.Array(CredentialItem),
});

export const MunicipalityItem = t.Object({
  id: t.Number(),
  code: t.String(),
  name: t.String(),
  department: t.String(),
});

/** TypeScript type for a municipality (mirrors MunicipalityItem schema) */
export interface Municipality {
  id: number;
  code: string;
  name: string;
  department: string;
}

export const AcquirerResponse = t.Object({
  name: t.String(),
  email: t.String(),
});
