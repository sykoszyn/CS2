# CS2 Academy

El hub de aprendizaje de Counter-Strike 2 en español: lineups, calls, boosts,
jugadas y estrategias creadas por la comunidad. Uso público sin registro
obligatorio; cuenta opcional para guardar, subir y participar en la comunidad.

## Estado del proyecto — FASE 1 (Arquitectura, UX, Base de datos, Routing, Design system)

Completado en esta fase:

- Scaffold Next.js 16 (App Router) + TypeScript + Tailwind CSS v4.
- Design system propio (dark mode por defecto) en `src/components/ui`.
- Shell responsive: sidebar de escritorio + bottom navigation móvil + búsqueda
  rápida (Ctrl/Cmd+K).
- Routing completo de la sección 29 del brief, con contenido de demostración,
  metadata/SEO (`generateMetadata`, `sitemap.ts`, `robots.ts`, JSON-LD `HowTo`
  en lineups) y estados vacíos/loading/no-encontrado.
- Esquema SQL completo para Supabase (`supabase/migrations/0001_init.sql`) con
  Row Level Security en todas las tablas.
- Datos de demostración (`supabase/seed/0002_seed.sql`), todos marcados
  `is_demo` y sin verificación falsa.
- Clientes de Supabase (browser/server/admin) y tipos de base de datos en
  `src/lib/supabase` y `src/types/database.ts`.

Pendiente (fases siguientes, ver brief): autenticación real (Supabase Auth +
Google/Steam), CRUD de contenido conectado a la base de datos, likes/favoritos/
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
    supabase/     Clientes de Supabase (browser, server, admin).
    mock/         Datos de demostración usados hasta que la DB esté poblada.
    utils/        Helpers (cn, formato de fechas/números).
    site-config.ts Navegación y metadata global del sitio.
  services/       Capa de acceso a datos (hoy: búsqueda). Punto de reemplazo
                   cuando se conecte Supabase en las próximas fases.
  types/          Tipos de dominio (`content.ts`) y de base de datos (`database.ts`).
supabase/
  migrations/     Esquema SQL versionado.
  seed/           Datos de demostración.
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
