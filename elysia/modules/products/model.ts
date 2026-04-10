import { t } from "elysia";
import { ProductStandardId } from "factus-js";
import { toElysiaEnum } from "@/lib/utils";

// ─── Request bodies ───────────────────────────────────────────────────────────

export const ProductBody = t.Object({
  code: t.String({ minLength: 1, maxLength: 50 }),
  name: t.String({ minLength: 1, maxLength: 200 }),
  description: t.Optional(t.String({ maxLength: 1000 })),
  price: t.Numeric({ minimum: 0 }),
  unitMeasureId: t.String({ minLength: 1 }),
  standardCodeId: toElysiaEnum(ProductStandardId),
  tributeId: t.String({ minLength: 1 }),
  taxRate: t.Numeric({ minimum: 0, maximum: 100 }),
  isExcluded: t.Boolean(),
});

// ─── Query params ─────────────────────────────────────────────────────────────

export const ProductListQuery = t.Object({
  search: t.Optional(t.String()),
  page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 20 })),
});

export const ProductCodeAvailabilityQuery = t.Object({
  code: t.String({ minLength: 1, maxLength: 50 }),
});

// ─── Response shapes ──────────────────────────────────────────────────────────

/**
 * Compact row returned in list view — enough to populate a product table
 * and drive a "select product" flow (e.g. when creating an invoice).
 */
export const ProductItem = t.Object({
  id: t.String(),
  code: t.String(),
  name: t.String(),
  price: t.Numeric(),
  unitMeasureId: t.String(),
  tributeId: t.String(),
  taxRate: t.Numeric(),
  isExcluded: t.Boolean(),
  createdAt: t.String(),
});

/**
 * Full product detail — used for edit prefill.
 */
export const ProductDetail = t.Object({
  id: t.String(),
  code: t.String(),
  name: t.String(),
  description: t.Union([t.String(), t.Null()]),
  price: t.Numeric(),
  unitMeasureId: t.String(),
  standardCodeId: toElysiaEnum(ProductStandardId),
  tributeId: t.String(),
  taxRate: t.Numeric(),
  isExcluded: t.Boolean(),
  createdAt: t.String(),
  updatedAt: t.String(),
});

export const ProductListResponse = t.Object({
  items: t.Array(ProductItem),
  total: t.Number(),
  page: t.Number(),
  limit: t.Number(),
});
