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

**FASE 7** (Admin, Moderación) — completa:

- Sistema de reportes real: cualquier usuario puede reportar un lineup, boost
  o jugada (motivo + descripción opcional) desde su página de detalle.
- Panel `/admin` reescrito sin datos mock: dashboard con conteos reales,
  cola de reportes pendientes (aprobar elimina el contenido, rechazar
  descarta el reporte), cola de lineups sin verificar, y gestión de usuarios
  (banear/desbanear, cambiar rol) — esta última solo para admins, no
  moderadores.
- Cuentas suspendidas (`banned_at`) pierden la posibilidad de subir
  contenido, comentar o reportar, pero mantienen acceso de lectura completo
  — nunca hay muro de login para navegar.
- Dos clases de fix de seguridad encontrados y corregidos mientras se
  construía esto (ver `supabase/README.md` para el detalle):
  1. RLS de Postgres es a nivel de fila, no de columna: la política que
     dejaba a cada usuario actualizar su propia fila en `profiles` (o su
     propio lineup/boost/jugada) no impedía que cambiara columnas sensibles
     como `role`, `banned_at`, `status` o `verified` — un usuario podía
     auto-promoverse a admin, o revertir una eliminación de un moderador,
     con una sola llamada directa a la API. Se corrigió con triggers
     `before update` que sí distinguen columnas.
  2. Una política de `select` que oculta contenido `removed` también bloquea
     — sin excepción — que cualquiera (incluido un admin) escriba ese mismo
     valor vía `update`, porque Postgres revisa la política de `select`
     contra la fila resultante. Se corrigió dejando que los admins vean
     contenido eliminado.

**FASE 8** (PWA instalable) — completa:

- `src/app/manifest.ts` genera `/manifest.webmanifest` (nombre, colores de
  marca, `display: standalone`, atajos a Lineups/Mapas/Feed/Buscar).
- Ícono de marca real (el mismo mark "S" naranja sobre fondo oscuro que ya
  usaba la sidebar) generado con `sharp` en varios tamaños: `favicon.ico`
  multi-resolución, `icon.png`/`apple-icon.png` (detectados automáticamente
  por Next.js) y los `icon-192/512` + `maskable-192/512` que pide el
  manifest para Android/Chrome.
- Service worker propio en `public/sw.js` (sin librerías de terceros, para
  no depender de un plugin no probado sobre Turbopack): no intenta
  precachear los bundles de JS/CSS con hash de cada deploy —eso rompería
  con contenido viejo—, solo garantiza una página `/offline` de respaldo
  cuando falla una navegación sin red, y sirve íconos/manifest desde caché
  una vez descargados una vez.
- Banner de instalación (`PwaInstall`, en el layout raíz): escucha
  `beforeinstallprompt`, se descarta con un click y no vuelve a aparecer
  (se guarda en `localStorage`).
- Verificado con Playwright contra el build de producción: el service
  worker se registra y activa, el manifest resuelve como JSON válido, y
  desconectando la red por completo una navegación a una página no
  cacheada cae correctamente en `/offline` (con el shell de la app
  renderizado, no la pantalla de error del navegador).

**FASE 9** (SEO, Performance, Analytics) — completa:

- **SEO**: imagen Open Graph real generada con `next/og` (`app/opengraph-image.tsx`,
  reemplaza una referencia a `/og-image.png` que nunca existió y que ningún
  código llegó a usar), JSON-LD `Organization` + `WebSite` (con `SearchAction`
  apuntando a `/search?q=`) en el layout raíz, y `lastModified` faltante en
  las rutas de boosts del sitemap.
- **Performance**: `getCurrentProfile()` estaba corriendo dos veces por
  request (una desde `AppShell` para el header/sidebar, otra desde casi
  todas las páginas que necesitan saber si el usuario es dueño/admin del
  contenido) — cada llamada es un round-trip real a Supabase Auth más un
  `select` a `profiles`. Se envolvió con `cache()` de React (el patrón que
  la propia documentación de Next.js recomienda para deduplicar llamadas
  que no pasan por `fetch`), así todas las llamadas dentro de un mismo
  request comparten un solo round-trip. También se agregaron pantallas
  `loading.tsx` (esqueletos) a las páginas de listado y detalle más
  visitadas (mapas, lineups, boosts, jugadas, guías, feed, perfil), para
  que la navegación se sienta instantánea mientras el Server Component
  todavía está pidiendo datos.
- **Analytics**: `@vercel/analytics` y `@vercel/speed-insights` en el layout
  raíz — funcionan automáticamente en el deploy de Vercel sin necesitar
  claves ni configuración adicional (y no rompen nada corriendo local o en
  otro hosting, simplemente no reportan nada).

**FASE 10** (Preparación Play Store / App Store) — completa:

- **Eliminar cuenta** (`/settings`): ambas tiendas exigen que una app con
  registro permita borrar la cuenta desde adentro. Borra el usuario de
  Supabase Auth, lo que en cascada elimina sus datos privados (likes,
  favoritos, comentarios, calificaciones) y deja su contenido publicado
  (lineups, boosts, jugadas) sin autor — mismo comportamiento que ya tenía
  la app para cualquier autor eliminado. Verificado con Postgres local
  simulando la cascada completa antes de escribir el server action.
- **Política de privacidad** (`/privacy`) y **Términos de uso** (`/terms`)
  reales, linkeados desde un footer nuevo — ambas tiendas exigen una URL de
  privacidad para poder publicar. Son un borrador razonable basado en lo
  que la app hace de verdad, no una revisión legal.
- **Capturas reales de la app** en `public/screenshots/` (no mockups),
  referenciadas en el manifest para la instalación enriquecida de
  Android/Chrome.
- **`public/.well-known/assetlinks.json`**: el archivo de Digital Asset
  Links que Android necesita para verificar una Trusted Web Activity, con
  placeholders documentados para completar con la firma real.
- Assets de tienda en `store-assets/` (feature graphic de Play Store,
  ícono de App Store) generados a partir de la misma marca del resto de la
  app.
- `docs/app-stores.md`: guía paso a paso para publicar en ambas tiendas —
  qué ya está listo acá y qué pasos le quedan a quien tenga las cuentas de
  desarrollador reales (Play Console, Apple Developer Program) y el
  hardware necesario (Android SDK, o una Mac con Xcode para iOS), que este
  entorno no puede proveer.

Pendiente (fases siguientes, ver brief): guías conectadas a la base de datos
(hoy siguen siendo mock), colecciones funcionales, búsqueda contra la base
(hoy es en memoria sobre datos mock).

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
