"use client";

import type { FC } from "react";
import type { CustomerFieldNames } from "@/components/dashboard/customers/customer-form/field-names";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import { Separator } from "@/components/ui/separator";
import type { CustomerDetailResult } from "@/elysia/modules/customers";
import type { InvoiceFormValues } from "@/lib/validations/invoice";
import { CustomerFormFieldsets } from "../../../customers/customer-form";
import CustomerSearch from "./customer-search";

const INVOICE_CUSTOMER_FIELD_NAMES: CustomerFieldNames<InvoiceFormValues> = {
  identification: "customer.identification",
  dv: "customer.dv",
  identificationDocumentId: "customer.identificationDocumentId",
  legalOrganizationId: "customer.legalOrganizationId",
  tributeId: "customer.tributeId",
  name: "customer.name",
  tradeName: "customer.tradeName",
  email: "customer.email",
  phone: "customer.phone",
  municipalityId: "customer.municipalityId",
  address: "customer.address",
};

export interface CustomerStepProps {
  selectedCustomer?: CustomerDetailResult | null;
  onSelectedCustomerChange?: (customer: CustomerDetailResult | null) => void;
}

const CustomerStep: FC<CustomerStepProps> = ({
  selectedCustomer,
  onSelectedCustomerChange,
}) => {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader size="sm">
        <PageHeaderContent>
          <PageHeaderTitle>Detalles del cliente</PageHeaderTitle>
          <PageHeaderDescription>
            Selecciona un cliente o ingresa los datos manualmente
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>

      <CustomerSearch
        selectedCustomer={selectedCustomer ?? null}
        onSelectedCustomerChange={onSelectedCustomerChange}
      />

      <Separator className="mt-2.5 mb-2" />

      <CustomerFormFieldsets names={INVOICE_CUSTOMER_FIELD_NAMES} />
    </div>
  );
};

export default CustomerStep;
