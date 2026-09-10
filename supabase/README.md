# Supabase — SmokeAR

## 1. Crear el proyecto

1. Crear un proyecto nuevo en https://supabase.com/dashboard.
2. Copiar `Project URL` y `anon public` key al `.env.local` del proyecto Next.js
   (ver `.env.example` en la raíz del repo).

## 2. Configurar las URLs de autenticación (Authentication → URL Configuration)

Este paso es obligatorio incluso si solo usás email/password — sin él, los
links de confirmación de email fallan con `{"error":"requested path is
invalid"}` porque Supabase rechaza cualquier redirect que no esté en esta
lista.

En **Authentication → URL Configuration**:

- **Site URL**: `https://smokear.vercel.app`
- **Redirect URLs**: agregá las cuatro, una por línea:
  - `https://smokear.vercel.app/auth/callback`
  - `https://smokear.vercel.app/auth/steam/callback`
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/auth/steam/callback`

Las de `localhost` son para cuando corrés `npm run dev` en tu máquina — no se
pisan con las de producción, Supabase acepta múltiples URLs en la lista.

La app ya manda `emailRedirectTo`/`redirectTo` apuntando a `/auth/callback`
en cada flujo (signup, login con Google, magic link de Steam) — pero
Supabase igual exige que esa URL exacta esté en la lista, o la rechaza antes
de que la app la vea.

## 3. Ejecutar las migraciones

Los archivos viven en `supabase/migrations/` y se corren en orden numérico:

1. `0001_init.sql` — esquema completo: tablas, enums, índices, triggers y
   políticas de Row Level Security.
2. `0002_seed.sql` — datos de demostración (mapas, algunos lineups, boosts,
   jugadas y una guía), todos marcados `is_demo = true` y `verified = false`.
3. `0003_steam_auth.sql` — columna `steam_id` en `profiles`, usada para
   reconocer a un jugador que vuelve a entrar con Steam.
4. `0004_lineup_rpc.sql` — función `create_lineup_with_steps(payload jsonb)`
   que inserta un lineup + su video + sus pasos en una sola transacción
   (`security invoker`: corre con los permisos de quien la llama, las
   políticas RLS existentes siguen aplicando tal cual). La usa el formulario
   de `/lineups/new` — si algo falla a mitad de camino, no queda un lineup
   a medio crear.
5. `0005_gamification.sql` — 5 achievements semilla + triggers `after
   insert` en `lineups`/`plays`/`boosts` que otorgan XP y achievements
   automáticamente. Deliberadamente **no** es un RPC llamable desde el
   cliente (`security definer` pero solo invocado por el trigger) — así
   nadie puede pedir XP directo sin publicar contenido real.
6. `0006_moderation.sql` — bans (`profiles.banned_at`), y dos correcciones
   de seguridad sobre el diseño RLS original de la fase 1. Vale la pena
   leerlas porque son gotchas reales de Postgres, no bugs de la app:
   - **RLS es por fila, no por columna.** La política
     `profiles_update_own_or_admin` (`using (auth.uid() = id or
     is_admin(...))`) deja que cualquiera actualice su propia fila — pero
     sin un `with check` explícito, Postgres reusa esa misma condición
     para validar el resultado, y esa condición no dice nada sobre qué
     columnas cambiaron. Un usuario común podía hacer
     `update profiles set role = 'admin' where id = auth.uid()` y
     Postgres lo permitía. Lo mismo pasaba en `lineups`/`boosts`/`plays`:
     el autor podía revertir un `status = 'removed'` puesto por un
     moderador, o (en lineups) poner `verified = true` él mismo. La
     corrección son triggers `before update` (`guard_profile_sensitive_columns`,
     `guard_content_status_column`, `guard_lineup_moderation_columns`) que
     inspeccionan `NEW`/`OLD` y rechazan el cambio a esas columnas
     específicas salvo que quien lo hace ya sea admin/moderador — o que no
     haya sesión de usuario en absoluto (`auth.uid() is null`), que es
     exactamente el caso del SQL Editor o el service role, y es cómo se
     bootstrapea la primera cuenta admin del proyecto.
   - **La política de `select` también se aplica al resultado de un
     `update`.** `lineups_select_public` ocultaba filas con
     `status = 'removed'` — razonable para que el público no las vea. Pero
     eso significaba que ni un admin podía escribir `status = 'removed'`:
     Postgres revisa esa misma política contra la fila *después* del
     update, y si el nuevo valor no pasa el `select`, rechaza el `update`
     entero con "new row violates row-level security policy", sin importar
     que la política de `update` sí lo permitiera. Se corrigió agregando
     `or is_admin(auth.uid())` a esas políticas de `select` — que de paso
     es lo que necesita un admin para poder revisar contenido eliminado.

   Todo esto se verificó localmente con una instancia de Postgres +
   simulación de RLS antes de escribirlo acá: un moderador no puede
   auto-promoverse ni banear a otros, un admin real sí puede, y una cuenta
   suspendida pierde la posibilidad de publicar pero no de leer.
7. `0007_search.sql` — búsqueda de texto completo. Agrega una columna
   `search_vector tsvector generated always as (...) stored` (Postgres la
   mantiene sola en cada insert/update) más un índice GIN en `maps`,
   `lineups`, `boosts`, `plays` y `guides`, y un RPC `search_content(query,
   result_limit)` que las une con `websearch_to_tsquery('spanish', ...)` y
   ordena por `ts_rank`. `security invoker`: corre con los permisos de
   quien llama, así que las políticas de RLS ya existentes (contenido
   `removed` invisible salvo para admins, etc.) deciden qué aparece en los
   resultados sin ninguna lógica nueva que mantener sincronizada — los
   `and status <> 'removed'`/`and active` explícitos dentro de la función
   son redundantes con RLS a propósito (mismo criterio de "defensa en
   profundidad" que los filtros que se agregaron en la capa de servicios
   cuando los admins pasaron a poder ver contenido eliminado).
8. `0008_lineups_content.sql` — 24 lineups reales más (3 por mapa, en los 8
   mapas), a diferencia del seed original marcados `is_demo = false,
   verified = true`: son posiciones reales que cualquiera puede usar, no
   datos de relleno.
9. `0009_search_i18n.sql` — al agregar inglés/francés/portugués (ver
   `README.md` de la raíz), quedó claro que `search_content()` armaba texto
   en español directo en SQL (`'Lineup · ' || mp.slug` como "subtítulo") —
   imposible de traducir desde la UI. Esta migración hace `drop function` +
   recrea `search_content` con un shape de retorno distinto
   (`content_type, title, slug, map_slug` en vez de `..., subtitle, slug`):
   ahora devuelve el dato crudo (`map_slug`) y es la UI la que arma el texto
   final en el idioma del visitante (`t(type)` + `mapSlug`, ver
   `quick-search.tsx`/`search/page.tsx`). `drop function` es necesario
   porque Postgres no permite `create or replace function` cuando cambia el
   tipo de retorno.
10. `0010_lineups_expansion.sql` — 48 lineups reales más (6 por mapa, en los
    8 mapas), llevando el total de lineups reales/verificados a 72 (~9 por
    mapa): cubre el bombsite y los tipos de granada (flash/he/decoy) que
    `0008` no había tocado. Mismas reglas que `0008`: `is_demo = false`,
    `verified = true`, sin `video_id`. Además, cada lineup nuevo trae una
    fila en `lineup_media` apuntando a un diagrama SVG propio bajo
    `public/lineup-diagrams/` (posición de tiro → objetivo, generado para
    este proyecto) — no una captura de pantalla de otro sitio. Esa
    distinción importa: se pidió específicamente scrapear capturas reales
    de páginas de lineups de terceros, y se descartó porque esas imágenes
    son contenido ajeno bajo términos que casi nunca permiten rehostearlo,
    el mismo criterio que ya aplicaba la tabla `videos` (embeds de
    YouTube, nunca un archivo bajado y alojado acá — ver el comentario en
    `0001_init.sql`).
11. `0011_lineup_diagrams_backfill.sql` — agrega la misma fila de
    `lineup_media` (diagrama SVG propio) a los 24 lineups de `0008` que
    quedaron sin una cuando se escribió `0010`, para que los 72 lineups
    reales tengan diagrama, no solo los 48 más nuevos.
12. `0012_lineup_map_pins.sql` — agrega `lineups.pin_x`/`pin_y` (numeric
    0-100, mismo criterio que `map_zones.x/y`) para poder mostrar cada
    lineup como un pin sobre el radar del mapa, y `maps.radar_url_lower`
    para Nuke (el único mapa con dos niveles verticales, y por lo tanto
    dos radares). También actualiza `create_lineup_with_steps` (`create or
    replace`, mismo tipo de retorno que en `0004`, no hace falta `drop`)
    para aceptar `pin_x`/`pin_y` opcionales en el payload. Ambas columnas
    son nullable a propósito: los 75 lineups que ya existían no tienen una
    posición real conocida, así que no se les inventó ninguna — quedan sin
    pin hasta que alguien los ubique a mano en el mapa (ver el flujo de
    alta por click en `/maps/[slug]`, sección "Lineups sobre el radar" del
    `README.md` de la raíz).
13. `0013_radar_images.sql` — apunta `maps.radar_url`/`radar_url_lower` a
    los radares reales que el usuario subió directo al repo en
    `public/radars/` (no scrapeados de otro sitio — el mismo criterio de
    sourcing que el resto de la media de la app). Cubre 7 de los 8 mapas.
14. `0014_overpass_radar.sql` — completa el octavo (Overpass), subido en
    formato WebP en vez de PNG (`public/radars/overpass.webp`) — los 8
    mapas ya tienen radar real en el visor.

En el **SQL Editor** de Supabase: abrí cada archivo en el repo, copiá el
contenido completo, pegalo en una query nueva y ejecutalo — en ese orden.

Si preferís la CLI de Supabase, un solo comando aplica todo:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

## 4. Variables de entorno

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # solo servidor, nunca en el bundle de cliente
```

