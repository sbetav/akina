import { render } from "@react-email/components";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { twoFactor } from "better-auth/plugins";
import { after } from "next/server";
import { db } from "@/db/drizzle";
import { authSchema } from "@/db/schemas/auth-schema";
import PasswordResetEmail from "../../emails/password-reset";
import VerificationEmail from "../../emails/verification";
import { env } from "../env";
import { sendEmail } from "../resend";
import { AUTH_COOKIE_PREFIX } from "./constants";

export const auth = betterAuth({
  basePath: "/auth",
  appName: "Akina",
  baseURL: env.NEXT_PUBLIC_BASE_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  session: {
    expiresIn: 60 * 60 * 24, // 24 hours
  },
  user: {
    fields: {
      name: "fullName",
    },
    additionalFields: {
      firstName: {
        type: "string",
        required: true,
      },
      lastName: {
        type: "string",
        required: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      const html = await render(
        PasswordResetEmail({
          name: user.name?.split(" ")[0],
          resetUrl: url,
          baseUrl: env.NEXT_PUBLIC_BASE_URL,
        }),
      );

      after(
        sendEmail({
          to: user.email,
          subject: "Restablece tu contraseña",
          html,
        }),
      );
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 24 * 60 * 60 * 1000, // 24 hours
    sendVerificationEmail: async ({ user, url }) => {
      const html = await render(
        VerificationEmail({
          name: user.name?.split(" ")[0],
          verificationUrl: url,
          baseUrl: env.NEXT_PUBLIC_BASE_URL,
        }),
      );

      after(
        sendEmail({
          to: user.email,
          subject: "Verifica tu email",
          html,
        }),
      );
    },
  },
  advanced: {
    cookiePrefix: AUTH_COOKIE_PREFIX,
  },
  plugins: [twoFactor(), nextCookies()],
});
