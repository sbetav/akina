"use client";

import { useRouter } from "@bprogress/next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EyeIcon, EyeOffIcon, SaveIcon } from "lucide-react";
import { type FC, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { api } from "@/elysia/eden";
import { getApiErrorMessage } from "@/elysia/get-api-error-message";
import type { CredentialDetailResult } from "@/elysia/modules/factus/service";
import { useGoBack } from "@/hooks/ui/use-go-back";
import { CREDENTIALS_QUERY_KEY } from "@/lib/query-keys";
import {
  type CredentialFormValues,
  credentialFormSchema,
} from "@/lib/validations/custom-credentials";

interface CredentialsFormProps {
  selectedCredential?: CredentialDetailResult;
}

const CredentialsForm: FC<CredentialsFormProps> = ({ selectedCredential }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { goBack } = useGoBack({
    fallbackHref: "/dashboard/settings/factus",
  });

  const { handleSubmit, control } = useForm<CredentialFormValues>({
    resolver: zodResolver(credentialFormSchema),
    defaultValues: {
      name: selectedCredential?.name ?? "",
      clientId: selectedCredential?.clientId ?? "",
      clientSecret: selectedCredential?.clientSecret ?? "",
      username: selectedCredential?.username ?? "",
      password: selectedCredential?.password ?? "",
      environment: selectedCredential?.environment ?? "sandbox",
    },
  });

  const [showClientSecret, setShowClientSecret] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: CredentialFormValues) => {
      // Create
      if (!selectedCredential) {
        const res = await api.factus.credentials.post(values);
        if (res.error)
          throw new Error(
            getApiErrorMessage(res.error, "Error al guardar las credenciales"),
          );
        return res.data;
      }
      // Update
      else {
        const res = await api.factus
          .credentials({ id: selectedCredential.id })
          .put(values);
        if (res.error)
          throw new Error(
            getApiErrorMessage(
              res.error,
              "Error al actualizar las credenciales",
            ),
          );
        return res.data;
      }
    },
    onSuccess: () => {
      toast.success(
        `Credenciales ${selectedCredential ? "actualizadas" : "agregadas"} exitosamente`,
      );
      queryClient.invalidateQueries({ queryKey: CREDENTIALS_QUERY_KEY });
      router.replace("/dashboard/settings/factus");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onSubmit = handleSubmit((data) => {
    mutate(data);
  });

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-1 flex-col gap-8">
      <FieldGroup className="flex-1">
        {/* Name */}
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
              <Input
                id={field.name}
                type="text"
                placeholder="Mi empresa SAS"
                aria-invalid={fieldState.invalid}
                {...field}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <Controller
            control={control}
            name="username"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Usuario</FieldLabel>
                <Input
                  id={field.name}
                  type="text"
                  placeholder="usuario@ejemplo.com"
                  aria-invalid={fieldState.invalid}
                  {...field}
                />
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
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
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
            name="clientId"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Client ID</FieldLabel>
                <Input
                  id={field.name}
                  type="text"
                  placeholder="a0e06dd2-xxx-xxx-xxx-xxx"
                  aria-invalid={fieldState.invalid}
                  {...field}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="clientSecret"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Client secret</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="••••••••••••••••••••••••"
                    type={showClientSecret ? "text" : "password"}
                    {...field}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      type="button"
                      onClick={() => setShowClientSecret((v) => !v)}
                    >
                      {showClientSecret ? <EyeIcon /> : <EyeOffIcon />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </div>

        <Controller
          control={control}
          name="environment"
          render={({ field, fieldState }) => (
            <Field orientation="responsive">
              <FieldContent>
                <FieldLabel htmlFor={field.name}>Entorno</FieldLabel>
                <FieldDescription>
                  Selecciona el entorno en el que deseas conectarte a Factus.
                </FieldDescription>
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
              <ToggleGroup
                variant="outline"
                value={[field.value]}
                onValueChange={(value) => field.onChange(value[0])}
                aria-invalid={fieldState.invalid}
              >
                <ToggleGroupItem value="sandbox" aria-label="Sandbox">
                  Sandbox
                </ToggleGroupItem>
                <ToggleGroupItem value="production" aria-label="Producción">
                  Producción
                </ToggleGroupItem>
              </ToggleGroup>
            </Field>
          )}
        />
        <Alert variant="warning" size="sm">
          <AlertTitle>
            Akina utiliza la API de Factus v1, asegúrate de que tus credenciales
            soportan esta versión
          </AlertTitle>
        </Alert>
      </FieldGroup>

      <div className="flex w-full flex-col-reverse items-center justify-end gap-3 md:flex-row">
        <Button
          size="lg"
          type="button"
          variant="outline"
          className="w-full md:w-auto"
          onClick={goBack}
          disabled={isPending}
        >
          Cancelar
        </Button>

        <Button
          size="lg"
          type="submit"
          className="w-full md:w-auto"
          disabled={isPending}
        >
          {isPending ? <Spinner /> : <SaveIcon />}
          Guardar
        </Button>
      </div>
    </form>
  );
};

export default CredentialsForm;
