"use client";

import { authClient } from "@/lib/auth/client";
import { getAuthErrorMessage } from "@/lib/auth/utils";
import {
  ForgotPasswordFormValues,
  forgotPasswordFormSchema,
} from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeftIcon,
  KeyRoundIcon,
  MailCheckIcon,
  MailIcon,
  SendIcon,
} from "lucide-react";
import Link from "next/link";
import { FC } from "react";
import { Controller, useForm } from "react-hook-form";
import BackButton from "../back-button";
import { Alert, AlertDescription } from "../ui/alert";
import { Button, buttonVariants } from "../ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { Spinner } from "../ui/spinner";
import AuthFormCard from "./auth-form-card";

const ForgotPasswordForm: FC = () => {
  const { handleSubmit, control, reset } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const { mutate, isPending, data } = useMutation({
    mutationFn: async ({ email }: ForgotPasswordFormValues) => {
      return await authClient.requestPasswordReset({
        email,
        fetchOptions: {
          onSuccess: () => {
            reset();
          },
        },
        redirectTo: "/reset-password",
      });
    },
  });

  const onSubmit = handleSubmit((data) => {
    mutate(data);
  });

  if (data && !data.error) {
    return (
      <AuthFormCard
        icon={<MailCheckIcon />}
        heading="Revisa tu correo"
        description="Hemos enviado un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada o carpeta de spam y sigue las instrucciones."
      >
        <Link
          href="/login"
          className={buttonVariants({ size: "lg", className: "w-full" })}
        >
          <ArrowLeftIcon />
          Volver al inicio de sesión
        </Link>
      </AuthFormCard>
    );
  }

  return (
    <AuthFormCard
      icon={<KeyRoundIcon />}
      heading="Recupera tu contraseña"
      description="Enviaremos un enlace de recuperación a tu correo electrónico"
      footer={
        <BackButton label="Volver al inicio" mode="redirect" href="/login" />
      }
    >
      <form onSubmit={onSubmit} className="flex w-full flex-col gap-8">
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
        </FieldGroup>

        {data?.error && (
          <Alert variant="destructive">
            <AlertDescription>
              {getAuthErrorMessage(data.error.code)}
            </AlertDescription>
          </Alert>
        )}

        <Button size="lg" className="w-full" type="submit" disabled={isPending}>
          {isPending ? <Spinner /> : <SendIcon />} Enviar enlace
        </Button>
      </form>
    </AuthFormCard>
  );
};
export default ForgotPasswordForm;
