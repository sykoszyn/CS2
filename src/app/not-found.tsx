import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <EmptyState
        icon={SearchX}
        title="No encontramos esta página"
        description="El contenido que buscás no existe o fue eliminado."
        action={<Button href="/">Volver al inicio</Button>}
      />
    </div>
  );
}
