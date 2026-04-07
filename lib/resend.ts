import { type CreateEmailOptions, Resend } from "resend";
import { env } from "./env";

const resend = new Resend(env.RESEND_API_KEY);

const FROM = env.RESEND_FROM;

export async function sendEmail(
  options: Omit<CreateEmailOptions, "from">,
): Promise<void> {
  const { error } = await resend.emails.send({
    ...options,
    from: FROM,
  } as CreateEmailOptions);
  if (error) throw new Error(`Failed to send email: ${error.message}`);
}
