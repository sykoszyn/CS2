import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Sin conexión",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <div className="px-4 py-16 lg:px-6">
      <EmptyState
        icon={WifiOff}
        title="Estás sin conexión"
        description="No pudimos cargar esta página. Revisá tu conexión a internet e intentá de nuevo."
      />
    </div>
  );
}
