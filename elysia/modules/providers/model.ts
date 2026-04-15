import { t } from "elysia";
import { SupportDocumentIdentityTypeId } from "factus-js";
import { toElysiaEnum } from "@/lib/utils";

// ─── Request bodies ───────────────────────────────────────────────────────────

export const ProviderBody = t.Object({
  identification: t.String({ minLength: 1, maxLength: 20 }),
  dv: t.Optional(t.String({ maxLength: 1 })),
  identificationDocumentId: toElysiaEnum(SupportDocumentIdentityTypeId),
  names: t.String({ minLength: 1 }),
  tradeName: t.Optional(t.String()),
  countryCode: t.String({ minLength: 2, maxLength: 10 }),
  isResident: t.Optional(t.Union([t.Literal(0), t.Literal(1)])),
  address: t.Optional(t.String({ maxLength: 150 })),
  email: t.Optional(t.String()),
  phone: t.Optional(t.String()),
  municipalityId: t.Optional(t.String()),
});

// ─── Query params ─────────────────────────────────────────────────────────────

export const ProviderListQuery = t.Object({
  search: t.Optional(t.String()),
  page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 20 })),
});

// ─── Response shapes ──────────────────────────────────────────────────────────

/** Full provider detail shape used by both list and get-by-id. */
export const ProviderDetail = t.Object({
  id: t.String(),
  identification: t.String(),
  dv: t.Union([t.String(), t.Null()]),
  identificationDocumentId: toElysiaEnum(SupportDocumentIdentityTypeId),
  names: t.String(),
  tradeName: t.Union([t.String(), t.Null()]),
  countryCode: t.Union([t.String(), t.Null()]),
  isResident: t.Union([t.Number(), t.Null()]),
  address: t.Union([t.String(), t.Null()]),
  email: t.Union([t.String(), t.Null()]),
  phone: t.Union([t.String(), t.Null()]),
  municipalityId: t.Union([t.String(), t.Null()]),
  createdAt: t.String(),
  updatedAt: t.String(),
});

export const ProviderListResponse = t.Object({
  items: t.Array(ProviderDetail),
  total: t.Number(),
  page: t.Number(),
  limit: t.Number(),
});
