import z from "zod";

export const profileFormSchema = z.object({
  firstName: z.string().min(1, "Campo requerido"),
  lastName: z.string().min(1, "Campo requerido"),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
