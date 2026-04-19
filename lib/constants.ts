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

/** Shown on the landing page and before the dashboard product tour. */
export const DEMO_DISCLAIMER =
  "Akina es una aplicación de demostración. Sirve para explorar el flujo pero no está pensada para usarse en un entorno real.";

// ─── Factus credentials ───────────────────────────────────────────────────────

export const AKINA_SANDBOX_ID = "akina-sandbox";
export const FACTUS_ENVIRONMENTS = ["sandbox", "production"] as const;
export type FactusEnvironment = (typeof FACTUS_ENVIRONMENTS)[number];
