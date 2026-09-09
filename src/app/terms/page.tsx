import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Términos de uso",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:px-6">
      <h1 className="font-display text-2xl font-bold">Términos de uso</h1>
      <p className="mt-1 text-sm text-foreground-subtle">Última actualización: 2026.</p>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-foreground-muted">
        <p>
          Este documento es un borrador inicial pensado para acompañar el lanzamiento de{" "}
          {siteConfig.name} en tiendas de aplicaciones y no reemplaza una revisión legal.
        </p>

        <section>
          <h2 className="font-display text-base font-semibold text-foreground">El servicio</h2>
          <p className="mt-2">
            {siteConfig.name} es un hub de aprendizaje de Counter-Strike 2 hecho por la comunidad. Uso
            público sin registro obligatorio; la cuenta es opcional para publicar, calificar, comentar
            y guardar contenido.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-foreground">Contenido de usuarios</h2>
          <p className="mt-2">
            Sos responsable del contenido que publicás (lineups, boosts, jugadas, guías, comentarios).
            No publiques contenido ofensivo, con copyright ajeno, spam o información falsa — un
            moderador o admin puede eliminarlo o suspender tu cuenta si lo hacés. Cualquier usuario
            puede reportar contenido que incumpla esto desde la página de detalle.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-foreground">Cuentas</h2>
          <p className="mt-2">
            Sos responsable de mantener segura tu sesión. Podés eliminar tu cuenta en cualquier momento
            desde Configuración; ver la{" "}
            <a href="/privacy" className="text-brand hover:underline">
              Política de privacidad
            </a>{" "}
            para el detalle de qué pasa con tus datos y tu contenido al hacerlo.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-foreground">Disponibilidad</h2>
          <p className="mt-2">
            El servicio se ofrece &quot;tal cual&quot;, sin garantía de disponibilidad continua. El
            contenido lo genera la comunidad y puede contener errores — probá cualquier lineup o
            estrategia bajo tu propio criterio.
          </p>
        </section>
      </div>
    </div>
  );
}
