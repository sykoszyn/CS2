# SmokeAR

El hub de aprendizaje de Counter-Strike 2 en español: lineups, calls, boosts,
jugadas y estrategias creadas por la comunidad. Uso público sin registro
obligatorio; cuenta opcional para guardar, subir y participar en la comunidad.

## Estado del proyecto

**FASE 1** (Arquitectura, UX, Base de datos, Routing, Design system) — completa:

- Scaffold Next.js 16 (App Router) + TypeScript + Tailwind CSS v4.
- Design system propio (dark mode por defecto) en `src/components/ui`.
- Shell responsive: sidebar de escritorio + bottom navigation móvil + búsqueda
  rápida (Ctrl/Cmd+K).
- Routing completo de la sección 29 del brief, con contenido de demostración,
  metadata/SEO (`generateMetadata`, `sitemap.ts`, `robots.ts`, JSON-LD `HowTo`
  en lineups) y estados vacíos/loading/no-encontrado.
- Esquema SQL completo para Supabase (`supabase/migrations/`) con Row Level
  Security en todas las tablas.
- Clientes de Supabase (browser/server/admin) y tipos de base de datos en
  `src/lib/supabase` y `src/types/database.ts`.

**FASE 2** (Autenticación, Mapas, Calls) — completa:

- Supabase Auth real: email/password, Google OAuth, y login con Steam
  implementado a mano sobre OpenID 2.0 (Supabase no tiene proveedor nativo).
- Header/sidebar conscientes de la sesión, `/admin` protegido por rol.
- Mapas y calls leen de Supabase, con fallback automático a datos demo si el
  proyecto no está configurado o una consulta falla.
- Desplegado en Vercel: https://smokear.vercel.app

Pendiente (fases siguientes, ver brief): lineups/boosts/jugadas/guías
conectados a la base de datos (hoy siguen siendo mock), likes/favoritos/
colecciones funcionales, gamificación, panel admin con moderación real, PWA
instalable, analytics.

## Estructura del proyecto

```
src/
  app/            Rutas (App Router). Cada carpeta = una URL de la sección 29.
  components/
    ui/           Design system genérico (Button, Card, Badge, Tabs...).
    layout/       Sidebar, bottom nav, header, quick search, secciones.
    maps/ lineups/ boosts/ plays/ guides/ feed/ auth/
                   Componentes específicos de cada dominio.
  lib/
    supabase/     Clientes de Supabase (browser, server, admin, proxy).
    auth/         Server actions y helpers de autenticación.
    mock/         Datos de demostración usados hasta que la DB esté poblada.
    utils/        Helpers (cn, formato de fechas/números, base URL).
    site-config.ts Navegación y metadata global del sitio.
  services/       Capa de acceso a datos (mapas, perfiles, búsqueda). Punto de
                   reemplazo cuando se conecten el resto de las tablas.
  types/          Tipos de dominio (`content.ts`) y de base de datos (`database.ts`).
  proxy.ts        Reemplazo de middleware.ts en Next 16 — refresca la sesión.
supabase/
  migrations/     Esquema SQL y datos de demostración, en orden numérico.
public/           Assets estáticos (iconos, imágenes).
```

## Comandos

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

## Variables de entorno

Copiar `.env.example` a `.env.local` y completar con las credenciales del
proyecto de Supabase (ver `supabase/README.md`).

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Supabase
(Postgres, Auth, Storage, RLS) · Vercel.
