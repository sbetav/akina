import { Elysia } from "elysia";
import { auth } from "@/lib/auth/server";

/**
 * Shared Better Auth plugin with the `auth` macro.
 * Import this into any Elysia module that needs session-guarded routes.
 */
export const betterAuth = new Elysia({ name: "better-auth" })
  .mount(auth.handler)
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({
          headers,
        });

        if (!session) return status(401);

        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  });
