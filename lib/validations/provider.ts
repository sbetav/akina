import {
  SupportDocumentIdentityTypeId,
  SupportDocumentIdentityTypeIdInfo,
} from "factus-js";
import { isValidPhoneNumber } from "react-phone-number-input";
import z from "zod";
import { toEnumValues, zodAlwaysRefine } from "../utils";

const supportDocumentIdentityTypeIds = toEnumValues(
  SupportDocumentIdentityTypeId,
);

export const providerSchema = z
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
    address: z.string().max(150, "Máximo 150 caracteres").optional(),
    email: z
      .string()
      .optional()
      .refine((v) => !v || z.email().safeParse(v).success, {
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
      if (data.identificationDocumentId === "6") {
        return !!data.dv && data.dv.trim().length > 0;
      }
      return true;
    },
    {
      path: ["dv"],
      message: "Campo requerido",
    },
  );

export const providerFormSchema = zodAlwaysRefine(providerSchema);

export type ProviderFormValues = z.infer<typeof providerFormSchema>;

// Re-export for convenience
export { SupportDocumentIdentityTypeId, SupportDocumentIdentityTypeIdInfo };
