import z from "zod";

export const loginFormSchema = z.object({
  email: z.email({
    error: (issue) =>
      !issue.input ? "Campo requerido" : "Correo electrónico inválido",
  }),
  password: z.string("Campo requerido").nonempty("Campo requerido"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const registerFormSchema = z
  .object({
    firstName: z.string("Campo requerido").nonempty("Campo requerido"),
    lastName: z.string("Campo requerido").nonempty("Campo requerido"),
    email: z.email({
      error: (issue) =>
        !issue.input ? "Campo requerido" : "Correo electrónico inválido",
    }),
    password: z.string("Campo requerido").min(8, {
      error: (issue) =>
        !issue.input
          ? "Campo requerido"
          : "La contraseña debe tener al menos 8 caracteres",
    }),
    confirmPassword: z.string("Campo requerido").nonempty("Campo requerido"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

export type RegisterFormValues = z.infer<typeof registerFormSchema>;

export const forgotPasswordFormSchema = z.object({
  email: z.email({
    error: (issue) =>
      !issue.input ? "Campo requerido" : "Correo electrónico inválido",
  }),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

export const resetPasswordFormSchema = z
  .object({
    password: z.string("Campo requerido").min(8, {
      error: (issue) =>
        !issue.input
          ? "Campo requerido"
          : "La contraseña debe tener al menos 8 caracteres",
    }),
    confirmPassword: z.string("Campo requerido").nonempty("Campo requerido"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;

export const emailOtpFormSchema = z.object({
  otp: z
    .string("Campo requerido")
    .nonempty("Campo requerido")
    .length(6, "El código debe tener 6 dígitos"),
});

export type EmailOtpFormValues = z.infer<typeof emailOtpFormSchema>;
