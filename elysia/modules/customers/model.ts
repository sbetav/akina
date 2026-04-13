import { t } from "elysia";
import {
  CustomerTributeId,
  IdentityDocumentTypeId,
  OrganizationTypeId,
} from "factus-js";
import { toElysiaEnum } from "@/lib/utils";

// ─── Request bodies ───────────────────────────────────────────────────────────

export const CustomerBody = t.Object({
  identification: t.String({ minLength: 1, maxLength: 20 }),
  dv: t.Optional(t.String({ maxLength: 1 })),
  identificationDocumentId: toElysiaEnum(IdentityDocumentTypeId),
  legalOrganizationId: toElysiaEnum(OrganizationTypeId),
  tributeId: toElysiaEnum(CustomerTributeId),
  name: t.String({ minLength: 1 }),
  tradeName: t.Optional(t.String()),
  address: t.Optional(t.String({ maxLength: 150 })),
  email: t.Optional(t.String()),
  phone: t.Optional(t.String()),
  municipalityId: t.Optional(t.String()),
});

// ─── Query params ─────────────────────────────────────────────────────────────

export const CustomerListQuery = t.Object({
  search: t.Optional(t.String()),
  page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 20 })),
});

// ─── Response shapes ──────────────────────────────────────────────────────────

/** Full customer detail shape used by both list and get-by-id. */
export const CustomerDetail = t.Object({
  id: t.String(),
  identification: t.String(),
  dv: t.Union([t.String(), t.Null()]),
  identificationDocumentId: toElysiaEnum(IdentityDocumentTypeId),
  legalOrganizationId: toElysiaEnum(OrganizationTypeId),
  tributeId: toElysiaEnum(CustomerTributeId),
  name: t.String(),
  tradeName: t.Union([t.String(), t.Null()]),
  address: t.Union([t.String(), t.Null()]),
  email: t.Union([t.String(), t.Null()]),
  phone: t.Union([t.String(), t.Null()]),
  municipalityId: t.Union([t.String(), t.Null()]),
  createdAt: t.String(),
  updatedAt: t.String(),
});

export const CustomerListResponse = t.Object({
  items: t.Array(CustomerDetail),
  total: t.Number(),
  page: t.Number(),
  limit: t.Number(),
});
