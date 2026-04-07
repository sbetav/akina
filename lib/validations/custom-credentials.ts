import z from "zod";
import { FACTUS_ENVIRONMENTS } from "@/lib/constants";

export const credentialFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  clientId: z.string().min(1, "El Client ID es requerido"),
  clientSecret: z.string().min(1, "El Client secret es requerido"),
  username: z.string().min(1, "El usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
  environment: z.enum(FACTUS_ENVIRONMENTS),
});

export type CredentialFormValues = z.infer<typeof credentialFormSchema>;
