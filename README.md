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

**Búsqueda real** — completa:

- Búsqueda de texto completo de Postgres (`tsvector` + `websearch_to_tsquery`,
  `supabase/migrations/0007_search.sql`) sobre mapas, lineups, boosts,
  jugadas y guías, ordenada por relevancia (`ts_rank`) — reemplaza la
  búsqueda en memoria sobre datos mock que existía desde la Fase 1.
- Un único RPC (`search_content`, `security invoker`) unifica los cinco
  tipos de contenido; al correr con los permisos de quien llama, las
  políticas RLS existentes deciden qué es visible sin lógica duplicada —
  contenido eliminado o de una cuenta suspendida no aparece en resultados
  por la misma razón que no aparece en ningún otro lado.
- El panel de búsqueda rápida (Ctrl/Cmd+K) ahora llama a la base con
  debounce (200ms) vía Server Action en vez de filtrar un array en el
  cliente; `/search` hace lo mismo del lado del servidor.
- Sigue cayendo a la búsqueda en memoria si Supabase no está configurado,
  mismo patrón de fallback que el resto de los servicios.

**FASE 11** (Idiomas, contenido real de lineups, marca) — completa:

- **Internacionalización completa** con `next-intl`: interfaz entera (no solo
  algunas pantallas) disponible en español (default), inglés, francés y
  portugués, con URLs por idioma (`/es/lineups`, `/en/lineups`, `/fr/lineups`,
  `/pt/lineups`) en vez de un selector invisible por cookie — así cada idioma
  es indexable y compartible por separado.
  - Todo `src/app` vive ahora bajo `src/app/[locale]/`, salvo los archivos
    singleton de Next.js que nunca deben llevar prefijo de idioma
    (`manifest.ts`, `robots.ts`, `sitemap.ts`, `opengraph-image.tsx`,
    `favicon.ico`, `icon.png`, `apple-icon.png`) y las rutas de callback de
    OAuth (`auth/*`), que son URLs fijas registradas en Google/Steam.
  - `src/i18n/routing.ts` + `src/i18n/navigation.ts` exportan versiones
    conscientes del idioma de `Link`, `redirect`, `usePathname` y `useRouter`
    que reemplazan a las de `next/link`/`next/navigation` en toda la app.
  - `src/proxy.ts` encadena el middleware de `next-intl` con el refresco de
    sesión de Supabase en el mismo request — ninguno de los dos pisa las
    cookies del otro.
  - Diccionarios en `messages/{es,en,fr,pt}.json`, con las mismas 518 claves
    en los cuatro archivos (verificado con un script, no a ojo).
  - La función de búsqueda de Postgres (`search_content()`) ya no arma texto
    en español directo en SQL (`'Lineup · ' || slug`) — ahora devuelve datos
    crudos (`map_slug`) y el texto final se arma en la UI en el idioma del
    visitante (`supabase/migrations/0009_search_i18n.sql`).
- **Lineups reales y publicados**: 24 lineups nuevos (3 por mapa en los 8
  mapas competitivos), marcados como `verified` y no-demo — contenido
  pensado para funcionar de verdad, no placeholders (`supabase/migrations/0008_lineups_content.sql`).
- **Logo**: se armó una versión más elaborada de la marca "S" naranja que ya
  usaban la sidebar y los íconos (`src/components/layout/logo.tsx`), ahora
  también protagonista del hero de la home.
- **Headline de la home**: reemplaza "Aprendé Counter-Strike 2" (genérico)
  por un mensaje centrado en lo que la comunidad sube — "Lineups de la
  comunidad" en español, con textos equivalentes por idioma
  (`home.heroPrefix`/`home.heroHighlight` en cada diccionario).
- Selector de idioma (`src/components/layout/language-switcher.tsx`) en el
  header, junto al buscador rápido.

**FASE 12** (Cobertura de lineups en los 8 mapas + diagramas) — completa:

- **72 lineups reales y verificados** en total, repartidos ~9 por mapa en
  los 8 mapas (antes eran 24, 3 por mapa): `0010_lineups_expansion.sql`
  agrega 48 más cubriendo el otro bombsite, más tipos de granada (flash,
  HE, decoy — antes solo smoke/molotov) y más situaciones (defensa,
  retake, default), no solo ejecuciones T-side.
