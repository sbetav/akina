import { AUTH_ERROR_MESSAGES, type AuthErrorCode } from "./constants";

export function getAuthErrorMessage(
  code?: AuthErrorCode | string | null,
): string {
  if (code && code in AUTH_ERROR_MESSAGES) {
    return AUTH_ERROR_MESSAGES[code as keyof typeof AUTH_ERROR_MESSAGES];
  }
  return "Ocurrió un error inesperado. Por favor, intenta de nuevo.";
}
