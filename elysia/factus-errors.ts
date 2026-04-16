import { FactusError } from "factus-js";

/**
 * Returns true when a Factus API call fails with a 404-equivalent response.
 *
 * Uses the public `statusCode` property of `FactusError` (the only reliable,
 * typed indicator of the HTTP status code). Falls back to a message string
 * check for any edge cases where the status code is not set correctly.
 */
export function isFactusNotFoundError(error: unknown): boolean {
  if (!(error instanceof FactusError)) return false;
  return (
    error.statusCode === 404 ||
    error.message.toLowerCase().includes("not found")
  );
}