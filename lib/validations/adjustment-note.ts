import {
  AdjustmentNoteReasonCode,
  PaymentMethodCode,
  ProductStandardId,
  type ViewSupportDocumentData,
} from "factus-js";
import z from "zod";
import { toEnumValues } from "@/lib/utils";

const adjustmentNoteReasonCodes = toEnumValues(AdjustmentNoteReasonCode);
const paymentMethodCodes = toEnumValues(PaymentMethodCode);
const productStandardIds = toEnumValues(ProductStandardId);

export const adjustmentNoteItemSchema = z.object({
  codeReference: z.string().nonempty(),
  name: z.string().nonempty(),
  price: z.coerce.number().min(0),
  unitMeasureId: z.coerce.number().min(1),
  standardCodeId: z.enum(productStandardIds, {
    error: () => "Campo requerido",
  }),
  quantity: z.coerce.number({ error: "Campo requerido" }).min(0),
  maxQuantity: z.coerce.number().min(0.001),
  discountRate: z.coerce.number().min(0).max(100),
});

export type AdjustmentNoteItemValues = z.infer<typeof adjustmentNoteItemSchema>;

export const adjustmentNoteFormSchema = z
  .object({
    numberingRangeId: z
      .number({ error: "Campo requerido" })
      .min(1, "Selecciona un rango de numeración"),
    correctionConceptCode: z.enum(adjustmentNoteReasonCodes, {
      error: () => "Campo requerido",
    }),
    paymentMethodCode: z.enum(paymentMethodCodes, {
      error: () => "Campo requerido",
    }),
    observation: z.string().max(250, "Máximo 250 caracteres").optional(),
    sendEmail: z.boolean().optional(),
    items: z
      .array(adjustmentNoteItemSchema)
      .min(1, "Se requiere al menos un producto")
      .refine(
        (items) => items.some((item) => item.quantity > 0),
        "Ingresa al menos una cantidad a ajustar",
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

export type AdjustmentNoteFormValues = z.infer<typeof adjustmentNoteFormSchema>;
export type AdjustmentNoteFormInputValues = z.input<
  typeof adjustmentNoteFormSchema
>;

export function getDefaultAdjustmentNoteItems(
  supportDocument: ViewSupportDocumentData,
): AdjustmentNoteFormValues["items"] {
  return supportDocument.items.map((item) => ({
    codeReference: item.code_reference,
    name: item.name,
    price: Number(item.price),
    unitMeasureId: item.unit_measure.id,
    standardCodeId: String(
      item.standard_code.id,
    ) as (typeof productStandardIds)[number],
    quantity: 0,
    maxQuantity: Number(item.quantity),
    discountRate: Number(item.discount_rate),
  }));
}
