import { FACTUS_ENVIRONMENTS } from "@/lib/constants";
import { toElysiaEnum, toElysiaLiterals } from "@/lib/utils";
import { t } from "elysia";
import { IdentityDocumentTypeId } from "factus-js";

// ─── Credential CRUD bodies ───────────────────────────────────────────────────

export const Environment = toElysiaLiterals(FACTUS_ENVIRONMENTS);

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
  identificationDocumentId: toElysiaEnum(IdentityDocumentTypeId),
  identificationNumber: t.String({ minLength: 1 }),
});

export const MunicipalitiesQuery = t.Object({
  name: t.Optional(t.String()),
});

// ─── Response bodies ──────────────────────────────────────────────────────────

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
