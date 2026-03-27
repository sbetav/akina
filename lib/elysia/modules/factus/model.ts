import { t } from "elysia";

// ─── Credential CRUD bodies ───────────────────────────────────────────────────

export const Environment = t.Union([
  t.Literal("sandbox"),
  t.Literal("production"),
]);

export const CredentialBody = t.Object({
  name: t.String({ minLength: 1 }),
  clientId: t.String({ minLength: 1 }),
  clientSecret: t.String({ minLength: 1 }),
  username: t.String({ minLength: 1 }),
  password: t.String({ minLength: 1 }),
  environment: Environment,
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
  environment: Environment,
});

/**
 * A credential list item — no secrets returned.
 */
export const CredentialItem = t.Object({
  id: t.String(),
  name: t.String(),
  username: t.String(),
  clientId: t.String(),
  environment: Environment,
  isActive: t.Boolean(),
  isValid: t.Boolean(),
});

/**
 * Full credential detail including decrypted secrets — used for edit prefill.
 */
export const CredentialDetail = t.Object({
  ...CredentialItem.properties,
  clientSecret: t.String(),
  password: t.String(),
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

export const AcquirerResponse = t.Object({
  name: t.String(),
  email: t.String(),
});
