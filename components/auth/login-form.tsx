"use client";

import { LoginFormSchemaType, loginFormSchema } from "@/lib/form-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Button, buttonVariants } from "../ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../ui/input-group";

const LoginForm: FC = () => {
  const [showPassword, setShowPassword] = useState(false);

  const { handleSubmit, control } = useForm<LoginFormSchemaType>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit((data) => {
    console.log(data);
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

      <Button type="submit" size="lg">
        <LogInIcon className="size-4" />
        Iniciar Sesión
      </Button>
    </form>
  );
};

export default LoginForm;
