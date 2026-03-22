import z from "zod";

export const customCredentialsFormSchema = z.object({
  client_id: z.string("Campo requerido").nonempty("Campo requerido"),
  client_secret: z.string("Campo requerido").nonempty("Campo requerido"),
  username: z.string("Campo requerido").nonempty("Campo requerido"),
  password: z.string("Campo requerido").nonempty("Campo requerido"),
  environment: z.enum(["sandbox", "production"], "Campo requerido"),
});

export type CustomCredentialsFormValues = z.infer<
  typeof customCredentialsFormSchema
>;
