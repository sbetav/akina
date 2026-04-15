import { t } from "elysia";
import {
  PaymentMethodCode,
  ProductStandardId,
  SupportDocumentIdentityTypeId,
} from "factus-js";
import { toElysiaEnum } from "@/lib/utils";

// ─── Request bodies ───────────────────────────────────────────────────────────

/**
 * Provider (non-invoicing supplier) shape.
 * Uses SupportDocumentIdentityTypeId — a different enum from the standard
 * IdentityDocumentTypeId used for invoice customers.
 */
export const SupportDocumentProviderBody = t.Object({
  identificationDocumentId: toElysiaEnum(SupportDocumentIdentityTypeId),
  identification: t.String({ minLength: 1 }),
  /** Verification digit — required when identificationDocumentId is NIT. */
  dv: t.Optional(t.Number()),
  tradeName: t.Optional(t.String()),
  /** Legal name or business name of the provider. */
  names: t.String({ minLength: 1 }),
  address: t.String({ minLength: 1 }),
  email: t.String({ minLength: 1 }),
  phone: t.Optional(t.String()),
  /** Residency indicator: 0 = non-resident, 1 = resident. */
  isResident: t.Optional(t.Union([t.Literal(0), t.Literal(1)])),
  /** ISO 3166-1 alpha-2 country code (e.g. "CO"). */
  countryCode: t.String({ minLength: 1 }),
  municipalityId: t.Optional(t.String()),
});

/**
 * A single withholding tax applied to an item.
 */
export const SupportDocumentWithholdingTaxBody = t.Object({
  /** Factus tribute/withholding code — see tributes catalog. */
  code: t.String({ minLength: 1 }),
  /** Withholding rate applied. */
  withholdingTaxRate: t.Union([t.String(), t.Number()]),
});

/**
 * A single line item on the support document.
 */
export const SupportDocumentItemBody = t.Object({
  /** Internal product/service reference code. */
  codeReference: t.String({ minLength: 1 }),
  name: t.String({ minLength: 1 }),
  quantity: t.Number({ minimum: 0.001 }),
  /** Discount percentage (0–100). */
  discountRate: t.Number({ minimum: 0, maximum: 100 }),
  price: t.Number({ minimum: 0 }),
  /** Factus measurement unit ID (e.g. 70). */
  unitMeasureId: t.Number({ minimum: 1 }),
  standardCodeId: toElysiaEnum(ProductStandardId),
  withholdingTaxes: t.Optional(t.Array(SupportDocumentWithholdingTaxBody)),
});

export const SupportDocumentCreateBody = t.Object({
  /** Factus numbering range ID. Optional when only one active range exists. */
  numberingRangeId: t.Optional(t.Number({ minimum: 1 })),
  paymentMethodCode: toElysiaEnum(PaymentMethodCode),
  observation: t.Optional(t.String()),
  provider: SupportDocumentProviderBody,
  items: t.Array(SupportDocumentItemBody, { minItems: 1 }),
});

// ─── Query params ─────────────────────────────────────────────────────────────

export const SupportDocumentListQuery = t.Object({
  /** Searches against providerName and number. */
  search: t.Optional(t.String()),
  page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 20 })),
});

// ─── Response bodies ──────────────────────────────────────────────────────────

/**
 * A single support document record stored in our DB.
 * Returned by create, list, and as ownership context for Factus calls.
 */
export const SupportDocumentRecord = t.Object({
  id: t.String(),
  number: t.String(),
  /** 0 = not validated (can be deleted), 1 = validated by DIAN. */
  status: t.Number(),
  providerName: t.String(),
  providerIdentification: t.String(),
  total: t.Union([t.String(), t.Null()]),
  createdAt: t.String(),
  updatedAt: t.String(),
});

export const SupportDocumentListResponse = t.Object({
  items: t.Array(SupportDocumentRecord),
  total: t.Number(),
  page: t.Number(),
  limit: t.Number(),
});

/**
 * PDF download response — wraps the Factus base64-encoded PDF.
 */
export const SupportDocumentPdfResponse = t.Object({
  fileName: t.String(),
  pdfBase64: t.String(),
});

/**
 * Full support document detail as returned by Factus.
 * The inner data shape is complex and defined by the factus-js types.
 */
export const SupportDocumentViewResponse = t.Object({
  data: t.Any(),
});

/**
 * 422 response that may carry DIAN validation rule violations.
 * validationErrors keys are DIAN rule codes, values are the rejection descriptions.
 * Factus returns values as string arrays; the union type keeps response validation passing.
 */
export const SupportDocumentValidationError = t.Object({
  error: t.String(),
  validationErrors: t.Optional(
    t.Record(t.String(), t.Union([t.String(), t.Array(t.String())])),
  ),
});
