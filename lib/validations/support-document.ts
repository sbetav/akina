import { PaymentMethodCode } from "factus-js";
import z from "zod";
import { toEnumValues, zodAlwaysRefine } from "@/lib/utils";
import { productSchema } from "./product";
import { providerSchema } from "./provider";

const paymentMethodCodes = toEnumValues(PaymentMethodCode);

export const supportDocumentItemSchema = z.object({
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

export type SupportDocumentItemValues = z.infer<
  typeof supportDocumentItemSchema
>;

export const supportDocumentFormSchema = zodAlwaysRefine(
  z.object({
    // ── Provider (same rules as dashboard create/edit provider) ───────────────
    provider: providerSchema,

    // ── Items ─────────────────────────────────────────────────────────────────
    items: z
      .array(supportDocumentItemSchema)
      .min(1, "Agrega al menos un producto o servicio"),

    // ── Document details ──────────────────────────────────────────────────────
    numberingRangeId: z
      .number({ error: "Campo requerido" })
      .min(1, "Selecciona un rango de numeración"),
    paymentMethodCode: z.enum(paymentMethodCodes, {
      error: () => "Campo requerido",
    }),
    observation: z.string().max(250, "Máximo 250 caracteres").optional(),
  }),
);

export type SupportDocumentFormValues = z.infer<
  typeof supportDocumentFormSchema
>;