- **Diagramas propios, no capturas de otros sitios**: se pidió agregar
  capturas de pantalla reales sacadas de páginas de lineups externas, y
  eso se descartó a propósito — esas imágenes son trabajo de otra persona
  (composición, overlays, marcas) publicado bajo términos que casi nunca
  permiten volver a alojarlo en otra web, exactamente la misma razón por
  la que los videos de esta app son siempre un embed de YouTube y nunca un
  archivo descargado (ver el comentario de la tabla `videos` en
  `0001_init.sql`). En su lugar, cada uno de los 72 lineups reales tiene un
  diagrama SVG propio (posición de tiro → punto de impacto, con badges de
  lado/granada) generado para este proyecto — contenido 100% original, sin
  riesgo de copyright — servido desde `public/lineup-diagrams/` y wireado
  vía la tabla `lineup_media` (`0010_lineups_expansion.sql` para los 48
  nuevos, `0011_lineup_diagrams_backfill.sql` para los 24 que ya existían
  de la Fase anterior). Se ve en la página de detalle de cada lineup,
  debajo del video.

**FASE 13** (Lineups sobre el radar del mapa, estilo CSNADES.gg) — completa:

- **Visor interactivo por mapa** (`src/components/maps/map-lineup-viewer.tsx`,
  tab "Lineups" de `/maps/[slug]`): el radar del mapa de fondo con un pin de
  color por lineup (según tipo de granada), filtro por granada y por lado
  con contador, y selector de piso para Nuke (el único mapa con dos
  niveles). Click en un pin abre un popover con el resumen y link al
  lineup completo.
- **Alta por click para admins/moderadores**: si quien mira el mapa es
  admin o moderador, tocar un punto vacío del radar lleva a
  `/lineups/new` con el mapa y la posición (`pinX`/`pinY`, 0-100% de la
  imagen) precargados — el formulario existente hace el resto, ahora
  guardando esa posición junto con el resto del lineup
  (`create_lineup_with_steps` RPC actualizado en
  `0012_lineup_map_pins.sql`, columnas `lineups.pin_x`/`pin_y`).
- **Sobre las imágenes de radar**: se pidió usar el radar real del juego de
  fondo (no un diagrama propio como en la Fase 12) — a diferencia de
  scrapear capturas de un sitio de terceros, acá el usuario provee sus
  propios archivos de radar, así que la responsabilidad de esa fuente es
  suya. Los 8 mapas ya tienen su radar real cargado en `public/radars/`
  (wireados en `supabase/migrations/0013_radar_images.sql` y
  `0014_overpass_radar.sql`): Mirage, Inferno, Nuke (dos pisos), Ancient,
  Anubis, Vertigo (dos pisos), Dust II y Overpass.
- Los 75 lineups existentes (72 reales + 3 demo) no tienen posición
  todavía — `pin_x`/`pin_y` son nullable a propósito, nadie inventó
  coordenadas para contenido que no las tenía. Se van completando con el
  flujo de alta por click de acá en adelante.
- **`/lineups` ya no lista todos los lineups de entrada**: mostraba una
  grilla plana con filtros por mapa/lado/granada, lo cual dejaba de tener
  sentido una vez que el visor de arriba ya resuelve eso por mapa. Ahora
  `/lineups` es un selector de mapas (mismas cards que `/maps`) — elegís
  un mapa y caés directo en su tab "Lineups" (`/maps/[slug]?tab=lineups`).
  Un link viejo con `?map=slug` sigue funcionando: redirige al mismo
  lugar en vez de romperse. El componente `LineupFilters` (grilla plana)
  quedó sin uso y se eliminó.
- **Dos bugs de idioma corregidos**: el selector de idioma (header) se
  cerraba solo al mover el mouse del botón hacia abajo para elegir una
  opción — dependía de `onMouseLeave` en un contenedor cuyo tamaño de
  layout no incluye al menú desplegado (es `absolute`), así que cualquier
  micro-gap entre el botón y el menú disparaba el cierre antes del click.
  Se cambió a detección de click-afuera (+ Escape), que es el patrón
  correcto para este tipo de dropdown. Además, las descripciones de los
  8 mapas quedaban siempre en español sin importar el idioma elegido,
  porque venían directo de la base (`maps.description`, contenido único
  por fila) en vez de la capa de traducción — se agregó un namespace
  `maps.catalog` en `messages/*.json` con la descripción de cada mapa en
  los 4 idiomas, y `MapCard`/`/maps/[slug]` la usan en vez del valor
  crudo de la base. Sigue pendiente el mismo tratamiento para contenido
  más voluminoso (instrucciones de lineups, descripciones de boosts/jugadas),
  que hoy es texto único en español por ser contenido de la comunidad, no
  interfaz — ver "Pendiente" más abajo.

