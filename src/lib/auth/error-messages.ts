/** Supabase Auth error messages come in English; map the common ones via the "auth.errors" message namespace. */
export function translateAuthError(message: string, t: (key: string) => string): string {
  const known: Record<string, string> = {
    "Invalid login credentials": t("invalidCredentials"),
    "User already registered": t("userExists"),
    "Password should be at least 6 characters.": t("passwordTooShort"),
    "Email not confirmed": t("emailNotConfirmed"),
    "Unable to validate email address: invalid format": t("invalidEmail"),
  };
  return known[message] ?? t("actionGeneric");
}
