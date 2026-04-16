import { SupportDocumentIdentityTypeId } from "factus-js";
import { isValidPhoneNumber } from "react-phone-number-input";
import z from "zod";
import { toEnumValues, zodAlwaysRefine } from "../utils";

const supportDocumentIdentityTypeIds = toEnumValues(
  SupportDocumentIdentityTypeId,
);

/** Shared with support-document provider step — same required fields and rules. */
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

export const providerFormSchema = zodAlwaysRefine(providerSchema);

export type ProviderFormValues = z.infer<typeof providerFormSchema>;
