const errorMessages: Record<string, string> = {
  "not-configured": "La autenticación todavía no está configurada en este entorno.",
  oauth: "No pudimos iniciar sesión con Google. Intentá de nuevo.",
  steam: "No pudimos verificar tu cuenta de Steam. Intentá de nuevo.",
  auth: "El link de confirmación es inválido o expiró.",
};

export function OAuthErrorBanner({ error }: { error?: string }) {
  if (!error) return null;
  const message = errorMessages[error] ?? "Ocurrió un error al iniciar sesión.";

  return (
    <p className="mb-4 rounded-md border border-danger/30 bg-danger/10 p-3 text-center text-xs text-danger">
      {message}
    </p>
  );
}
