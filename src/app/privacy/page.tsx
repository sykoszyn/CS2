import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Política de privacidad",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:px-6">
      <h1 className="font-display text-2xl font-bold">Política de privacidad</h1>
      <p className="mt-1 text-sm text-foreground-subtle">Última actualización: 2026.</p>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-foreground-muted">
        <p>
          Este documento es un borrador inicial pensado para acompañar el lanzamiento de{" "}
          {siteConfig.name} en tiendas de aplicaciones y no reemplaza una revisión legal. Antes de
          publicar la app, reemplazá el contacto de soporte de más abajo por uno real que puedas
          monitorear.
        </p>

        <section>
          <h2 className="font-display text-base font-semibold text-foreground">Qué datos recolectamos</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong className="text-foreground">Cuenta:</strong> email (o un email sintético si
              entrás con Steam), nombre de usuario, nombre para mostrar, foto de perfil y biografía si
              la completás.
            </li>
            <li>
              <strong className="text-foreground">Autenticación con terceros:</strong> si entrás con
              Google o Steam, recibimos tu identificador de esa cuenta, tu nombre y tu foto de perfil
              públicos — nunca tu contraseña.
            </li>
            <li>
              <strong className="text-foreground">Contenido:</strong> lineups, boosts, jugadas, guías,
              comentarios, calificaciones y reportes que publiques.
            </li>
            <li>
              <strong className="text-foreground">Uso del sitio:</strong> métricas agregadas y anónimas
              de rendimiento y navegación (Vercel Analytics / Speed Insights), sin cookies de
              seguimiento publicitario ni venta de datos a terceros.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-foreground">Para qué los usamos</h2>
          <p className="mt-2">
            Para operar la cuenta y la sesión (cookies estrictamente necesarias de autenticación),
            mostrar tu contenido y perfil público, calcular XP/nivel/logros, moderar la plataforma
            (reportes, bans) y entender qué páginas funcionan mejor para priorizar mejoras.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-foreground">Con quién los compartimos</h2>
          <p className="mt-2">
            Con nuestros proveedores de infraestructura — Supabase (base de datos y autenticación) y
            Vercel (hosting y analítica) — únicamente para operar el servicio. No vendemos datos
            personales a terceros ni los usamos para publicidad.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-foreground">Tus derechos</h2>
          <p className="mt-2">
            Podés editar tu perfil en cualquier momento, y eliminar tu cuenta y tus datos personales
            (likes, favoritos, comentarios, calificaciones) de forma permanente desde{" "}
            <a href="/settings" className="text-brand hover:underline">
              Configuración
            </a>
            . El contenido que publicaste (lineups, boosts, jugadas, guías) queda en la plataforma sin
            tu nombre, igual que el resto del contenido de la comunidad.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-foreground">Contacto</h2>
          <p className="mt-2">
            Preguntas sobre esta política o tus datos: reemplazá esto por un email de soporte real
            antes de publicar en las tiendas de aplicaciones.
          </p>
        </section>
      </div>
    </div>
  );
}
