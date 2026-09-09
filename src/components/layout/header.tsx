import Link from "next/link";
import { Search } from "lucide-react";
import { QuickSearchTrigger } from "@/components/layout/quick-search";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/user-menu";
import type { ProfileRow } from "@/types/database";

export function Header({ profile }: { profile: ProfileRow | null }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur lg:px-6">
      <Link href="/" className="flex items-center gap-2 lg:hidden">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand font-display text-sm font-bold text-brand-foreground">
          C2
        </span>
      </Link>

      <div className="hidden flex-1 lg:flex">
        <QuickSearchTrigger />
      </div>

      <Link
        href="/search"
        aria-label="Buscar"
        className="ml-auto flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground-muted lg:hidden"
      >
        <Search size={18} />
      </Link>

      <div className="hidden items-center gap-2 lg:flex">
        {profile ? (
          <UserMenu profile={profile} />
        ) : (
          <>
            <Button href="/login" variant="ghost" size="sm">
              Ingresar
            </Button>
            <Button href="/register" variant="primary" size="sm">
              Crear cuenta
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
