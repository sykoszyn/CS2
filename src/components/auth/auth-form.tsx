"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  signInWithPasswordAction,
  signUpWithPasswordAction,
  signInWithGoogleAction,
} from "@/lib/auth/actions";
import { initialAuthActionState } from "@/lib/auth/auth-action-state";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const action = mode === "login" ? signInWithPasswordAction : signUpWithPasswordAction;
  const [state, formAction] = useActionState(action, initialAuthActionState);

  return (
    <div className="mt-6 space-y-3">
      <form action={formAction} className="space-y-3">
        {mode === "register" && (
          <Input
            name="username"
            placeholder="Nombre de usuario"
            required
            minLength={3}
            maxLength={20}
            pattern="[a-z0-9_]+"
            title="Solo minúsculas, números y guión bajo"
            autoComplete="username"
          />
        )}
        <Input type="email" name="email" placeholder="Email" required autoComplete="email" />
        <Input
          type="password"
          name="password"
          placeholder="Contraseña"
          required
          minLength={6}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />

        <SubmitButton mode={mode} />
      </form>

      {state.status !== "idle" && (
        <p
          className={
            state.status === "check-email"
              ? "rounded-md border border-accent/30 bg-accent/10 p-3 text-center text-xs text-accent"
              : "rounded-md border border-danger/30 bg-danger/10 p-3 text-center text-xs text-danger"
          }
        >
          {state.message}
        </p>
      )}

      <div className="flex items-center gap-2 py-1 text-xs text-foreground-subtle">
        <span className="h-px flex-1 bg-border" /> o continuar con <span className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <form action={signInWithGoogleAction}>
          <Button type="submit" variant="outline" className="w-full">
            Google
          </Button>
        </form>
        <Button href="/auth/steam" variant="outline" className="w-full">
          Steam
        </Button>
      </div>
    </div>
  );
}

function SubmitButton({ mode }: { mode: "login" | "register" }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Un momento..." : mode === "login" ? "Ingresar" : "Crear cuenta"}
    </Button>
  );
}
