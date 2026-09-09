import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Favoritos",
  robots: { index: false },
};

export default function FavoritesPage() {
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
