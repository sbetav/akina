import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";
import { useCountdown } from "@/hooks/ui/use-countdown";
import { authClient } from "@/lib/auth/client";
import { getAuthErrorMessage } from "@/lib/auth/utils";

export function useResendVerification(
  email: string,
  cooldown: number = 59,
  initialCooldown: number = cooldown,
) {
  const { timeLeft, reset } = useCountdown(initialCooldown);

  const { mutate: resend, isPending } = useMutation({
    mutationFn: async () => {
      if (!email || timeLeft > 0) return;
      const { data } = await authClient.sendVerificationEmail(
        {
          email,
          callbackURL: "/dashboard",
        },
        {
          onSuccess: () => {
            reset(cooldown);
            toast.success("Correo de verificación enviado");
          },
          onError: (ctx) => {
            toast.error(getAuthErrorMessage(ctx.error.code));
          },
        },
      );

      return data;
    },
  });

  return { resend, isPending, timeLeft };
}
