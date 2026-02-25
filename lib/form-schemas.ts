import z from "zod";

export const loginFormSchema = z.object({
  email: z.email({
    error: (issue) =>
      !issue.input ? "Campo requerido" : "Correo electrónico inválido",
  }),
  password: z.string("Campo requerido").nonempty("Campo requerido"),
});

export type LoginFormSchemaType = z.infer<typeof loginFormSchema>;

export const registerFormSchema = z
  .object({
    firstName: z.string("Campo requerido").nonempty("Campo requerido"),
    lastName: z.string("Campo requerido").nonempty("Campo requerido"),
    email: z.email({
      error: (issue) =>
        !issue.input ? "Campo requerido" : "Correo electrónico inválido",
    }),
    password: z.string("Campo requerido").nonempty("Campo requerido"),
    confirmPassword: z.string("Campo requerido").nonempty("Campo requerido"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

export type RegisterFormSchemaType = z.infer<typeof registerFormSchema>;
