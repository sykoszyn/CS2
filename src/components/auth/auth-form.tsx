"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * UI shell for email/password + Google/Steam auth. Submission is wired to
 * Supabase Auth in Phase 2 (section 3 / 43 of the spec) — this component
 * intentionally keeps the form disabled with a status note instead of
 * silently pretending to authenticate.
 */
export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      className="mt-6 space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      {mode === "register" && (
        <Input name="username" placeholder="Nombre de usuario" required autoComplete="username" />
      )}
      <Input type="email" name="email" placeholder="Email" required autoComplete="email" />
      <Input
        type="password"
        name="password"
        placeholder="Contraseña"
        required
        minLength={8}
        autoComplete={mode === "login" ? "current-password" : "new-password"}
      />

      <Button type="submit" className="w-full">
        {mode === "login" ? "Ingresar" : "Crear cuenta"}
      </Button>

      <div className="flex items-center gap-2 py-1 text-xs text-foreground-subtle">
        <span className="h-px flex-1 bg-border" /> o continuar con <span className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" className="w-full">
          Google
        </Button>
        <Button type="button" variant="outline" className="w-full">
          Steam
        </Button>
      </div>

      {submitted && (
        <p className="rounded-md border border-border bg-background-elevated p-3 text-center text-xs text-foreground-muted">
          La autenticación con Supabase se activa en la próxima fase del desarrollo. Toda la
          navegación y el contenido siguen disponibles sin cuenta.
        </p>
      )}
    </form>
  );
}
