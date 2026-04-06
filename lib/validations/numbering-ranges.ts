import { NumberingRangeDocumentTypeCode } from "factus-js";
import { z } from "zod";
import { toEnumValues, zodAlwaysRefine } from "../utils";

const DOCUMENT_OPTIONS = toEnumValues(NumberingRangeDocumentTypeCode);

const RESOLUTION_REQUIRED_TYPES = [
  NumberingRangeDocumentTypeCode.SalesInvoice,
  NumberingRangeDocumentTypeCode.SupportDocument,
  NumberingRangeDocumentTypeCode.PaperOrStubInvoice,
];

export function requiresResolution(documentValue: string) {
  return RESOLUTION_REQUIRED_TYPES.some((opt) => opt === documentValue);
}

export const numberingRangeSchema = zodAlwaysRefine(
  z.object({
    document: z.enum(DOCUMENT_OPTIONS),
    prefix: z.string().min(1, "El prefijo es requerido").max(20),
    current: z.number().min(1, "El consecutivo debe ser mayor o igual a 1"),
    resolutionNumber: z.string().optional(),
  }),
).refine(
  (data) => {
    const requiresResolution = [
      NumberingRangeDocumentTypeCode.SalesInvoice,
      NumberingRangeDocumentTypeCode.SupportDocument,
      NumberingRangeDocumentTypeCode.PaperOrStubInvoice,
    ].some((opt) => opt === data.document);

    return !requiresResolution || !!data.resolutionNumber?.length;
  },
  {
    path: ["resolutionNumber"],
    message: "Campo requerido para el tipo de documento seleccionado",
  },
);

export type NumberingRangeFormValues = z.infer<typeof numberingRangeSchema>;
