"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowRightIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  ShieldCheckIcon,
} from "lucide-react";
import Link from "next/link";
import { type FC, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { authClient } from "@/lib/auth/client";
import { getAuthErrorMessage } from "@/lib/auth/utils";
import {
  type ResetPasswordFormValues,
  resetPasswordFormSchema,
} from "@/lib/validations/auth";
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
import AuthFormCard from "./auth-form-card";

interface ResetPasswordFormProps {
  token: string;
}

const ResetPasswordForm: FC<ResetPasswordFormProps> = ({ token }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { handleSubmit, control } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const { mutate, isPending, data } = useMutation({
    mutationFn: async ({ password }: ResetPasswordFormValues) => {
      return await authClient.resetPassword({
        newPassword: password,
        token,
      });
    },
  });

  const onSubmit = handleSubmit((data) => {
    mutate(data);
  });

  if (data && !data.error) {
    return (
      <AuthFormCard
        icon={<CheckIcon />}
        heading="Contraseña actualizada"
        description="Tu contraseña ha sido restablecida. Inicia sesión con tu nueva contraseña."
      >
        <Link
          href="/login"
          className={buttonVariants({ size: "lg", className: "w-full" })}
        >
          Iniciar sesión
          <ArrowRightIcon />
        </Link>
      </AuthFormCard>
    );
  }

  return (
    <AuthFormCard
      icon={<ShieldCheckIcon />}
      heading="Crea tu nueva contraseña"
      description="Ingresa y confirma tu nueva contraseña para recuperar el acceso a tu cuenta"
    >
      <form onSubmit={onSubmit} className="flex w-full flex-col gap-8">
        <FieldGroup>
          <Controller
            control={control}
            name="password"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Nueva Contraseña</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id={field.name}
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  <InputGroupAddon align="inline-start">
                    <LockIcon className="text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  Confirmar Contraseña
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id={field.name}
                    placeholder="••••••••"
                    type={showConfirm ? "text" : "password"}
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  <InputGroupAddon align="inline-start">
                    <LockIcon className="text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? <EyeIcon /> : <EyeOffIcon />}
                    </InputGroupButton>
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
          {isPending ? <Spinner /> : <CheckIcon />} Guardar contraseña
        </Button>
      </form>
    </AuthFormCard>
  );
};

export default ResetPasswordForm;
