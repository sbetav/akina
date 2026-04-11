import { type ClassValue, clsx } from "clsx";
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
 * Formats a document identification number based on its content.
 *
 * - If the value is purely numeric, it formats it using Colombian locale grouping.
 * - If the value contains letters, it returns it in uppercase.
 *
 * @param value - The document number to format, either as a string or number.
 * @returns The formatted document number as a string, or an empty string if the value is falsy.
 *
 * @example
 * formatDocumentNumber("900123456")  // "900.123.456"
 * formatDocumentNumber("pe-123456")  // "PE-123456"
 */
export function formatDocumentNumber(value: string | number): string {
  if (!value) return "";
  const str = value.toString().trim();
  const digitsOnly = str.replace(/\D/g, "");

  if (digitsOnly.length === str.length) {
    return Number(digitsOnly).toLocaleString("es-CO");
  }

  return str.toUpperCase();
}

/**
 * Calculates the verification digit (DV) for a Colombian NIT number.
 *
 * The DV is a single digit derived from the NIT using the official DIAN
 * weighted sum algorithm. It is used to verify that a NIT number has not
 * been mistyped or corrupted.
 *
 * @param nit - The NIT number as a string or number, with or without formatting.
 * @returns The calculated DV as a single character string ("0"-"9"),
 *          or an empty string if the NIT is invalid or too short.
 *
 * @example
 * calculateDV("900123456")  // "8"
 */
export function calculateDV(nit: string | number): string {
  const digits = nit.toString().replace(/\D/g, "");
  if (!digits || digits.length < 2) return "";

  const weights = [71, 67, 59, 53, 47, 43, 41, 37, 29, 23, 19, 17, 13, 7, 3];

  const sum = digits
    .split("")
    .reverse()
    .reduce((acc, digit, i) => acc + parseInt(digit, 10) * weights[i], 0);

  const remainder = sum % 11;
  return String(remainder < 2 ? remainder : 11 - remainder);
}

/**
 * Extracts string values from a constant object as a non-empty tuple.
 *
 * Designed for Zod enum-like use cases where tuple inference is required.
 */
export function toEnumValues<T extends Record<string, string>>(
  obj: T,
): [T[keyof T], ...T[keyof T][]] {
  return Object.values(obj) as never;
}

/**
 * Converts a factus-js constant object into a TypeBox Union of Literals,
 * for use in Elysia model schemas.
 *
 * Mirrors `toEnumValues` (which targets Zod) but produces a `t.Union`
 * so Elysia infers the correct narrow type from request bodies.
 *
 * @example
 * standardCodeId: toElysiaEnum(ProductStandardId)
 */
export function toElysiaEnum<T extends Record<string, string>>(obj: T) {
  const literals = Object.values(obj).map((entry) => t.Literal(entry)) as [
    ReturnType<typeof t.Literal<T[keyof T]>>,
    ...ReturnType<typeof t.Literal<T[keyof T]>>[],
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

/**
 * Formats a number as a currency string in Colombian Peso.
 * Used to format numbers as currency in the UI.
 *
 * @example
 * COP.format(1000000) // "$ 1.000.000"
 */

export const COP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});
