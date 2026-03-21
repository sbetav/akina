"use client";

import { Button } from "@/components/ui/button";
import { useAcquirerAutofill } from "@/hooks/use-acquirer-autofill";
import { type Municipality } from "@/lib/factus";
import {
  CustomerFormValues,
  customerFormSchema,
} from "@/lib/validations/customer";
import { zodResolver } from "@hookform/resolvers/zod";
import { SaveIcon } from "lucide-react";
import { FC, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import DashboardCard from "../../dashboard-card";
import { ContactFieldSet } from "./contact-fieldset";
import { IdentificationFieldSet } from "./identification-fieldset";
import { OrganizationFieldSet } from "./organization-fieldset";

interface CustomerFormProps {
  municipalities: Municipality[];
}

const CustomerForm: FC<CustomerFormProps> = ({ municipalities }) => {
  const { handleSubmit, control, resetField, setValue } =
    useForm<CustomerFormValues>({
      resolver: zodResolver(customerFormSchema),
      defaultValues: {
        identification_document_id: "",
        identification: "",
        dv: "",
        legal_organization_id: "2",
        tribute_id: "",
        name: "",
        trade_name: "",
        email: "",
        phone: "",
        municipality_id: "",
        address: "",
      },
    });

  const [identificationDocumentId, identification, legalOrganizationId] =
    useWatch({
      control,
      name: [
        "identification_document_id",
        "identification",
        "legal_organization_id",
      ],
    });

  const isNIT = identificationDocumentId === "6";
  const isNaturalPerson = legalOrganizationId === "2";

  const { isPending } = useAcquirerAutofill({
    identificationDocumentId,
    identification,
    setValue,
  });

  useEffect(() => {
    if (!isNIT) resetField("dv", { defaultValue: "" });
  }, [isNIT, resetField]);

  return (
    <DashboardCard className="flex flex-1">
      <form
        onSubmit={handleSubmit((data) => {
          console.log(data);
        })}
        className="flex w-full flex-col gap-8"
      >
        <div className="flex flex-1 flex-col gap-8">
          <IdentificationFieldSet
            control={control}
            isNIT={isNIT}
            isSearchingAcquirer={isPending}
          />

          <OrganizationFieldSet
            control={control}
            isNaturalPerson={isNaturalPerson}
          />

          <ContactFieldSet control={control} municipalities={municipalities} />
        </div>

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
    </DashboardCard>
  );
};

export default CustomerForm;
