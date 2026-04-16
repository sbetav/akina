"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CheckIcon, InfoIcon, LockIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FC, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { authClient, type User } from "@/lib/auth/client";
import { hasShallowChanges } from "@/lib/utils";
import {
  type ProfileFormValues,
  profileFormSchema,
} from "@/lib/validations/profile";

interface ProfileFormProps {
  user: User;
}

const ProfileForm: FC<ProfileFormProps> = ({ user }) => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
  });

  const { handleSubmit, control } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });

  const formValues = useWatch({ control });
  const hasChanges = useMemo(
    () => hasShallowChanges(formValues, currentUser),
    [formValues, currentUser],
  );

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const fullName = `${values.firstName} ${values.lastName}`;
      const { error } = await authClient.updateUser({
        firstName: values.firstName,
        lastName: values.lastName,
        name: fullName,
      });
      if (error)
        throw new Error(error.message ?? "Error al actualizar el perfil");
    },
    onSuccess: () => {
      toast.success("Perfil actualizado");
      setCurrentUser({
        firstName: formValues.firstName ?? "",
        lastName: formValues.lastName ?? "",
      });
      router.refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onSubmit = handleSubmit((data) => mutate(data));

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-1 flex-col gap-8">
      <FieldGroup className="flex-1">
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
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </div>

        <Field>
          <FieldLabel htmlFor="email">Correo Electrónico</FieldLabel>
          <InputGroup aria-disabled>
            <InputGroupInput
              id="email"
              placeholder="ejemplo@email.com"
              aria-invalid={false}
              value={user.email}
              disabled
            />
            <InputGroupAddon align="inline-end">
              <LockIcon />
            </InputGroupAddon>
          </InputGroup>
          <FieldDescription className="flex items-center gap-2">
            <InfoIcon className="size-3" />
            El correo está vinculado a tu cuenta y no puede cambiarse.
          </FieldDescription>
        </Field>
      </FieldGroup>

      <div className="flex w-full items-center justify-end">
        <Button type="submit" size="lg" disabled={isPending || !hasChanges}>
          {isPending ? <Spinner /> : <CheckIcon />}
          Guardar cambios
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;
