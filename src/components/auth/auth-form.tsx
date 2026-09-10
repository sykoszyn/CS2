"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("auth");

  return (
    <div className="mt-6 space-y-3">
      <form action={formAction} className="space-y-3">
        {mode === "register" && (
          <Input
            name="username"
            placeholder={t("usernamePlaceholder")}
            required
            minLength={3}
            maxLength={20}
            pattern="[a-z0-9_]+"
            title={t("usernameTitle")}
            autoComplete="username"
          />
        )}
        <Input type="email" name="email" placeholder={t("emailPlaceholder")} required autoComplete="email" />
        <Input
          type="password"
          name="password"
          placeholder={t("passwordPlaceholder")}
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
        <span className="h-px flex-1 bg-border" /> {t("orContinueWith")} <span className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <form action={signInWithGoogleAction}>
          <Button type="submit" variant="outline" className="w-full">
            {t("google")}
          </Button>
        </form>
        <Button href="/auth/steam" unlocalized variant="outline" className="w-full">
          {t("steam")}
        </Button>
      </div>
    </div>
  );
}

function SubmitButton({ mode }: { mode: "login" | "register" }) {
  const { pending } = useFormStatus();
  const t = useTranslations("auth");

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? t("pending") : mode === "login" ? t("login") : t("register")}
    </Button>
  );
}
