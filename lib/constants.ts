/**
 * Application-wide string enum constants.
 *
 * Each constant is a `readonly` tuple so it can be used as the source of truth
 * across all layers without duplication:
 *
 *   - DB schema  → `text("col", { enum: CONSTANT }).$type<DerivedType>()`
 *   - Elysia     → `toElysiaEnum(CONSTANT)` or `t.Union(CONSTANT.map(t.Literal))`
 *   - Zod        → `z.enum(CONSTANT)`
 *   - TypeScript → `(typeof CONSTANT)[number]`
 */

// ─── Products ─────────────────────────────────────────────────────────────────

export const PRODUCT_TYPES = ["product", "service"] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

// ─── Factus credentials ───────────────────────────────────────────────────────

export const FACTUS_ENVIRONMENTS = ["sandbox", "production"] as const;
export type FactusEnvironment = (typeof FACTUS_ENVIRONMENTS)[number];
