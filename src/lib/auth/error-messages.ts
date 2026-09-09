const knownMessages: Record<string, string> = {
  "Invalid login credentials": "Email o contraseña incorrectos.",
  "User already registered": "Ya existe una cuenta con ese email.",
  "Password should be at least 6 characters.": "La contraseña debe tener al menos 6 caracteres.",
  "Email not confirmed": "Todavía no confirmaste tu email. Revisá tu bandeja de entrada.",
  "Unable to validate email address: invalid format": "El email no tiene un formato válido.",
};

/** Supabase Auth error messages come in English; map the common ones to Spanish. */
export function translateAuthError(message: string): string {
  return knownMessages[message] ?? "Ocurrió un error. Intentá de nuevo.";
}
