"use client";

import {
  ResetPasswordFormSchemaType,
  resetPasswordFormSchema,
} from "@/lib/form-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, EyeIcon, EyeOffIcon, LockIcon } from "lucide-react";
import { FC, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../ui/input-group";

const ResetPasswordForm: FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { handleSubmit, control } = useForm<ResetPasswordFormSchemaType>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit((data) => {
    console.log(data);
  });

  return (
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
              <FieldLabel htmlFor={field.name}>Confirmar Contraseña</FieldLabel>
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

      <Button size="lg" className="w-full" type="submit">
        <CheckIcon /> Guardar contraseña
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
