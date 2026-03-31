export const CREDENTIALS_QUERY_KEY = ["factus", "credentials"] as const;
export const CUSTOMERS_QUERY_KEY = ["customers"] as const;
export const PRODUCTS_QUERY_KEY = ["products"] as const;
export const MUNICIPALITIES_QUERY_KEY = ["factus", "municipalities"] as const;
export const MEASUREMENT_UNITS_QUERY_KEY = [
  "factus",
  "measurement-units",
] as const;
export const TRIBUTES_QUERY_KEY = ["factus", "tributes"] as const;
export const ACQUIRER_QUERY_KEY = ["factus", "acquirer"] as const;

export const DEFAULT_CUSTOMERS_LIMIT = 20;
export const DEFAULT_PRODUCTS_LIMIT = 20;

/**
 * Query key prefixes that depend on the active credential.
 * When the user switches credentials, all queries matching these
 * prefixes are removed so the UI refetches fresh data.
 */
export const CREDENTIAL_DEPENDENT_KEYS = [
  CUSTOMERS_QUERY_KEY,
  PRODUCTS_QUERY_KEY,
  ACQUIRER_QUERY_KEY,
] as const;
