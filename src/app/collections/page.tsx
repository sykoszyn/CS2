import type { Metadata } from "next";
import { FolderHeart } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Colecciones",
  robots: { index: false },
};

export default function CollectionsPage() {
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
