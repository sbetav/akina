"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Building2Icon,
  LandmarkIcon,
  MailIcon,
  MapPinHouseIcon,
  MapPinIcon,
  PhoneIcon,
  ScrollTextIcon,
  ShieldCheckIcon,
  UserIcon,
} from "lucide-react";
import type { FC, ReactNode } from "react";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/elysia/eden";
import { COMPANY_QUERY_KEY } from "@/lib/query-keys";

interface ReadOnlyFieldProps {
  label: string;
  value: string;
  icon: ReactNode;
  id: string;
}

const ReadOnlyField: FC<ReadOnlyFieldProps> = ({ label, value, icon, id }) => (
  <Field>
    <FieldLabel htmlFor={id}>{label}</FieldLabel>
    <InputGroup aria-disabled>
      <InputGroupAddon>{icon}</InputGroupAddon>
      <InputGroupInput id={id} value={value} disabled />
    </InputGroup>
  </Field>
);

const formatValue = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return "N/A";
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : "N/A";
};

const CompanyForm: FC = () => {
  const { data: company, isPending } = useQuery({
    queryKey: [...COMPANY_QUERY_KEY],
    queryFn: async () => {
      const response = await api.factus.company.get();
      return response.data;
    },
  });

  const municipalityDisplay = [
    company?.municipality?.name,
    company?.municipality?.department?.name,
  ]
    .filter(Boolean)
    .join(" - ");

  const responsibilitiesDisplay =
    company?.responsibilities?.length && company?.responsibilities?.length > 0
      ? company?.responsibilities
          .map((responsibility) => `${responsibility.name}`.trim())
          .join(", ")
      : "N/A";

  if (isPending) {
    return (
      <div className="@container/company-form flex w-full flex-1 flex-col gap-8">
        <Skeleton className="h-[132px] w-full" />
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-[153px] w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="@container/company-form flex w-full flex-1 flex-col gap-8">
      <FieldSet>
        <FieldLegend>Logo</FieldLegend>
        <FieldGroup>
          <div className="aspect-square size-24 border bg-white">
            {/** biome-ignore lint/performance/noImgElement: {company.url_logo} is a valid URL */}
            <img
              src={company?.url_logo}
              alt="Logo de la empresa"
              className="size-24 object-contain"
            />
          </div>
        </FieldGroup>
      </FieldSet>
      <FieldSet>
        <FieldLegend>Identificación</FieldLegend>
        <FieldGroup>
          <div className="grid grid-cols-1 gap-5 @xl/field-group:grid-cols-2">
            <ReadOnlyField
              id="company-nit"
              label="NIT"
              value={`${formatValue(company?.nit)}-${formatValue(company?.dv)}`}
              icon={<ScrollTextIcon />}
            />
            <ReadOnlyField
              id="company-company"
              label="Razón social"
              value={formatValue(company?.company)}
              icon={<Building2Icon />}
            />
            <ReadOnlyField
              id="company-names"
              label="Nombres"
              value={formatValue(company?.names)}
              icon={<UserIcon />}
            />
            <ReadOnlyField
              id="company-surnames"
              label="Apellidos"
              value={formatValue(company?.surnames)}
              icon={<UserIcon />}
            />
          </div>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Contacto</FieldLegend>
        <FieldGroup>
          <div className="grid grid-cols-1 gap-5 @xl/field-group:grid-cols-2">
            <ReadOnlyField
              id="company-email"
              label="Email"
              value={formatValue(company?.email)}
              icon={<MailIcon />}
            />
            <ReadOnlyField
              id="company-phone"
              label="Teléfono"
              value={formatValue(company?.phone)}
              icon={<PhoneIcon />}
            />
            <ReadOnlyField
              id="company-address"
              label="Dirección"
              value={formatValue(company?.address)}
              icon={<MapPinHouseIcon />}
            />
            <ReadOnlyField
              id="company-municipality"
              label="Municipio"
              value={formatValue(municipalityDisplay)}
              icon={<MapPinIcon />}
            />
          </div>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Datos fiscales</FieldLegend>
        <FieldGroup>
          <div className="grid grid-cols-1 gap-5 @xl/field-group:grid-cols-2">
            <ReadOnlyField
              id="company-economic-activity"
              label="Actividad económica"
              value={formatValue(company?.economic_activity)}
              icon={<Building2Icon />}
            />
            <ReadOnlyField
              id="company-tribute"
              label="Tributo"
              value={formatValue(company?.tribute?.name)}
              icon={<LandmarkIcon />}
            />
            <ReadOnlyField
              id="company-legal-organization"
              label="Organización legal"
              value={formatValue(company?.legal_organization?.name)}
              icon={<LandmarkIcon />}
            />
            <ReadOnlyField
              id="company-responsibilities"
              label="Responsabilidades"
              value={formatValue(responsibilitiesDisplay)}
              icon={<ShieldCheckIcon />}
            />
          </div>
        </FieldGroup>
      </FieldSet>
    </div>
  );
};

export default CompanyForm;
