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

**FASE 3** (Sistema de lineups) — completa:

- Lineups leen de Supabase (con el mismo fallback a datos demo), incluyendo
  el join a mapa/autor/video/pasos/rating en una sola consulta.
- Usuarios registrados pueden subir un lineup propio (`/lineups/new`): mapa,
  granada, lado, pasos, video opcional y tags. La inserción es atómica vía
  una función Postgres (`create_lineup_with_steps`, `security invoker`) —
  si falla un paso, no queda un lineup a medio crear.
- Sistema de rating: estrellas + "¿funcionó?", agregado en tiempo real desde
  la tabla `ratings`.

**FASE 4** (Videos, Boosts, Jugadas) — completa:

- Boosts y jugadas leen de Supabase (`services/boosts.service.ts`,
  `services/plays.service.ts`), mismo patrón de fallback que mapas/lineups.
- Usuarios registrados pueden subir boosts (`/boosts/new`) y jugadas
  (`/plays/new`) — las jugadas exigen video (son evidencia de la jugada),
  los boosts lo dejan opcional.
- El video sigue siendo siempre un embed (YouTube hoy) — nunca se aloja
  archivo de video propio, tal como se definió en la Fase 1.

**FASE 5** (Feed, Likes, Comentarios, Favoritos) — completa:

- El feed ya no es una lista estática: se arma en tiempo real combinando
  lineups, jugadas y boosts recientes (`services/feed.service.ts`), sin
  necesitar una tabla de actividad separada.
- Likes y favoritos reales sobre lineups, jugadas y boosts — un solo botón
  reusable (`LikeButton`/`FavoriteButton`) en cards, feed y páginas de
  detalle, con estado optimista y gate de login.
- Comentarios reales (crear + borrado propio, soft delete) en cada página
  de detalle.
- `/favorites` ya no es un stub: muestra lo que el usuario guardó de verdad,
  agrupado por tipo de contenido.

**FASE 6** (Perfil, Gamificación) — completa:

- XP y niveles reales: subir un lineup da 15 XP, una jugada o boost 10 XP,
  el nivel se deriva de la XP (100 xp por nivel). Esto corre en triggers
  `after insert` de Postgres (`0005_gamification.sql`), nunca en un RPC que
  un cliente pudiera llamar directo para inflarse la XP — solo se dispara
  como efecto de un insert que RLS ya validó.
- 5 achievements (First Smoke, Primera Jugada, Primer Boost, Smoke Master,
  Community Contributor), otorgados por el mismo trigger y mostrados como
  badges en el perfil.
- El perfil real ya no es un placeholder: estadísticas reales (lineups,
  jugadas, boosts, likes recibidos, contenido verificado) y tabs con todo
  lo que esa persona publicó.

Pendiente (fases siguientes, ver brief): guías conectadas a la base de datos
(hoy siguen siendo mock), colecciones funcionales, búsqueda contra la base
(hoy es en memoria sobre datos mock), panel admin con moderación real, PWA
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
    lineups/ boosts/ plays/
                   Server actions de creación (y rating, en lineups).
    likes/ favorites/ comments/
                   Server actions genéricas para cualquier tipo de
                   contenido (polimórficas por content_type).
    labels/       Mapas enum -> etiqueta en español, compartidos entre
                   cards, filtros y formularios.
    mock/         Datos de demostración usados hasta que la DB esté poblada.
    utils/        Helpers (cn, slugify, formato de fechas/números, base URL).
    site-config.ts Navegación y metadata global del sitio.
  services/       Capa de acceso a datos (mapas, lineups, perfiles, búsqueda).
                   Punto de reemplazo cuando se conecten el resto de las tablas.
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
