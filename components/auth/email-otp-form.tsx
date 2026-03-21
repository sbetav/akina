"use client";

import { EmailOtpFormValues, emailOtpFormSchema } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";

interface EmailOtpFormProps {
  onResend?: () => void;
}

const EmailOtpForm: FC<EmailOtpFormProps> = ({ onResend }) => {
  const [countdown, setCountdown] = useState(59);

  const { handleSubmit, control } = useForm<EmailOtpFormValues>({
    resolver: zodResolver(emailOtpFormSchema),
    defaultValues: {
      otp: "",
    },
  });

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResend = useCallback(() => {
    if (countdown > 0) return;
    setCountdown(59);
    onResend?.();
  }, [countdown, onResend]);

  const onSubmit = handleSubmit((data) => {
    console.log(data);
  });

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-8">
      <Controller
        control={control}
        name="otp"
        render={({ field, fieldState }) => (
          <div className="flex items-center justify-center">
            <InputOTP {...field} maxLength={6}>
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    aria-invalid={fieldState.invalid}
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        )}
      />

      <Button size="lg" className="w-full" type="submit">
        Verificar código
      </Button>

      <p className="text-center text-xs">
        <span className="text-muted-foreground">¿No recibiste el código? </span>
        <Button
          variant="link"
          size="sm"
          disabled={countdown > 0}
          onClick={handleResend}
        >
          Reenviar
          {countdown > 0 ? ` (0:${String(countdown).padStart(2, "0")})` : ""}
        </Button>{" "}
      </p>
    </form>
  );
};

export default EmailOtpForm;
