import { t } from "elysia";

// ─── Request bodies ───────────────────────────────────────────────────────────

export const CustomerBody = t.Object({
  identification: t.String({ minLength: 1, maxLength: 20 }),
  dv: t.Optional(t.String({ maxLength: 1 })),
  identificationDocumentId: t.String({ minLength: 1 }),
  legalOrganizationId: t.String({ minLength: 1 }),
  tributeId: t.String({ minLength: 1 }),
  name: t.String({ minLength: 1 }),
  tradeName: t.Optional(t.String()),
  address: t.String({ minLength: 1, maxLength: 150 }),
  email: t.String({ format: "email" }),
  phone: t.String({ minLength: 1 }),
  municipalityId: t.String({ minLength: 1 }),
});

// ─── Query params ─────────────────────────────────────────────────────────────

export const CustomerListQuery = t.Object({
  search: t.Optional(t.String()),
  page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 20 })),
});

// ─── Response shapes ──────────────────────────────────────────────────────────

/**
 * Compact row returned in list view — enough to populate table columns
 * and drive a "select customer" flow (e.g. when creating an invoice).
 */
export const CustomerItem = t.Object({
  id: t.String(),
  identification: t.String(),
  identificationDocumentId: t.String(),
  name: t.String(),
  email: t.String(),
  phone: t.String(),
  municipalityId: t.String(),
  createdAt: t.String(),
});

/**
 * Full customer detail — used for edit prefill.
 */
export const CustomerDetail = t.Object({
  id: t.String(),
  identification: t.String(),
  dv: t.Union([t.String(), t.Null()]),
  identificationDocumentId: t.String(),
  legalOrganizationId: t.String(),
  tributeId: t.String(),
  name: t.String(),
  tradeName: t.Union([t.String(), t.Null()]),
  address: t.String(),
  email: t.String(),
  phone: t.String(),
  municipalityId: t.String(),
  createdAt: t.String(),
  updatedAt: t.String(),
});

export const CustomerListResponse = t.Object({
  items: t.Array(CustomerItem),
  total: t.Number(),
  page: t.Number(),
  limit: t.Number(),
});
