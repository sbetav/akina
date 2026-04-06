export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== "object") return fallback;

  const value = "value" in error ? error.value : error;

  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return fallback;

  if ("error" in value && typeof value.error === "string") {
    return value.error;
  }

  if ("message" in value && typeof value.message === "string") {
    return value.message;
  }

  return fallback;
}
