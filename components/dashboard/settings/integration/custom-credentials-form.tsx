"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  CustomCredentialsFormValues,
  customCredentialsFormSchema,
} from "@/lib/validations/custom-credentials";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon, SaveIcon } from "lucide-react";
import { FC, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

const CustomCredentialsForm: FC = ({}) => {
  const { handleSubmit, control } = useForm<CustomCredentialsFormValues>({
    resolver: zodResolver(customCredentialsFormSchema),
    defaultValues: {
      client_id: "",
      client_secret: "",
      username: "",
      password: "",
      environment: "sandbox",
    },
  });

  const [environment] = useWatch({ control, name: ["environment"] });

  const [showClientSecret, setShowClientSecret] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      onSubmit={handleSubmit((data) => {
        console.log(data);
      })}
      className="flex w-full flex-1 flex-col gap-8"
    >
      <FieldSet>
        <FieldLegend className="mb-5">Ingresa tus credenciales</FieldLegend>
        <FieldGroup>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <Controller
              control={control}
              name="client_id"
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
              name="client_secret"
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
                        onClick={() => {
                          setShowClientSecret(!showClientSecret);
                        }}
                      >
                        {showClientSecret ? <EyeIcon /> : <EyeOffIcon />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

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
                  <ToggleGroupItem value="production" aria-label="Production">
                    Producción
                  </ToggleGroupItem>
                </ToggleGroup>
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>

      {environment === "sandbox" ? (
        <Alert variant="warning">
          <AlertTitle>Modo sandbox</AlertTitle>
          <AlertDescription>
            Los documentos emitidos usando esta opción son únicamente de prueba
            y no son válidos ante la DIAN.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="info">
          <AlertTitle>Modo producción</AlertTitle>
          <AlertDescription>
            Una vez validadas tus credenciales, podrás emitir documentos
            electrónicos validos ante la DIAN.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex w-full flex-col-reverse items-center justify-end gap-3 md:flex-row">
        <Button
          size="lg"
          type="button"
          variant="outline"
          className="w-full md:w-auto"
        >
          Cancelar
        </Button>
        <Button size="lg" type="submit" className="w-full md:w-auto">
          <SaveIcon />
          Guardar
        </Button>
      </div>
    </form>
  );
};

export default CustomCredentialsForm;
