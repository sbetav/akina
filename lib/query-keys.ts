export const DASHBOARD_QUERY_KEY = ["dashboard"] as const;
export const CREDENTIALS_QUERY_KEY = ["factus", "credentials"] as const;
export const CUSTOMERS_QUERY_KEY = ["customers"] as const;
export const PROVIDERS_QUERY_KEY = ["providers"] as const;
export const PRODUCTS_QUERY_KEY = ["products"] as const;
export const INVOICES_QUERY_KEY = ["invoices"] as const;
export const CREDIT_NOTES_QUERY_KEY = ["credit-notes"] as const;
export const SUPPORT_DOCUMENTS_QUERY_KEY = ["support-documents"] as const;
export const ADJUSTMENT_NOTES_QUERY_KEY = ["adjustment-notes"] as const;
export const COUNTRIES_QUERY_KEY = ["factus", "countries"] as const;
export const MUNICIPALITIES_QUERY_KEY = ["factus", "municipalities"] as const;
export const MEASUREMENT_UNITS_QUERY_KEY = [
  "factus",
  "measurement-units",
] as const;
export const TRIBUTES_QUERY_KEY = ["factus", "tributes"] as const;
export const ACQUIRER_QUERY_KEY = ["factus", "acquirer"] as const;
export const NUMBERING_RANGES_QUERY_KEY = [
  "factus",
  "numbering-ranges",
] as const;
export const NUMBERING_RANGES_CATALOG_QUERY_KEY = [
  "factus",
  "numbering-ranges-catalog",
] as const;

export const DEFAULT_CUSTOMERS_LIMIT = 20;
export const DEFAULT_PROVIDERS_LIMIT = 20;
export const DEFAULT_PRODUCTS_LIMIT = 20;
export const DEFAULT_INVOICES_LIMIT = 20;
export const DEFAULT_SUPPORT_DOCUMENTS_LIMIT = 20;
export const DEFAULT_NUMBERING_RANGES_LIMIT = 10;

/**
 * Query key prefixes that depend on the active credential.
 * When the user switches credentials, these caches are cleared (no refetch)
 * until activation succeeds; then they are invalidated to load data for the
 * new active credential.
 */
export const CREDENTIAL_DEPENDENT_KEYS = [
  DASHBOARD_QUERY_KEY,
  CUSTOMERS_QUERY_KEY,
  PROVIDERS_QUERY_KEY,
  PRODUCTS_QUERY_KEY,
  INVOICES_QUERY_KEY,
  CREDIT_NOTES_QUERY_KEY,
  SUPPORT_DOCUMENTS_QUERY_KEY,
  ADJUSTMENT_NOTES_QUERY_KEY,
  ACQUIRER_QUERY_KEY,
  NUMBERING_RANGES_QUERY_KEY,
  NUMBERING_RANGES_CATALOG_QUERY_KEY,
] as const;
