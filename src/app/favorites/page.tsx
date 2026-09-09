import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Favoritos",
  robots: { index: false },
};

export default async function FavoritesPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <div className="px-4 py-16 lg:px-6">
        <EmptyState
          icon={Heart}
          title="Guardá tus lineups, boosts y guías favoritas"
          description="Creá una cuenta gratis para acceder a tus favoritos desde cualquier dispositivo."
          action={
            <div className="flex gap-2">
              <Button href="/login" variant="secondary" size="sm">
                Ingresar
              </Button>
              <Button href="/register" size="sm">
                Crear cuenta
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="px-4 py-16 lg:px-6">
      <h1 className="mb-6 font-display text-2xl font-bold">Favoritos</h1>
      <EmptyState
        icon={Heart}
        title="Todavía no guardaste nada"
        description="Cuando encuentres un lineup, boost o guía útil, tocá «Guardar» para verlo acá."
      />
    </div>
  );
}
