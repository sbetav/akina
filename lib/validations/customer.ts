import {
  CustomerTributeId,
  IdentityDocumentTypeId,
  OrganizationTypeId,
} from "factus-js";
import { isValidPhoneNumber } from "react-phone-number-input";
import z from "zod";
import { toEnumValues, zodAlwaysRefine } from "../utils";

const identificationDocumentIds = toEnumValues(IdentityDocumentTypeId);
const legalOrganizationIds = toEnumValues(OrganizationTypeId);
const tributeIds = toEnumValues(CustomerTributeId);

export const customerFormSchema = zodAlwaysRefine(
  z.object({
    identification: z
      .string("Campo requerido")
      .nonempty("Campo requerido")
      .max(20, "Máximo 20 caracteres"),

    dv: z.string().max(1, "Máximo 1 dígito").optional(),

    identificationDocumentId: z.enum(identificationDocumentIds, {
      error: () => "Campo requerido",
    }),
    legalOrganizationId: z.enum(legalOrganizationIds, {
      error: () => "Campo requerido",
    }),

    tributeId: z.enum(tributeIds, {
      error: () => "Campo requerido",
    }),

    name: z.string().nonempty("Campo requerido"),

    tradeName: z.string().optional(),

    address: z
      .string("Campo requerido")
      .nonempty("Campo requerido")
      .max(150, "Máximo 150 caracteres"),

    email: z.email({
      error: (issue) =>
        !issue.input ? "Campo requerido" : "Correo electrónico invalido",
    }),

    phone: z.string("Campo requerido").nonempty("Campo requerido"),

    municipalityId: z.string("Campo requerido").nonempty("Campo requerido"),
  }),
)
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
  )
  .refine(
    (data) => {
      if (!data.phone) return true;
      return isValidPhoneNumber(data.phone);
    },
    {
      path: ["phone"],
      message: "Numero de teléfono inválido",
    },
  );

export type CustomerFormValues = z.infer<typeof customerFormSchema>;
