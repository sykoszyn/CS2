import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/layout/section";
import { MapCard } from "@/components/maps/map-card";
import { LineupCard } from "@/components/lineups/lineup-card";
import { PlayCard } from "@/components/plays/play-card";
import { GuideCard } from "@/components/guides/guide-card";
import { lineups } from "@/lib/mock/lineups";
import { plays } from "@/lib/mock/plays";
import { guides } from "@/lib/mock/guides";
import { getMaps } from "@/services/maps.service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Aprendé Counter-Strike 2",
  description:
    "Lineups, calls, boosts, jugadas y estrategias de CS2 creadas por la comunidad hispanohablante. Sin registro obligatorio.",
};

export default async function HomePage() {
  const maps = await getMaps();
  const popularLineups = [...lineups].sort((a, b) => b.usageCount - a.usageCount);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border px-4 py-16 lg:px-6 lg:py-24">
        <div
          className="absolute inset-0 -z-10 opacity-60"
          style={{
            background:
              "radial-gradient(60% 60% at 20% 0%, var(--brand-muted), transparent), radial-gradient(50% 50% at 100% 10%, rgba(53,224,161,0.08), transparent)",
          }}
        />
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
            Aprendé <span className="text-brand">Counter-Strike 2</span>.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-foreground-muted sm:text-lg">
            Lineups, estrategias, calls, boosts y jugadas creadas por la comunidad. Gratis, sin
            registro obligatorio.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button href="/lineups" size="lg">
              Explorar lineups
            </Button>
            <Button href="/maps" variant="secondary" size="lg">
              Explorar mapas
            </Button>
            <Button href="/register" variant="ghost" size="lg">
              Crear cuenta
            </Button>
          </div>
        </div>
      </section>

      <Section title="Mapas" subtitle="Elegí un mapa para ver sus calls, lineups y boosts" href="/maps">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {maps.map((map, i) => (
            <MapCard key={map.id} map={map} index={i} />
          ))}
        </div>
      </Section>

      <Section title="Lineups populares" subtitle="Las jugadas de utility más usadas por la comunidad" href="/lineups">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {popularLineups.map((lineup, i) => (
            <LineupCard key={lineup.id} lineup={lineup} index={i} />
          ))}
        </div>
      </Section>

      <Section title="Jugadas destacadas" subtitle="Clutches, aces y outplays de la comunidad" href="/plays">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {plays.map((play, i) => (
            <PlayCard key={play.id} play={play} index={i} />
          ))}
        </div>
      </Section>

      <Section title="Guías" subtitle="Aprendé un mapa desde cero o mejorá tu nivel" href="/guides">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide, i) => (
            <GuideCard key={guide.id} guide={guide} index={i} />
          ))}
        </div>
      </Section>
    </div>
  );
}
