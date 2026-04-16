import { t } from "elysia";
import {
  AdjustmentNoteReasonCode,
  PaymentMethodCode,
  ProductStandardId,
} from "factus-js";
import { toElysiaEnum } from "@/lib/utils";

// ─── Request bodies ───────────────────────────────────────────────────────────

/**
 * A single line item on the adjustment note.
 * Mirrors CreateAdjustmentNoteInput items — withholding taxes are not
 * part of the Factus adjustment note item shape.
 */
export const AdjustmentNoteItemBody = t.Object({
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
});

export const AdjustmentNoteCreateBody = t.Object({
  /** Factus numeric ID of the parent support document. */
  supportDocumentFactusId: t.Number({ minimum: 1 }),
  /** Factus numbering range ID. Optional when only one active range exists. */
  numberingRangeId: t.Optional(t.Number({ minimum: 1 })),
  correctionConceptCode: toElysiaEnum(AdjustmentNoteReasonCode),
  paymentMethodCode: t.Optional(toElysiaEnum(PaymentMethodCode)),
  observation: t.Optional(t.String()),
  sendEmail: t.Optional(t.Boolean()),
  items: t.Array(AdjustmentNoteItemBody, { minItems: 1 }),
});

// ─── Response bodies ──────────────────────────────────────────────────────────

/**
 * A single adjustment note record stored in our DB.
 * Returned by create, list, and as ownership context for Factus calls.
 */
export const AdjustmentNoteRecord = t.Object({
  id: t.String(),
  supportDocumentId: t.String(),
  number: t.String(),
  /** 0 = not validated (can be deleted), 1 = validated by DIAN. */
  status: t.Number(),
  providerName: t.String(),
  providerIdentification: t.String(),
  total: t.Union([t.String(), t.Null()]),
  createdAt: t.String(),
  updatedAt: t.String(),
});

export const AdjustmentNoteListResponse = t.Object({
  items: t.Array(AdjustmentNoteRecord),
});

/**
 * PDF download response — wraps the Factus base64-encoded PDF.
 */
export const AdjustmentNotePdfResponse = t.Object({
  fileName: t.String(),
  pdfBase64: t.String(),
});

/**
 * Full adjustment note detail as returned by Factus.
 * The inner data shape is complex and defined by the factus-js types.
 */
export const AdjustmentNoteViewResponse = t.Object({
  data: t.Any(),
});

/**
 * 422 response that may carry DIAN validation rule violations.
 */
export const AdjustmentNoteValidationError = t.Object({
  error: t.String(),
  validationErrors: t.Optional(
    t.Record(t.String(), t.Union([t.String(), t.Array(t.String())])),
  ),
});
