import {
  FACTUS_CUSTOMER_TRIBUTE_IDS,
  FACTUS_IDENTITY_DOCUMENT_TYPES,
  FACTUS_ORGANIZATION_TYPES,
} from "@/lib/factus/constants";
import { isValidPhoneNumber } from "react-phone-number-input";
import z from "zod";
import { zodAlwaysRefine } from "../utils";

const identificationDocumentIds = FACTUS_IDENTITY_DOCUMENT_TYPES.map(
  (d) => d.id,
) as [string, ...string[]];

const legalOrganizationIds = FACTUS_ORGANIZATION_TYPES.map((o) => o.id) as [
  string,
  ...string[],
];

const tributeIds = FACTUS_CUSTOMER_TRIBUTE_IDS.map((t) => t.id) as [
  string,
  ...string[],
];

export const customerFormSchema = zodAlwaysRefine(
  z.object({
    identification: z
      .string("Campo requerido")
      .nonempty("Campo requerido")
      .max(20, "Máximo 20 caracteres"),

    dv: z.string().max(1, "Máximo 1 dígito").optional(),

    identification_document_id: z.enum(identificationDocumentIds, {
      error: () => "Campo requerido",
    }),

    legal_organization_id: z.enum(legalOrganizationIds, {
      error: () => "Campo requerido",
    }),

    tribute_id: z.enum(tributeIds, {
      error: () => "Campo requerido",
    }),

    company: z.string().optional(),

    trade_name: z.string().optional(),

    names: z.string().optional(),

    address: z
      .string("Campo requerido")
      .nonempty("Campo requerido")
      .max(150, "Máximo 150 caracteres"),

    email: z.email({
      error: (issue) =>
        !issue.input ? "Campo requerido" : "Correo electrónico invalido",
    }),

    phone: z.string("Campo requerido").nonempty("Campo requerido"),

    municipality_id: z.string("Campo requerido").nonempty("Campo requerido"),
  }),
)
  .refine(
    (data) => {
      if (data.legal_organization_id === "1") {
        return !!data.company && data.company.trim().length > 0;
      }
      return true;
    },
    {
      path: ["company"],
      message: "Campo requerido",
    },
  )
  .refine(
    (data) => {
      if (data.legal_organization_id === "2") {
        return !!data.names && data.names.trim().length > 0;
      }
      return true;
    },
    {
      path: ["names"],
      message: "Campo requerido",
    },
  )
  .refine(
    (data) => {
      if (data.identification_document_id === "6") {
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
