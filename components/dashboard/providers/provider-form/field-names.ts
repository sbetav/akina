import type { FieldPath, FieldValues } from "react-hook-form";
import type { ProviderFormValues } from "@/lib/validations/provider";

export type ProviderFieldNames<T extends FieldValues> = {
  identification: FieldPath<T>;
  dv: FieldPath<T>;
  identificationDocumentId: FieldPath<T>;
  names: FieldPath<T>;
  tradeName: FieldPath<T>;
  countryCode: FieldPath<T>;
  isResident: FieldPath<T>;
  email: FieldPath<T>;
  phone: FieldPath<T>;
  municipalityId: FieldPath<T>;
  address: FieldPath<T>;
};

export const providerFormFieldNames: ProviderFieldNames<ProviderFormValues> = {
  identification: "identification",
  dv: "dv",
  identificationDocumentId: "identificationDocumentId",
  names: "names",
  tradeName: "tradeName",
  countryCode: "countryCode",
  isResident: "isResident",
  email: "email",
  phone: "phone",
  municipalityId: "municipalityId",
  address: "address",
};
