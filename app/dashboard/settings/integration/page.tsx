"use client";

import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import CustomCredentialsForm from "@/components/dashboard/settings/integration/custom-credentials-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { FC, useState } from "react";

const Page: FC = () => {
  const integrationModes = [
    {
      label: "Akina Sandbox",
      value: "sandbox",
      description:
        "Usa credenciales sandbox compartidas. Ideal para hacer pruebas y explorar la plataforma.",
    },
    {
      label: "Credenciales propias",
      value: "custom",
      description:
        "Conecta tu propia cuenta de Factus. Requiere Client ID, Client Secret, usuario y contraseña.",
    },
  ];
  const [integrationMode, setIntegrationMode] = useState<"sandbox" | "custom">(
    "sandbox",
  );
  return (
    <div className="flex min-h-full w-full flex-1 flex-col gap-8">
      <PageHeader size="sm">
        <PageHeaderContent>
          <PageHeaderTitle>Integración</PageHeaderTitle>
          <PageHeaderDescription className="normal-case">
            &#47;&#47; Conecta Akina con Factus y comienza a emitir documentos
            electrónicos
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>

      <RadioGroup
        value={integrationMode}
        onValueChange={(value) =>
          setIntegrationMode(value as "sandbox" | "custom")
        }
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
      >
        {integrationModes.map((mode) => (
          <FieldLabel key={mode.value} htmlFor={`mode-${mode.value}`}>
            <Field orientation="vertical">
              <div className="flex items-center gap-2.5">
                <RadioGroupItem value={mode.value} id={`mode-${mode.value}`} />
                <FieldTitle className="mt-px">{mode.label}</FieldTitle>
              </div>
              <FieldDescription>{mode.description}</FieldDescription>
            </Field>
          </FieldLabel>
        ))}
      </RadioGroup>

      {integrationMode === "sandbox" ? (
        <Alert variant="warning">
          <AlertTitle>Modo sandbox</AlertTitle>
          <AlertDescription>
            Los documentos emitidos usando esta opción son únicamente de prueba
            y no son válidos ante la DIAN.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="mt-2 space-y-9">
          <Separator />
          <CustomCredentialsForm />
        </div>
      )}
    </div>
  );
};

export default Page;
