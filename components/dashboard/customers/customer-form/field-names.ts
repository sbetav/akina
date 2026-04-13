import type { FieldPathByValue, FieldValues } from "react-hook-form";
import type { CustomerFormValues } from "@/lib/validations/customer";

type StringLike = string | undefined | null;

export type CustomerFieldNames<T extends FieldValues> = {
  identification: FieldPathByValue<T, StringLike>;
  dv: FieldPathByValue<T, StringLike>;
  identificationDocumentId: FieldPathByValue<T, StringLike>;
  legalOrganizationId: FieldPathByValue<T, StringLike>;
  tributeId: FieldPathByValue<T, StringLike>;
  name: FieldPathByValue<T, StringLike>;
  tradeName: FieldPathByValue<T, StringLike>;
  email: FieldPathByValue<T, StringLike>;
  phone: FieldPathByValue<T, StringLike>;
  municipalityId: FieldPathByValue<T, StringLike>;
  address: FieldPathByValue<T, StringLike>;
};

export const customerFormFieldNames: CustomerFieldNames<CustomerFormValues> = {
  identification: "identification",
  dv: "dv",
  identificationDocumentId: "identificationDocumentId",
  legalOrganizationId: "legalOrganizationId",
  tributeId: "tributeId",
  name: "name",
  tradeName: "tradeName",
  email: "email",
  phone: "phone",
  municipalityId: "municipalityId",
  address: "address",
};
