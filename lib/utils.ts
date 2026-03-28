import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import z from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function zodAlwaysRefine<T extends z.ZodTypeAny>(zodType: T) {
  return z.any().superRefine(async (value, ctx) => {
    const res = await zodType.safeParseAsync(value);

    if (res.success === false)
      for (const issue of res.error.issues) {
        ctx.addIssue({
          code: "invalid_type",
          expected: "any",
          message: issue.message,
          path: issue.path,
          input: value,
        });
      }
  }) as unknown as T;
}

export function formatDocumentNumber(value: string | number) {
  if (!value) return "";
  const number = Number(value.toString().replace(/\D/g, ""));
  return number.toLocaleString("es-CO");
}
