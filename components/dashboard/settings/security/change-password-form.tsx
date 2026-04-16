"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CheckIcon, EyeIcon, EyeOffIcon, LockIcon } from "lucide-react";
import { type FC, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth/client";
import { getAuthErrorMessage } from "@/lib/auth/utils";
import {
  type ChangePasswordValues,
  changePasswordSchema,
} from "@/lib/validations/security";

const ChangePasswordForm: FC = () => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { handleSubmit, control, reset } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const [persistentSuccess, setPersistentSuccess] = useState(false);
  const { mutate, isPending } = useMutation({
    mutationFn: (values: ChangePasswordValues) =>
      authClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: false,
      }),
    onSuccess: (result) => {
      if (result.error) {
        toast.error(getAuthErrorMessage(result.error.code));
        return;
      }
      toast.success("Contraseña actualizada correctamente");
      reset();
      setPersistentSuccess(true);
      setTimeout(() => {
        setPersistentSuccess(false);
      }, 3000);
    },
  });

  const onSubmit = handleSubmit((data) => mutate(data));

  return (
    <form
      onSubmit={onSubmit}
      className="@container/customer-form flex w-full flex-col gap-8"
    >
      <FieldSet>
        <FieldLegend>Cambiar contraseña</FieldLegend>
        <FieldGroup>
          <Controller
            control={control}
            name="currentPassword"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Contraseña actual</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id={field.name}
                    type={showCurrent ? "text" : "password"}
                    placeholder="••••••••"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      onClick={() => {
                        setShowCurrent(!showCurrent);
                      }}
                    >
                      {showCurrent ? <EyeIcon /> : <EyeOffIcon />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <div className="grid grid-cols-1 gap-5 @xl/field-group:grid-cols-2">
            <Controller
              control={control}
              name="newPassword"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Nueva contraseña</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id={field.name}
                      type={showNew ? "text" : "password"}
                      placeholder="••••••••"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        size="icon-xs"
                        onClick={() => {
                          setShowNew(!showNew);
                        }}
                      >
                        {showNew ? <EyeIcon /> : <EyeOffIcon />}
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
                    Confirmar contraseña
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id={field.name}
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        size="icon-xs"
                        onClick={() => {
                          setShowConfirm(!showConfirm);
                        }}
                      >
                        {showConfirm ? <EyeIcon /> : <EyeOffIcon />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </div>
        </FieldGroup>
      </FieldSet>

      <div className="flex w-full flex-col-reverse items-center justify-end gap-3 @md/customer-form:flex-row">
        <Button type="submit" disabled={isPending || persistentSuccess}>
          {persistentSuccess ? (
            <CheckIcon />
          ) : isPending ? (
            <Spinner />
          ) : (
            <LockIcon />
          )}
          {persistentSuccess
            ? "Contraseña actualizada"
            : "Actualizar contraseña"}
        </Button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;
