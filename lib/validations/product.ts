import { ProductStandardId } from "factus-js";
import z from "zod";
import { toEnumValues, zodAlwaysRefine } from "@/lib/utils";

const productStandardIds = toEnumValues(ProductStandardId);

export const productSchema = z.object({
  code: z
    .string({ error: "Campo requerido" })
    .nonempty("Campo requerido")
    .max(50, "Máximo 50 caracteres"),
  name: z
    .string({ error: "Campo requerido" })
    .nonempty("Campo requerido")
    .max(200, "Máximo 200 caracteres"),
  description: z.string().max(1000, "Máximo 1000 caracteres").optional(),
  price: z.number({ error: "Campo requerido" }).min(0, {
    message: "El precio no puede ser negativo",
  }),
  unitMeasureId: z
    .string({ error: "Campo requerido" })
    .nonempty("Campo requerido"),
  standardCodeId: z.enum(productStandardIds, {
    error: () => "Campo requerido",
  }),
  tributeId: z.string({ error: "Campo requerido" }).nonempty("Campo requerido"),
  taxRate: z
    .number({ error: "Campo requerido" })
    .min(0, { message: "El valor mínimo es 0%" })
    .max(1, { message: "El valor máximo es 100%" }),
  isExcluded: z.boolean(),
});

export const productFormSchema = zodAlwaysRefine(productSchema);

export type ProductFormValues = z.infer<typeof productFormSchema>;