Pendiente (fuera de las fases numeradas, ver brief): guías conectadas a la
base de datos (hoy siguen siendo mock), colecciones funcionales, y traducir
el contenido en sí (instrucciones de lineups, descripciones de boosts y
jugadas) a los 4 idiomas — hoy solo la interfaz y el catálogo de mapas
están traducidos; ese contenido sigue en español único por fila en la
base, como el resto del contenido subido por la comunidad.

**FASE 14** (Rediseño total de UI/UX — primera tanda) — completa:

Replanteo de la experiencia visual y de descubrimiento de contenido: se
reemplaza el patrón genérico "sidebar + header + buscador + grilla de cards
idénticas" por composición editorial (rails horizontales, un feature grande
+ varios secundarios, tamaños de card no uniformes) en las pantallas de
mayor tráfico. Todo el contenido dinámico (contadores, badges "nuevo",
porcentajes de "funcionó") sigue viniendo de Supabase/mock reales — nada
inventado.

- **Design tokens** (`src/app/globals.css`): se mantienen los nombres de
  variables existentes (para no tocar cientos de referencias) y se agregan
  `--background-surface-2`, `--background-overlay`, `--brand-glow`, más
  utilidades nuevas: `.text-eyebrow` (label editorial), `.scroll-rail`
  (contenedor con scroll-snap horizontal sin scrollbar visible),
  `.bg-hero-mesh` (fondo del hero con gradientes radiales, sin imágenes
  stock) y `.animate-scale-in` (respeta `prefers-reduced-motion`).
- **Shell rediseñado**: sidebar agrupada por secciones (Descubrir /
  Comunidad / Vos) con indicador de activo tipo barra lateral en vez de
  pastilla llena; bottom nav móvil con un FAB flotante de subida rápida
  para usuarios logueados; header más minimal con el buscador rápido
  centrado.
- **Búsqueda rápida** (`quick-search.tsx`): ahora agrupa resultados por
  tipo (lineup/mapa/boost/jugada/guía) y recuerda búsquedas recientes
  (`localStorage`). El mismo componente soporta una variante "hero" (campo
  grande integrado en el home) y una "compact" (pastilla del header).
- **Componentes nuevos**: `ContentRail` (eyebrow + título + link "ver todo"
  + fila con scroll-snap) como reemplazo del patrón de grilla estática para
  contenido editorial, y `StatPill` (chip de acción rápida con contador
  real por tipo de granada).
- **Home**: hero con búsqueda integrada, accesos rápidos por tipo de
  granada con contadores reales, descubrimiento de mapas con stats al
  hover, sección "Populares ahora" (1 destacado grande + 3 secundarios) y
  rails de tendencias/jugadas/guías.
- **`/maps`**: selector visual grande (no grilla plana) con el radar de
  cada mapa de fondo y contadores reales de lineups/boosts/guías.
- **`/lineups`**: hero de búsqueda + selector de mapas con contador total
  real, en vez de la grilla plana anterior.
- **`LineupCard`**: jerarquía visual clara (granada, mapa, lado, dificultad,
  verificado, rating, % funcionó, autor) sin amontonar todo con el mismo
  peso.
- **Detalle de lineup + modo práctica**: nuevo componente
  `LineupDetailBody` separa los pasos ("Cómo tirarlo") del resto
  (tags/rating/comentarios). Un botón activa el "Modo práctica": los pasos
  se ven en grande (`LineupStepViewer` con prop `big`) y el resto de la
  página (tags, rating, comentarios) se oculta para que la pantalla se
  sienta como una herramienta de entrenamiento, no como un artículo.

Pendiente para la siguiente tanda del rediseño (ver brief, fuera de esta
fase): Boosts ("encontrá algo inesperado"), Plays como feed de clips con
autoplay al hover, Guías editoriales (destacada + rieles por categoría),
Feed comunitario con sidebar de recomendados, overlay de búsqueda global
más profundo, Perfil + descubrimiento de creadores, pulido específico de
mobile, y el modo quiz de calls.

