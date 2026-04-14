"use client";

import { IdentityDocumentTypeId, IdentityDocumentTypeIdInfo } from "factus-js";
import { SearchIcon } from "lucide-react";
import { type FC, useCallback, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { InputGroupAddon } from "@/components/ui/input-group";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import type { CustomerDetailResult } from "@/elysia/modules/customers";
import { useCustomers } from "@/hooks/api/use-customers";
import type { InvoiceFormValues } from "@/lib/validations/invoice";
import type { CustomerStepProps } from ".";

const EMPTY_CUSTOMER_VALUES: InvoiceFormValues["customer"] = {
  identification: "",
  dv: "",
  identificationDocumentId: IdentityDocumentTypeId.CitizenshipId,
  legalOrganizationId: "2",
  tributeId: "18",
  name: "",
  tradeName: "",
  address: "",
  email: "",
  phone: "",
  municipalityId: "",
};

function toInvoiceCustomerValues(
  customer: CustomerDetailResult,
): InvoiceFormValues["customer"] {
  return {
    identification: customer.identification ?? "",
    dv: customer.dv ?? "",
    identificationDocumentId:
      customer.identificationDocumentId as InvoiceFormValues["customer"]["identificationDocumentId"],
    legalOrganizationId:
      customer.legalOrganizationId as InvoiceFormValues["customer"]["legalOrganizationId"],
    tributeId: customer.tributeId as InvoiceFormValues["customer"]["tributeId"],
    name: customer.name ?? "",
    tradeName: customer.tradeName ?? "",
    address: customer.address ?? "",
    email: customer.email ?? "",
    phone: customer.phone ?? "",
    municipalityId: customer.municipalityId ?? "",
  };
}

const CustomerSearch: FC<
  Required<Pick<CustomerStepProps, "selectedCustomer">> &
    Pick<CustomerStepProps, "onSelectedCustomerChange">
> = ({ selectedCustomer, onSelectedCustomerChange }) => {
  const { setValue } = useFormContext<InvoiceFormValues>();
  const [search, setSearch] = useState("");

  const { data, isFetching } = useCustomers({ search, paginated: true });

  const selectedCustomerItem = useMemo(() => {
    if (!selectedCustomer) return null;
    const items = data?.items ?? [];
    return (
      items.find((item) => item.id === selectedCustomer.id) ?? selectedCustomer
    );
  }, [data?.items, selectedCustomer]);

  const formatUserId = (idType: IdentityDocumentTypeId, id: string) => {
    return `${IdentityDocumentTypeIdInfo[idType].abbreviation}. ${id}`;
  };

  const clearCustomerValues = useCallback(() => {
    setValue("customer", EMPTY_CUSTOMER_VALUES, { shouldValidate: false });
    onSelectedCustomerChange?.(null);
  }, [onSelectedCustomerChange, setValue]);

  const populateFromDetail = useCallback(
    (customer: CustomerDetailResult) => {
      setValue("customer", toInvoiceCustomerValues(customer), {
        shouldValidate: true,
      });
      onSelectedCustomerChange?.(customer);
    },
    [onSelectedCustomerChange, setValue],
  );

  return (
    <div className="flex flex-1 flex-col gap-6">
      <Combobox
        filter={null}
        items={data?.items ?? []}
        itemToStringLabel={(customer: CustomerDetailResult) =>
          `${customer.name}, ${formatUserId(customer.identificationDocumentId, customer.identification)}`
        }
        itemToStringValue={(customer: CustomerDetailResult) =>
          String(customer.id)
        }
        value={selectedCustomerItem}
        onValueChange={(item) => {
          const customer = item ?? null;

          if (!customer?.id) {
            clearCustomerValues();
            return;
          }

          populateFromDetail(customer);
        }}
        inputValue={search}
        onInputValueChange={(value) => setSearch(value)}
      >
        <ComboboxInput
          placeholder="Buscar por nombre o numero de documento"
          showPending={isFetching}
          onChange={(e) => setSearch(e.target.value)}
        >
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </ComboboxInput>

        <ComboboxContent>
          <ComboboxEmpty>No se encontraron resultados.</ComboboxEmpty>
          <ComboboxList>
            {(customer: CustomerDetailResult) => (
              <ComboboxItem key={customer.id} value={customer}>
                <Item size="xs" className="p-0">
                  <ItemContent>
                    <ItemTitle className="whitespace-nowrap">
                      {customer.name}
                    </ItemTitle>
                    <ItemDescription>
                      {formatUserId(
                        customer.identificationDocumentId,
                        customer.identification,
                      )}
                    </ItemDescription>
                  </ItemContent>
                </Item>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
};

export default CustomerSearch;
