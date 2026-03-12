import { authClient } from "@/lib/auth/client";

export const AUTH_COOKIE_PREFIX = "akina";

export type AuthErrorCode = keyof typeof authClient.$ERROR_CODES;
export type AuthErrorMessages = Partial<Record<AuthErrorCode, string>>;
export const AUTH_ERROR_MESSAGES = {
  // Sign-up
  USER_ALREADY_EXISTS: "Ya existe una cuenta con este correo electrónico.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    "Ya existe una cuenta con este correo electrónico.",
  FAILED_TO_CREATE_USER:
    "No se pudo crear la cuenta. Por favor, intenta de nuevo.",
  FAILED_TO_CREATE_VERIFICATION:
    "No se pudo enviar el correo de verificación. Por favor, intenta de nuevo.",

  // Sign-in
  INVALID_EMAIL_OR_PASSWORD: "Correo electrónico o contraseña incorrectos.",
  INVALID_EMAIL: "El correo electrónico no es válido.",
  INVALID_PASSWORD: "La contraseña es incorrecta.",
  USER_NOT_FOUND: "No existe ninguna cuenta con este correo electrónico.",
  EMAIL_NOT_VERIFIED:
    "Tu correo electrónico no está verificado. Revisa tu bandeja de entrada.",
  ACCOUNT_NOT_FOUND: "No existe ninguna cuenta con este correo electrónico.",
  CREDENTIAL_ACCOUNT_NOT_FOUND:
    "No existe ninguna cuenta con estas credenciales.",

  // Password
  PASSWORD_TOO_SHORT: "La contraseña es demasiado corta.",
  PASSWORD_TOO_LONG: "La contraseña es demasiado larga.",
  USER_ALREADY_HAS_PASSWORD:
    "Ya tienes una contraseña. Ingrésala para continuar.",
  INVALID_TOKEN: "Este enlace es inválido o ha expirado.",

  // Email
  EMAIL_ALREADY_VERIFIED: "Ya has verificado tu correo electrónico.",
  EMAIL_IS_ALREADY_VERIFIED: "El correo electrónico ya está verificado.",
  EMAIL_CAN_NOT_BE_UPDATED: "No se puede actualizar el correo electrónico.",
  EMAIL_MISMATCH: "El correo electrónico no coincide.",
  VERIFICATION_EMAIL_NOT_ENABLED:
    "La verificación por correo electrónico no está habilitada.",

  // Session
  FAILED_TO_CREATE_SESSION:
    "No se pudo iniciar sesión. Por favor, intenta de nuevo.",
  FAILED_TO_GET_SESSION:
    "No se pudo obtener la sesión. Vuelve a iniciar sesión.",
  FAILED_TO_UPDATE_USER:
    "No se pudo actualizar la cuenta. Por favor, intenta de nuevo.",
  SESSION_EXPIRED: "La sesión ha expirado. Por favor, vuelve a iniciar sesión.",
  SESSION_NOT_FRESH:
    "La sesión ha expirado. Por favor, vuelve a iniciar sesión.",

  // Social / linked accounts
  SOCIAL_ACCOUNT_ALREADY_LINKED:
    "Esta cuenta social ya está vinculada a otro usuario.",
  LINKED_ACCOUNT_ALREADY_EXISTS: "Esta cuenta ya está vinculada.",
  FAILED_TO_UNLINK_LAST_ACCOUNT:
    "No puedes desvincular tu única cuenta de acceso.",
  FAILED_TO_GET_USER_INFO:
    "No se pudo obtener la información del usuario desde el proveedor.",
  PROVIDER_NOT_FOUND: "El proveedor de autenticación no fue encontrado.",
  ID_TOKEN_NOT_SUPPORTED:
    "Este proveedor no es compatible con autenticación por token.",
  USER_EMAIL_NOT_FOUND: "El proveedor no proporcionó un correo electrónico.",

  // Two-factor
  TWO_FACTOR_NOT_ENABLED: "La verificación en dos pasos no está activada.",
  INVALID_CODE: "El código ingresado es incorrecto.",
  INVALID_TWO_FACTOR_COOKIE:
    "La sesión de verificación en dos pasos es inválida.",
  OTP_NOT_ENABLED: "La verificación por código OTP no está activada.",
  OTP_HAS_EXPIRED: "El código ha expirado. Solicita uno nuevo.",
  TOTP_NOT_ENABLED: "La verificación por TOTP no está activada.",
  BACKUP_CODES_NOT_ENABLED: "Los códigos de respaldo no están activados.",
  INVALID_BACKUP_CODE: "El código de respaldo es incorrecto.",
  TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE:
    "Demasiados intentos incorrectos. Solicita un nuevo código.",

  // URL / origin validation
  INVALID_ORIGIN: "El origen de la solicitud no es válido.",
  INVALID_CALLBACK_URL: "La URL de redirección no es válida.",
  INVALID_REDIRECT_URL: "La URL de redirección no es válida.",
  INVALID_ERROR_CALLBACK_URL: "La URL de error no es válida.",
  INVALID_NEW_USER_CALLBACK_URL: "La URL de nuevo usuario no es válida.",
  MISSING_OR_NULL_ORIGIN: "No se proporcionó el origen de la solicitud.",
  CALLBACK_URL_REQUIRED: "Se requiere una URL de redirección.",
  CROSS_SITE_NAVIGATION_LOGIN_BLOCKED:
    "Inicio de sesión bloqueado por seguridad. Parece un ataque CSRF.",

  // Field / validation
  MISSING_FIELD: "Por favor, completa todos los campos requeridos.",
  FIELD_NOT_ALLOWED: "No se permite modificar este campo.",
  VALIDATION_ERROR: "Los datos ingresados no son válidos.",
  ASYNC_VALIDATION_NOT_SUPPORTED: "Este tipo de validación no es compatible.",
} satisfies AuthErrorMessages & { EMAIL_IS_ALREADY_VERIFIED: string };
