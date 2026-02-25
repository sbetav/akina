import z from "zod";

export const loginSchema = z.object({
  email: z.email({
    error: (issue) =>
      !issue.input
        ? "Por favor ingresa un correo electrónico"
        : "Correo electrónico inválido",
  }),
  password: z.string().nonempty("Por favor ingresa una contraseña"),
});
