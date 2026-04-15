import { t } from "elysia";
import {
  CreditNoteCorrectionCode,
  PaymentMethodCode,
  ProductStandardId,
} from "factus-js";
import { toElysiaEnum } from "@/lib/utils";

export const CreditNoteItemBody = t.Object({
  code: t.String({ minLength: 1 }),
  name: t.String({ minLength: 1 }),
  price: t.Number({ minimum: 0 }),
  taxRate: t.Number({ minimum: 0 }),
  unitMeasureId: t.String({ minLength: 1 }),
  standardCodeId: toElysiaEnum(ProductStandardId),
  isExcluded: t.Boolean(),
  tributeId: t.String({ minLength: 1 }),
  quantity: t.Number({ minimum: 0.001 }),
  discountRate: t.Number({ minimum: 0, maximum: 100 }),
});

export const CreditNoteCreateBody = t.Object({
  numberingRangeId: t.Optional(t.Number({ minimum: 1 })),
  correctionConceptCode: toElysiaEnum(CreditNoteCorrectionCode),
  observation: t.Optional(t.String()),
  paymentMethodCode: toElysiaEnum(PaymentMethodCode),
  sendEmail: t.Optional(t.Boolean()),
  items: t.Array(CreditNoteItemBody, { minItems: 1 }),
});

export const CreditNoteRecord = t.Object({
  id: t.String(),
  invoiceId: t.String(),
  number: t.String(),
  status: t.Number(),
  customerName: t.String(),
  customerIdentification: t.String(),
  total: t.Union([t.String(), t.Null()]),
  createdAt: t.String(),
  updatedAt: t.String(),
});

export const CreditNoteListResponse = t.Object({
  items: t.Array(CreditNoteRecord),
});

export const CreditNotePdfResponse = t.Object({
  fileName: t.String(),
  pdfBase64: t.String(),
});

export const CreditNoteViewResponse = t.Object({
  data: t.Any(),
});

export const CreditNoteValidationError = t.Object({
  error: t.String(),
  validationErrors: t.Optional(t.Record(t.String(), t.String())),
});
