"use client";

import {
  ForgotPasswordFormSchemaType,
  forgotPasswordFormSchema,
} from "@/lib/form-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailIcon, SendIcon } from "lucide-react";
import { FC } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";

const ForgotPasswordForm: FC = () => {
  const { handleSubmit, control } = useForm<ForgotPasswordFormSchemaType>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      email: "",
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

      <Button size="lg" className="w-full" type="submit">
        <SendIcon /> Enviar enlace
      </Button>
    </form>
  );
};
export default ForgotPasswordForm;
