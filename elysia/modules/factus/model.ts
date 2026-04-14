import { t } from "elysia";
import {
  IdentityDocumentTypeId,
  NumberingRangeDocumentTypeCode,
} from "factus-js";
import { FACTUS_ENVIRONMENTS } from "@/lib/constants";
import { toElysiaEnum, toElysiaLiterals } from "@/lib/utils";

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

export const NumberingRangeListQuery = t.Object({
  id: t.Optional(t.String()),
  document: t.Optional(toElysiaEnum(NumberingRangeDocumentTypeCode)),
  resolutionNumber: t.Optional(t.String()),
  technicalKey: t.Optional(t.String()),
  isActive: t.Optional(t.Union([t.Literal("0"), t.Literal("1")])),
  page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 20 })),
});

export const NumberingRangeCreateBody = t.Object({
  document: toElysiaEnum(NumberingRangeDocumentTypeCode),
  prefix: t.String({ minLength: 1 }),
  current: t.Number({ minimum: 1 }),
  resolutionNumber: t.Optional(t.String({ minLength: 1 })),
});

export const NumberingRangeUpdateCurrentBody = t.Object({
  current: t.Number({ minimum: 1 }),
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

export const MeasurementUnitItem = t.Object({
  id: t.Number(),
  code: t.String(),
  name: t.String(),
});

export const TributeItem = t.Object({
  id: t.Number(),
  code: t.String(),
  name: t.String(),
  description: t.String(),
});

export const NumberingRangeItem = t.Object({
  id: t.Number(),
  document: t.String(),
  documentName: t.Optional(t.String()),
  prefix: t.String(),
  from: t.Union([t.Number(), t.Null()]),
  to: t.Union([t.Number(), t.Null()]),
  current: t.Number(),
  resolutionNumber: t.Union([t.String(), t.Null()]),
  startDate: t.Union([t.String(), t.Null()]),
  endDate: t.Union([t.String(), t.Null()]),
  technicalKey: t.Union([t.String(), t.Null()]),
  isExpired: t.Boolean(),
  isActive: t.Boolean(),
  deletedAt: t.Optional(t.Union([t.String(), t.Null()])),
  createdAt: t.String(),
  updatedAt: t.String(),
});

export const NumberingRangeListResponse = t.Object({
  items: t.Array(NumberingRangeItem),
  total: t.Number(),
  page: t.Number(),
  limit: t.Number(),
});

export const NumberingRangeCatalogResponse = t.Object({
  data: t.Array(NumberingRangeItem),
});
