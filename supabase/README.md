# Supabase — CS2 Academy

## 1. Crear el proyecto

1. Crear un proyecto nuevo en https://supabase.com/dashboard.
2. Copiar `Project URL` y `anon public` key al `.env.local` del proyecto Next.js
   (ver `.env.example` en la raíz del repo).

## 2. Ejecutar las migraciones

En el **SQL Editor** de Supabase, ejecutar en este orden:

1. `migrations/0001_init.sql` — esquema completo: tablas, enums, índices, triggers y
   políticas de Row Level Security.
2. `seed/0002_seed.sql` — datos de demostración (mapas, algunos lineups, boosts,
   jugadas y una guía), todos marcados `is_demo = true` y `verified = false`.

Si preferís la CLI de Supabase:

```bash
supabase link --project-ref <project-ref>
supabase db push
psql "$(supabase status -o env | grep DB_URL | cut -d= -f2)" -f supabase/seed/0002_seed.sql
```

## 3. Variables de entorno

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # solo servidor, nunca en el bundle de cliente
```

## 4. Modelo de seguridad (resumen)

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

## 5. Regenerar tipos TypeScript

`src/types/database.ts` está escrito a mano como stand-in. Cuando el proyecto
esté provisionado, reemplazarlo con:

```bash
npx supabase gen types typescript --project-id <project-id> > src/types/database.ts
```
