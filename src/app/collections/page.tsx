import type { Metadata } from "next";
import { FolderHeart } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Colecciones",
  robots: { index: false },
};

export default async function CollectionsPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <div className="px-4 py-16 lg:px-6">
        <EmptyState
          icon={FolderHeart}
          title="Organizá contenido en tus propias colecciones"
          description='Por ejemplo: "Utility T Side", "Entrenamiento antes de Faceit" o "Retakes". Requiere una cuenta gratuita.'
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
      <h1 className="mb-6 font-display text-2xl font-bold">Colecciones</h1>
      <EmptyState
        icon={FolderHeart}
        title="Todavía no creaste ninguna colección"
        description='Agrupá contenido en listas propias, como "Utility T Side" o "Retakes".'
      />
    </div>
  );
}
