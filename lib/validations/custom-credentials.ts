import z from "zod";

export const credentialFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  clientId: z.string().min(1, "El Client ID es requerido"),
  clientSecret: z.string().min(1, "El Client secret es requerido"),
  username: z.string().min(1, "El usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
  environment: z.enum(["sandbox", "production"]),
});

export type CredentialFormValues = z.infer<typeof credentialFormSchema>;
