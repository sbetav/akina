"use client";

import { useAnimatedEllipsis } from "@/hooks/use-animated-ellipsis";
import { useResendVerification } from "@/hooks/use-resend-verification";
import { authClient } from "@/lib/auth/client";
import { getAuthErrorMessage } from "@/lib/auth/utils";
import { RegisterFormValues, registerFormSchema } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeftIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  UserPlusIcon,
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

const RegisterForm: FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { handleSubmit, control, watch } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const email = watch("email");

  const { mutate, isPending, data } = useMutation({
    mutationFn: async ({
      firstName,
      lastName,
      email,
      password,
    }: RegisterFormValues) => {
      const data = await authClient.signUp.email({
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        email,
        password,
        callbackURL: "/dashboard", // <- Verification email will redirect here
      });
      return data;
    },
  });

  const onSubmit = handleSubmit((data) => {
    mutate(data);
  });

  if (data && !data?.error) {
    return <SuccessContent email={email} />;
  }

  return (
    <>
      <form onSubmit={onSubmit} className="flex w-full flex-col gap-8">
        <div className="flex flex-col gap-1 sm:gap-2">
          <h1 className="font-sans text-2xl font-bold sm:text-3xl">
            Crear Cuenta
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Completa el formulario para comenzar
          </p>
        </div>

        <FieldGroup>
          <div className="grid grid-cols-2 gap-5">
            <Controller
              control={control}
              name="firstName"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id={field.name}
                      placeholder="Juan"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                  </InputGroup>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="lastName"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Apellido</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id={field.name}
                      placeholder="Pérez"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                  </InputGroup>
                  <FieldError
                    errors={
                      fieldState.error
                        ? [{ message: fieldState.error.message }]
                        : undefined
                    }
                  />
                </Field>
              )}
            />
          </div>
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
                    aria-invalid={fieldState.invalid}
                    placeholder="••••••••"
                    type={showConfirmPassword ? "text" : "password"}
                    {...field}
                  />
                  <InputGroupAddon align="inline-start">
                    <LockIcon className="text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      onClick={() => {
                        setShowConfirmPassword(!showConfirmPassword);
                      }}
                    >
                      {showConfirmPassword ? <EyeIcon /> : <EyeOffIcon />}
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
              {getAuthErrorMessage(data?.error?.code)}
            </AlertDescription>
          </Alert>
        )}

        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? <Spinner /> : <UserPlusIcon />}
          Crear Cuenta
        </Button>
      </form>
      <div className="mt-2 flex w-full items-center justify-center">
        <p className="text-muted-foreground text-xs uppercase">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className={buttonVariants({ variant: "link" })}>
            Inicia Sesión
          </Link>
        </p>
      </div>
    </>
  );
};

const SuccessContent: FC<{ email: string }> = ({ email }) => {
  const { resend, isPending, timeLeft } = useResendVerification(email);
  const ellipsis = useAnimatedEllipsis(isPending);
  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-4">
        <p className="font-sans text-2xl font-bold sm:text-3xl">
          ¡Revisa tu correo!
        </p>
        <p className="text-muted-foreground text-sm">
          Hemos enviado un enlace de verificación a tu correo electrónico.
          Revisa tu bandeja de entrada o carpeta de spam para activar tu cuenta.
        </p>
      </div>
      {email && (
        <p className="text-muted-foreground text-xs uppercase">
          ¿No recibiste el correo?{" "}
          <Button
            variant="link"
            onClick={() => resend()}
            disabled={isPending || timeLeft > 0}
          >
            {isPending ? `Reenviando${ellipsis}` : "Reenviar"}
            {timeLeft > 0 && ` (${timeLeft}s)`}
          </Button>
        </p>
      )}
      <Link href="/login" className={buttonVariants({ size: "lg" })}>
        <ArrowLeftIcon />
        Volver al inicio
      </Link>
      <div className="flex w-full items-center justify-center"></div>
    </div>
  );
};

export default RegisterForm;