**FASE 15** (Sacar todos los datos falsos) — completa:

Hasta esta fase, cuando Supabase no estaba configurado o una consulta
fallaba, los servicios de lineups/boosts/plays/búsqueda caían a datos de
demostración embebidos en el código (`src/lib/mock/lineups.ts`,
`boosts.ts`, `plays.ts`) — así que la app podía mostrar "72 lineups", un
% de "funcionó" o un feed con actividad aunque la base real todavía no
tuviera nada cargado. Se sacó esa ilusión por completo:

- `lineups.service.ts` / `boosts.service.ts` / `plays.service.ts`: ya no
  tienen fallback a datos de mentira. Sin Supabase configurado, o si la
  consulta falla, devuelven lista vacía (o `null` en las funciones de
  detalle) — el estado real (hoy, vacío) se muestra tal cual, con los
  `EmptyState` que cada pantalla ya tenía.
- `search.service.ts`: el buscador solo mantiene un fallback offline para
  mapas (son 8 mapas reales del juego, no contenido inventado). Ya no
  devuelve resultados de lineups/boosts/plays/guías cuando no hay
  conexión a Supabase.
- **Guías**: todavía no tienen tabla propia en la base (siguen siendo un
  array en código, ver "Pendiente" arriba) — se vació ese array
  (`src/lib/mock/guides.ts`) en vez de dejar una guía de ejemplo
  ("Mirage desde cero") que nadie publicó.
- **Perfiles de demostración**: se sacó el fallback de `demo_coach` /
  `demo_player` (perfiles con nivel/XP/stats inventados) de
  `profiles.service.ts` — `/profile/[username]` ahora solo muestra
  cuentas reales de Supabase; un username que no existe da 404.
- Se borraron los archivos de datos mock que quedaron sin ningún uso
  (`src/lib/mock/lineups.ts`, `boosts.ts`, `plays.ts`, `feed.ts`,
  `profiles.ts`) y el tipo `PublicProfile` que solo existía para ellos.
- El Home (rieles de "Tendencia", "Plays" y "Guías") ya no renderiza una
  sección editorial vacía cuando no hay contenido de ese tipo — cada
  riel se oculta si no tiene nada real para mostrar.

El contenido de ejemplo (los 72 lineups con diagramas, etc.) sigue
existiendo como migraciones SQL (`0002_seed.sql`, `0008_lineups_content.sql`,
`0010_lineups_expansion.sql`) para quien quiera poblar una base de
desarrollo — lo que se eliminó es que la interfaz lo mostrara como si
fuera contenido real ya publicado cuando la base de producción está vacía.

## Estructura del proyecto

```
src/
  app/
    [locale]/     Rutas con idioma (App Router). Cada carpeta = una URL de
                   la sección 29, ahora prefijada por /es, /en, /fr o /pt.
    (root)        Archivos singleton sin prefijo de idioma: manifest.ts,
                   robots.ts, sitemap.ts, opengraph-image.tsx, íconos,
                   y los route handlers de auth/* (callbacks de OAuth).
  i18n/           routing.ts (idiomas soportados), navigation.ts (Link,
                   redirect, usePathname, useRouter conscientes del idioma),
                   request.ts (carga el diccionario del idioma activo).
  components/
    ui/           Design system genérico (Button, Card, Badge, Tabs...).
    layout/       Sidebar, bottom nav, header, quick search, logo,
                   selector de idioma, secciones.
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
    labels/       Listas de valores de cada enum (sin texto) — las
                   etiquetas se resuelven con `useTranslations` en cada
                   componente, para que salgan en el idioma del visitante.
    mock/         Datos de demostración usados hasta que la DB esté poblada.
    utils/        Helpers (cn, slugify, formato de fechas/números, base URL).
    site-config.ts Navegación y metadata global del sitio.
  services/       Capa de acceso a datos (mapas, lineups, perfiles, búsqueda).
                   Punto de reemplazo cuando se conecten el resto de las tablas.
  types/          Tipos de dominio (`content.ts`) y de base de datos (`database.ts`).
  proxy.ts        Reemplazo de middleware.ts en Next 16 — encadena el
                   routing de idioma de next-intl con el refresco de sesión
                   de Supabase.
messages/
  es.json en.json fr.json pt.json
                   Diccionarios de traducción, mismas 518 claves en los 4.
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
