import { t } from "elysia";
import {
  CustomerTributeId,
  IdentityDocumentTypeId,
  OrganizationTypeId,
  PaymentFormCode,
  PaymentMethodCode,
  ProductStandardId,
} from "factus-js";
import { toElysiaEnum } from "@/lib/utils";

// ─── Request bodies ───────────────────────────────────────────────────────────

/**
 * Customer shape as stored in our DB (camelCase).
 * Mapped to the Factus snake_case format in the service.
 */
export const InvoiceCustomerBody = t.Object({
  identification: t.String({ minLength: 1 }),
  /** Verification digit — required when identificationDocumentId is NIT ("6"). */
  dv: t.Optional(t.String()),
  identificationDocumentId: toElysiaEnum(IdentityDocumentTypeId),
  legalOrganizationId: toElysiaEnum(OrganizationTypeId),
  tributeId: toElysiaEnum(CustomerTributeId),
  /** Legal name or full name — sent as both `company` and `names` to Factus. */
  name: t.String({ minLength: 1 }),
  tradeName: t.Optional(t.String()),
  address: t.Optional(t.String()),
  email: t.Optional(t.String()),
  phone: t.Optional(t.String()),
  municipalityId: t.Optional(t.String()),
});

/**
 * A single invoice line item — combines product fields (our DB shape)
 * with per-item fields provided by the user (quantity, discountRate).
 */
export const InvoiceItemBody = t.Object({
  /** Product reference code (code_reference in Factus). */
  code: t.String({ minLength: 1 }),
  name: t.String({ minLength: 1 }),
  /**
   * Base unit price from our catalog.
   * Before sending to Factus we convert it to a unit price including taxes,
   * while discounts continue to travel separately in `discountRate`.
   */
  price: t.Number({ minimum: 0 }),
  /**
   * Tax rate as a decimal (e.g. 0.19 for 19% IVA).
   * Converted to a percentage string ("19.00") before sending to Factus.
   */
  taxRate: t.Number({ minimum: 0 }),
  /**
   * Factus measurement unit ID.
   * Stored as text in our DB (e.g. "70") — sent as a number to Factus.
   */
  unitMeasureId: t.String({ minLength: 1 }),
  standardCodeId: toElysiaEnum(ProductStandardId),
  /** Whether the product is excluded from the tax regime (true → 1, false → 0). */
  isExcluded: t.Boolean(),
  /**
   * Factus tribute ID.
   * Stored as text in our DB (e.g. "1") — sent as a number to Factus.
   */
  tributeId: t.String({ minLength: 1 }),
  /** Number of units to invoice. */
  quantity: t.Number({ minimum: 0.001 }),
  /** Discount percentage (0–100). */
  discountRate: t.Number({ minimum: 0, maximum: 100 }),
});

export const InvoiceCreateBody = t.Object({
  /** Factus numbering range ID. Optional when there is only one active range. */
  numberingRangeId: t.Optional(t.Number({ minimum: 1 })),
  observation: t.Optional(t.String()),
  /** "1" = cash, "2" = credit. */
  paymentForm: t.Optional(toElysiaEnum(PaymentFormCode)),
  /** Required when paymentForm = "2" (credit). Format: YYYY-MM-DD. */
  paymentDueDate: t.Optional(t.String()),
  paymentMethodCode: t.Optional(toElysiaEnum(PaymentMethodCode)),
  /** When true, Factus sends the invoice by email automatically. */
  sendEmail: t.Optional(t.Boolean()),
  customer: InvoiceCustomerBody,
  items: t.Array(InvoiceItemBody, { minItems: 1 }),
});

// ─── Query params ─────────────────────────────────────────────────────────────

export const InvoiceListQuery = t.Object({
  /** Searches against customerName and number. */
  search: t.Optional(t.String()),
  page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 20 })),
});

// ─── Response bodies ──────────────────────────────────────────────────────────

/**
 * A single invoice record stored in our DB.
 * Returned by create, list, and as ownership context for Factus calls.
 */
export const InvoiceRecord = t.Object({
  id: t.String(),
  number: t.String(),
  /** 0 = not validated (can be deleted), 1 = validated by DIAN. */
  status: t.Number(),
  customerName: t.String(),
  customerIdentification: t.String(),
  total: t.Union([t.String(), t.Null()]),
  createdAt: t.String(),
  updatedAt: t.String(),
});

export const InvoiceListResponse = t.Object({
  items: t.Array(InvoiceRecord),
  total: t.Number(),
  page: t.Number(),
  limit: t.Number(),
});

/**
 * PDF download response — wraps the Factus base64-encoded PDF.
 */
export const InvoicePdfResponse = t.Object({
  fileName: t.String(),
  pdfBase64: t.String(),
});

/**
 * Full invoice detail as returned by Factus (Bill view payload).
 * The inner data shape is complex and defined by the factus-js types.
 */
export const InvoiceViewResponse = t.Object({
  data: t.Any(),
});

/**
 * 422 response that may carry DIAN validation rule violations.
 * validationErrors keys are DIAN rule codes (e.g. "FAK24"),
 * values are the rejection descriptions.
 */
export const InvoiceValidationError = t.Object({
  error: t.String(),
  validationErrors: t.Optional(t.Record(t.String(), t.String())),
});
