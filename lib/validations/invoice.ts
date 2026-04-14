import { PaymentFormCode, PaymentMethodCode } from "factus-js";
import z from "zod";
import { toEnumValues, zodAlwaysRefine } from "@/lib/utils";
import { customerSchema } from "./customer";
import { productSchema } from "./product";

const paymentFormCodes = toEnumValues(PaymentFormCode);
const paymentMethodCodes = toEnumValues(PaymentMethodCode);
export const invoiceItemSchema = z.object({
  /** ID in our DB — used to identify the selected product */
  productId: z.string().nonempty("Selecciona un producto"),
  ...productSchema.pick({
    code: true,
    name: true,
    price: true,
    taxRate: true,
    unitMeasureId: true,
    standardCodeId: true,
    isExcluded: true,
    tributeId: true,
  }).shape,
  quantity: z
    .number({ error: "Campo requerido" })
    .min(0.001, "La cantidad debe ser mayor a 0"),
  discountRate: z
    .number({ error: "Campo requerido" })
    .min(0, "Mínimo 0%")
    .max(100, "Máximo 100%"),
});

export type InvoiceItemValues = z.infer<typeof invoiceItemSchema>;

export const invoiceFormSchema = zodAlwaysRefine(
  z.object({
    // ── Customer ─────────────────────────────────────────────────────────────
    customer: customerSchema,

    // ── Items ─────────────────────────────────────────────────────────────────
    items: z
      .array(invoiceItemSchema)
      .min(1, "Agrega al menos un producto o servicio"),

    // ── Invoice details ───────────────────────────────────────────────────────
    numberingRangeId: z
      .number({ error: "Campo requerido" })
      .min(1, "Selecciona un rango de numeración"),
    observation: z.string().max(250, "Máximo 250 caracteres").optional(),
    paymentForm: z.enum(paymentFormCodes, {
      error: () => "Campo requerido",
    }),
    paymentDueDate: z.string().optional(),
    paymentMethodCode: z.enum(paymentMethodCodes, {
      error: () => "Campo requerido",
    }),
    sendEmail: z.boolean(),
  }),
).refine(
  (data) => {
    // paymentDueDate required when payment form is credit ("2")
    if (data.paymentForm === PaymentFormCode.CreditPayment) {
      return !!data.paymentDueDate && data.paymentDueDate.trim().length > 0;
    }
    return true;
  },
  {
    path: ["paymentDueDate"],
    message: "La fecha de vencimiento es requerida para pago a crédito",
  },
);

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