## 5. Modelo de seguridad (resumen)

- RLS está **habilitado en todas las tablas**.
- Contenido público (`maps`, `map_zones`, `lineups`, `guides`, `boosts`, `plays`,
  `tags`, `likes`, `comments`, `ratings`...) es legible por cualquiera (rol `anon`
  incluido) mientras no esté `deleted_at` o en estado `removed`.
- Un usuario autenticado solo puede `INSERT`/`UPDATE`/`DELETE` filas donde
  `author_id` / `user_id` sea su propio `auth.uid()`.
- `is_admin(uid)` es una función `security definer` que centraliza el chequeo de
  rol (`profiles.role in ('admin','moderator')`) para evitar recursión en las
  políticas.
- La `service_role` key nunca se usa desde el navegador — solo desde Server
  Actions/Route Handlers vía `src/lib/supabase/admin.ts`, marcado `server-only`.

## 6. Proveedores de autenticación

- **Email/password**: funciona una vez hecho el paso 2. Si querés que las
  cuentas queden activas sin esperar el email de confirmación mientras estás
  en desarrollo, desactivá "Confirm email" en Authentication → Providers →
  Email (así te salteás el link de confirmación por completo).
- **Google**: Authentication → Providers → Google. Necesitás un Client ID/Secret
  de OAuth 2.0 de Google Cloud Console, con el redirect URI que Supabase te
  muestra ahí mismo (`https://<project-ref>.supabase.co/auth/v1/callback`). La
  app ya llama a `signInWithOAuth({ provider: "google" })` y redirige a
  `/auth/callback`, que intercambia el código por una sesión.
- **Steam**: Steam usa OpenID 2.0, no OAuth — Supabase no tiene un proveedor
  nativo para esto. La app implementa el handshake OpenID directamente
  (`/auth/steam` → Steam → `/auth/steam/callback`), verifica la respuesta
  contra Steam (`check_authentication`, nunca confía en el `claimed_id` sin
  verificar) y crea/reconoce al usuario con un email sintético no-entregable
  (`steam-<id>@steam.users.smokear.internal`) usando la Admin API
  (`generateLink` + `verifyOtp`) para abrir la sesión sin contraseña. Opcional:
  `STEAM_WEB_API_KEY` (https://steamcommunity.com/dev/apikey) para traer el
  nombre y avatar de Steam en el primer login.

## 7. Regenerar tipos TypeScript

`src/types/database.ts` está escrito a mano como stand-in. Cuando el proyecto
esté provisionado, reemplazarlo con:

```bash
npx supabase gen types typescript --project-id <project-id> > src/types/database.ts
```
