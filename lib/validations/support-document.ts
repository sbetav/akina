import { PaymentMethodCode, SupportDocumentIdentityTypeId } from "factus-js";
import { isValidPhoneNumber } from "react-phone-number-input";
import z from "zod";
import { toEnumValues, zodAlwaysRefine } from "@/lib/utils";
import { productSchema } from "./product";

const supportDocumentIdentityTypeIds = toEnumValues(
  SupportDocumentIdentityTypeId,
);
const paymentMethodCodes = toEnumValues(PaymentMethodCode);

/**
 * Provider sub-schema for the support document form.
 * - address: required by Factus ("El campo dirección es obligatorio.")
 * - email: optional (not required by Factus)
 */
const supportDocumentProviderSchema = z
  .object({
    identification: z
      .string("Campo requerido")
      .nonempty("Campo requerido")
      .max(20, "Máximo 20 caracteres"),
    dv: z.string().max(1, "Máximo 1 dígito").optional(),
    identificationDocumentId: z.enum(supportDocumentIdentityTypeIds, {
      error: () => "Campo requerido",
    }),
    names: z.string().nonempty("Campo requerido"),
    tradeName: z.string().optional(),
    countryCode: z.string().nonempty("Campo requerido"),
    isResident: z.union([z.literal(0), z.literal(1)]).optional(),
    address: z
      .string()
      .nonempty("Campo requerido")
      .max(150, "Máximo 150 caracteres"),
    email: z
      .string()
      .nonempty("Campo requerido")
      .refine((v) => z.email().safeParse(v).success, {
        message: "Correo electrónico inválido",
      }),
    phone: z
      .string()
      .optional()
      .refine((v) => !v || isValidPhoneNumber(v), {
        message: "Numero de teléfono inválido",
      }),
    municipalityId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.identificationDocumentId === SupportDocumentIdentityTypeId.NIT) {
        return !!data.dv && data.dv.trim().length > 0;
      }
      return true;
    },
    {
      path: ["dv"],
      message: "Campo requerido",
    },
  )
  .refine(
    (data) => {
      if (
        data.identificationDocumentId === SupportDocumentIdentityTypeId.NIT &&
        data.isResident !== 1
      ) {
        return false;
      }
      return true;
    },
    {
      path: ["identificationDocumentId"],
      message:
        "NIT no es válido para proveedores no residentes en Colombia. Usa otro tipo de identificación.",
    },
  )
  .refine(
    (data) => {
      if (data.countryCode === "CO" && !data.municipalityId?.trim()) {
        return false;
      }
      return true;
    },
    {
      path: ["municipalityId"],
      message: "Campo requerido",
    },
  );

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
    // ── Provider ──────────────────────────────────────────────────────────────
    provider: supportDocumentProviderSchema,

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
