import type { Metadata } from "next";
import { GuideCard } from "@/components/guides/guide-card";
import { EmptyState } from "@/components/ui/empty-state";
import { guides } from "@/lib/mock/guides";

export const metadata: Metadata = {
  title: "Guías de CS2",
  description: "Guías para principiantes y avanzadas: aprendé mapas, estrategias y tácticas de Counter-Strike 2.",
};

export default function GuidesPage() {
  return (
    <div className="px-4 py-8 lg:px-6">
      <h1 className="font-display text-2xl font-bold">Guías</h1>
      <p className="mt-1 text-sm text-foreground-muted">
        Desde &quot;Mirage desde cero&quot; hasta estrategias avanzadas de nivel competitivo.
      </p>
      <div className="mt-6">
        {guides.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide, i) => (
              <GuideCard key={guide.id} guide={guide} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState title="Todavía no hay guías publicadas" />
        )}
      </div>
    </div>
  );
}
