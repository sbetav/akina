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
 * Tokenizes a free-text search query into reusable terms.
 *
 * - Trims and removes punctuation.
 * - Splits by whitespace.
 * - Adds a compact numeric token (digits only) when present.
 * - De-duplicates resulting terms.
 */
export function getSearchTerms(rawSearch?: string): string[] {
  if (!rawSearch) return [];

  const trimmed = rawSearch.trim();
  if (!trimmed) return [];

  const textTerms = trimmed
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .split(/\s+/)
    .filter((term) => term.length > 0);

  const compactDigits = trimmed.replace(/\D/g, "");
  const isAlreadyCompact =
    textTerms.length === 1 && textTerms[0] === compactDigits;
  const terms =
    compactDigits && !isAlreadyCompact
      ? [...textTerms, compactDigits]
      : textTerms;

  return [...new Set(terms)];
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

/**
 * Performs a shallow comparison between two objects.
 *
 * Only compares first-level keys using strict equality (`===`).
 * Does NOT support nested structures.
 *
 * @param {Record<string, unknown>} initial - The original object.
 * @param {Record<string, unknown>} current - The current object.
 * @returns {boolean} Returns `true` if any top-level value differs.
 *
 * @example
 * hasShallowChanges({ a: 1 }, { a: 1 }) // false
 * hasShallowChanges({ a: 1 }, { a: 2 }) // true
 */
export function hasShallowChanges(
  initial: Record<string, unknown>,
  current: Record<string, unknown>,
): boolean {
  if (initial === current) return false;

  const keys = Object.keys(initial);
  if (keys.length !== Object.keys(current).length) return true;

  return keys.some((key) => initial[key] !== current[key]);
}

/**
 * Parses a user agent string and extracts basic device, browser, and OS information.
 *
 * @param ua - The user agent string to parse. Can be null or undefined.
 * @returns An object containing:
 * - `device`: A human-readable label combining browser and OS, or a fallback string.
 * - `browser`: Detected browser name, or null if unknown.
 * - `os`: Detected operating system, or null if unknown.
 * - `icon`: A simplified device type ("desktop", "laptop", or "mobile").
 */
export function parseUserAgent(ua: string | null | undefined): {
  device: string;
  browser: string | null;
  os: string | null;
  icon: "desktop" | "laptop" | "mobile";
} {
  if (!ua)
    return {
      device: "Dispositivo desconocido",
      browser: null,
      os: null,
      icon: "desktop",
    };

  const isMobile = /android|iphone|ipad|mobile/i.test(ua);
  const isLaptop = /macintosh|mac os x/i.test(ua) && !isMobile;

  const browser = ua.match(/Edg\/[\d.]+/)
    ? "Edge"
    : ua.match(/OPR\/[\d.]+/)
      ? "Opera"
      : ua.match(/Chrome\/[\d.]+/)
        ? "Chrome"
        : ua.match(/Firefox\/[\d.]+/)
          ? "Firefox"
          : ua.match(/Safari\/[\d.]+/)
            ? "Safari"
            : null;

  const os = ua.match(/Windows NT/i)
    ? "Windows"
    : ua.match(/Mac OS X/i)
      ? "macOS"
      : ua.match(/Linux/i)
        ? "Linux"
        : ua.match(/Android/i)
          ? "Android"
          : ua.match(/iPhone|iPad/i)
            ? "iOS"
            : null;

  const parts = [browser, os].filter(Boolean);
  return {
    device: parts.length > 0 ? parts.join(" · ") : "Navegador",
    browser,
    os,
    icon: isMobile ? "mobile" : isLaptop ? "laptop" : "desktop",
  };
}

/**
 * Fetches an approximate geographic location (city and country) for a given IP address.
 *
 * Uses the ip-api.com service to resolve the IP into a human-readable location.
 *
 * @param ip - The IP address to look up. Can be null, undefined, or a loopback address.
 * @returns A string in the format "City, Country" if successful, or null if:
 * - The IP is invalid, local, or unspecified
 * - The API request fails
 * - The lookup is unsuccessful
 */
export async function fetchLocation(
  ip: string | null | undefined,
): Promise<string | null> {
  // Skip loopback / unspecified addresses
  if (!ip || ip === "::1" || /^0+(:0+)*$/.test(ip) || ip === "127.0.0.1")
    return null;

  try {
    const res = await fetch(
      `https://ip-api.com/json/${ip}?fields=city,country,status`,
    );
    const data = await res.json();
    if (data.status !== "success") return null;
    return [data.city, data.country].filter(Boolean).join(", ");
  } catch {
    return null;
  }
}
