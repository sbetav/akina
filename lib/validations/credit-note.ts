import {
  CreditNoteCorrectionCode,
  PaymentMethodCode,
  ProductStandardId,
  type ViewBillData,
} from "factus-js";
import z from "zod";
import { toEnumValues } from "@/lib/utils";

const correctionConceptCodes = toEnumValues(CreditNoteCorrectionCode);
const paymentMethodCodes = toEnumValues(PaymentMethodCode);
const productStandardIds = toEnumValues(ProductStandardId);

export const creditNoteItemSchema = z.object({
  code: z.string().nonempty(),
  name: z.string().nonempty(),
  price: z.coerce.number().min(0),
  taxRate: z.coerce.number().min(0),
  unitMeasureId: z.string().nonempty(),
  standardCodeId: z.enum(productStandardIds, {
    error: () => "Campo requerido",
  }),
  isExcluded: z.boolean(),
  tributeId: z.string().nonempty(),
  quantity: z.coerce.number({ error: "Campo requerido" }).min(0),
  maxQuantity: z.coerce.number().min(0.001),
  discountRate: z.coerce.number().min(0).max(100),
});

export type CreditNoteItemValues = z.infer<typeof creditNoteItemSchema>;

export const creditNoteFormSchema = z
  .object({
    numberingRangeId: z
      .number({ error: "Campo requerido" })
      .min(1, "Selecciona un rango de numeración"),
    correctionConceptCode: z.enum(correctionConceptCodes, {
      error: () => "Campo requerido",
    }),
    observation: z.string().max(250, "Máximo 250 caracteres").optional(),
    paymentMethodCode: z.enum(paymentMethodCodes, {
      error: () => "Campo requerido",
    }),
    sendEmail: z.boolean(),
    items: z
      .array(creditNoteItemSchema)
      .min(1, "Selecciona al menos un producto de la factura")
      .refine(
        (items) => items.some((item) => item.quantity > 0),
        "Ingresa al menos una cantidad a devolver",
      ),
  })
  .superRefine((data, ctx) => {
    data.items.forEach((item, index) => {
      if (item.quantity > item.maxQuantity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["items", index, "quantity"],
          message: `La cantidad no puede superar ${item.maxQuantity}`,
        });
      }
    });
  });

export type CreditNoteFormValues = z.infer<typeof creditNoteFormSchema>;
export type CreditNoteFormInputValues = z.input<typeof creditNoteFormSchema>;

export function getDefaultCreditNoteItems(
  invoice: ViewBillData,
): CreditNoteFormValues["items"] {
  return invoice.items.map((item) => ({
    code: item.code_reference,
    name: item.name,
    price: Number(item.price),
    taxRate: Number(item.tax_rate) / 100,
    unitMeasureId: String(item.unit_measure.id),
    standardCodeId: String(
      item.standard_code.id,
    ) as (typeof productStandardIds)[number],
    isExcluded: item.is_excluded === 1,
    tributeId: String(item.tribute.id),
    quantity: 0,
    maxQuantity: Number(item.quantity),
    discountRate: Number(item.discount_rate),
  }));
}
