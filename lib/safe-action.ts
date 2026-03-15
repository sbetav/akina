import { createSafeActionClient } from "next-safe-action";
import { requireSession } from "./dal";

export const actionClient = createSafeActionClient().use(async ({ next }) => {
  await requireSession();
  return next();
});
