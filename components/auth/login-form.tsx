"use client";

import { useResendVerification } from "@/hooks/use-resend-verification";
import { authClient } from "@/lib/auth-client";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { LoginFormSchemaType, loginFormSchema } from "@/lib/form-schemas";
import { useRouter } from "@bprogress/next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  LogInIcon,
  MailIcon,
} from "lucide-react";
import Link from "next/link";
import { FC, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, AlertDescription } from "../ui/alert";
import { Button, buttonVariants } from "../ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../ui/input-group";
import { Spinner } from "../ui/spinner";

const LoginForm: FC = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const { handleSubmit, control, watch } = useForm<LoginFormSchemaType>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const email = watch("email");

  const { mutate, isPending, data } = useMutation({
    mutationFn: async ({ email, password }: LoginFormSchemaType) => {
      return await authClient.signIn.email(
        {
          email,
          password,
        },
        {
          onSuccess: () => {
            router.replace("/dashboard");
          },
        },
      );
    },
  });
  const missingVerification = data?.error?.code === "EMAIL_NOT_VERIFIED";
  const {
    resend,
    isPending: isResending,
    timeLeft,
  } = useResendVerification(email, 59, 0);

  const onSubmit = handleSubmit((data) => {
    mutate(data);
  });

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-1 sm:gap-2">
        <h1 className="font-sans text-2xl font-bold sm:text-3xl">
          Iniciar Sesión
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Ingresa tus credenciales para acceder
        </p>
      </div>

      <FieldGroup>
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Correo Electrónico</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id={field.name}
                  placeholder="ejemplo@email.com"
                  aria-invalid={fieldState.invalid}
                  {...field}
                />
                <InputGroupAddon align="inline-start">
                  <MailIcon className="text-muted-foreground" />
                </InputGroupAddon>
              </InputGroup>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Contraseña</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  {...field}
                />
                <InputGroupAddon align="inline-start">
                  <LockIcon className="text-muted-foreground" />
                </InputGroupAddon>
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-xs"
                    onClick={() => {
                      setShowPassword(!showPassword);
                    }}
                  >
                    {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <div className="flex w-full items-center justify-end">
          <Link
            href="/forgot-password"
            className={buttonVariants({ variant: "link" })}
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </FieldGroup>

      {data && data.error && (
        <Alert variant={missingVerification ? "warning" : "destructive"}>
          <AlertDescription>
            {getAuthErrorMessage(data.error.code)}{" "}
            {missingVerification && (
              <Button
                variant="link"
                size="xs"
                className="text-foreground/90 normal-case underline disabled:no-underline"
                onClick={() => resend()}
                disabled={isResending || timeLeft > 0}
              >
                {isResending
                  ? "Reenviando..."
                  : timeLeft > 0
                    ? "Reenviar"
                    : "Reenviar correo"}
                {timeLeft > 0 && ` (${timeLeft}s)`}
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? <Spinner /> : <LogInIcon className="size-4" />}
        Iniciar Sesión
      </Button>
    </form>
  );
};

export default LoginForm;
