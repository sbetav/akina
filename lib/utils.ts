import { clsx, type ClassValue } from "clsx";
import { t } from "elysia";
import { twMerge } from "tailwind-merge";
import z from "zod";

/**
 * Merges conditional class names and resolves Tailwind conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Wraps a Zod schema in a permissive schema that always runs validation,
 * forwarding all nested issues into the parent refinement context.
 *
 * Useful when integrating Zod validation in places where the outer schema
 * is `any` but you still want full error details.
 */
export function zodAlwaysRefine<T extends z.ZodTypeAny>(zodType: T) {
  return z.any().superRefine(async (value, ctx) => {
    const res = await zodType.safeParseAsync(value);

    if (res.success === false)
      for (const issue of res.error.issues) {
        ctx.addIssue({
          code: "invalid_type",
          expected: "any",
          message: issue.message,
          path: issue.path,
          input: value,
        });
      }
  }) as unknown as T;
}

/**
 * Normalizes and formats document identifiers using Colombian locale grouping.
 *
 * @example
 * formatDocumentNumber("900123456") // "900.123.456"
 */
export function formatDocumentNumber(value: string | number) {
  if (!value) return "";
  const number = Number(value.toString().replace(/\D/g, ""));
  return number.toLocaleString("es-CO");
}

/**
 * Extracts `.value` fields from a catalog object as a non-empty tuple.
 *
 * Designed for Zod enum-like use cases where tuple inference is required.
 */
export function toEnumValues<T extends Record<string, { value: string }>>(
  obj: T,
): [T[keyof T]["value"], ...T[keyof T]["value"][]] {
  return Object.values(obj).map((d) => d.value) as never;
}

/**
 * Converts a factus-js catalog object into a TypeBox Union of Literals,
 * for use in Elysia model schemas.
 *
 * Mirrors `toEnumValues` (which targets Zod) but produces a `t.Union`
 * so Elysia infers the correct narrow type from request bodies.
 *
 * @example
 * standardCodeId: toElysiaEnum(ProductStandardId)
 */
export function toElysiaEnum<T extends Record<string, { value: string }>>(
  obj: T,
) {
  const literals = Object.values(obj).map((entry) =>
    t.Literal(entry.value),
  ) as [
    ReturnType<typeof t.Literal<T[keyof T]["value"]>>,
    ...ReturnType<typeof t.Literal<T[keyof T]["value"]>>[],
  ];
  return t.Union(literals);
}

/**
 * Converts a `readonly` string tuple (e.g. from `lib/constants.ts`) into a
 * TypeBox Union of Literals, for use in Elysia model schemas.
 *
 * Use this for app-defined constant tuples; use `toElysiaEnum` for
 * factus-js catalog objects.
 *
 * @example
 * type: toElysiaLiterals(PRODUCT_TYPES)     // "product" | "service"
 * environment: toElysiaLiterals(FACTUS_ENVIRONMENTS)
 */
export function toElysiaLiterals<T extends readonly [string, ...string[]]>(
  values: T,
) {
  const literals = values.map((v) => t.Literal(v)) as [
    ReturnType<typeof t.Literal<T[number]>>,
    ...ReturnType<typeof t.Literal<T[number]>>[],
  ];
  return t.Union(literals);
}

/**
 * Formats a sequential reference code with a prefix and zero-padded number.
 * Used to generate human-readable identifiers across modules
 * (products, invoices, credit notes, etc.).
 *
 * @example
 * formatRef("P", 1)       // "P-0001"
 * formatRef("INV", 42)    // "INV-0042"
 * formatRef("CN", 5, 6)   // "CN-000005"
 */
export function formatRef(
  prefix: string,
  sequence: number,
  padLength = 4,
): string {
  return `${prefix}-${sequence.toString().padStart(padLength, "0")}`;
}
