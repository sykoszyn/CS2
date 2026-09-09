"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import { signOutAction } from "@/lib/auth/actions";
import type { ProfileRow } from "@/types/database";

export function UserMenu({ profile }: { profile: ProfileRow }) {
  const [open, setOpen] = useState(false);
  const isStaff = profile.role === "admin" || profile.role === "moderator";

  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-sm hover:bg-background-elevated"
      >
        <span className="h-6 w-6 overflow-hidden rounded-full bg-background-elevated">
          {profile.avatar_url && (
            // eslint-disable-next-line @next/next/no-img-element -- avatars come from arbitrary external providers (Google/Steam)
            <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
          )}
        </span>
        {profile.username}
        <ChevronDown size={14} className="text-foreground-subtle" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 w-48 rounded-md border border-border bg-background-elevated py-1 shadow-xl">
          <Link
            href={`/profile/${profile.username}`}
            className="block px-3 py-2 text-sm hover:bg-background-card"
          >
            Mi perfil
          </Link>
          <Link href="/favorites" className="block px-3 py-2 text-sm hover:bg-background-card">
            Favoritos
          </Link>
          <Link href="/collections" className="block px-3 py-2 text-sm hover:bg-background-card">
            Colecciones
          </Link>
          {isStaff && (
            <Link href="/admin" className="block px-3 py-2 text-sm hover:bg-background-card">
              Admin
            </Link>
          )}
          <Link
            href="/settings"
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-background-card"
          >
            <Settings size={14} />
            Configuración
          </Link>
          <form action={signOutAction} className="border-t border-border">
            <button
              type="submit"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger hover:bg-background-card"
            >
              <LogOut size={14} />
              Cerrar sesión
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
