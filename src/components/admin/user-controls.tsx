"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleBanAction, setRoleAction } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/database";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "user", label: "Usuario" },
  { value: "moderator", label: "Moderador" },
  { value: "admin", label: "Admin" },
];

export function UserControls({
  userId,
  role,
  banned,
}: {
  userId: string;
  role: UserRole;
  banned: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleBanToggle() {
    if (!banned && !confirm("¿Suspender esta cuenta?")) return;
    setError(null);
    startTransition(async () => {
      const result = await toggleBanAction(userId, banned);
      if (result.status === "error") setError(result.message);
      else router.refresh();
    });
  }

  function handleRoleChange(newRole: UserRole) {
    setError(null);
    startTransition(async () => {
      const result = await setRoleAction(userId, newRole);
      if (result.status === "error") setError(result.message);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <select
          value={role}
          onChange={(e) => handleRoleChange(e.target.value as UserRole)}
          disabled={pending}
          className="rounded-md border border-border bg-background-elevated px-2 py-1 text-xs text-foreground outline-none focus-visible:border-brand"
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <Button size="sm" variant={banned ? "secondary" : "danger"} onClick={handleBanToggle} disabled={pending}>
          {banned ? "Desbanear" : "Banear"}
        </Button>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
