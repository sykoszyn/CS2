"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { deleteAccountAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

export function DeleteAccountForm({ username }: { username: string }) {
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const t = useTranslations("settings.deleteAccount");

  const canDelete = confirmText.trim().toLowerCase() === username.toLowerCase();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteAccountAction();
      if (result.status === "error") setError(result.message);
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-foreground-muted">{t("confirmPrompt", { username })}</p>
      <input
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder={username}
        className="w-full max-w-xs rounded-md border border-border bg-background-elevated px-3 py-2 text-sm text-foreground outline-none focus-visible:border-danger"
      />
      {error && <p className="text-xs text-danger">{error}</p>}
      <Button variant="danger" size="sm" onClick={handleDelete} disabled={!canDelete || pending}>
        {pending ? t("deleting") : t("submit")}
      </Button>
    </div>
  );
}
