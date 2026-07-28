# Supabase migration guide (CapraCare)

CapraCare currently uses **seed repositories** (`Seed*Repository`) with in-memory or static data. Production should move to **Supabase Postgres** without changing page or component contracts.

## Architecture (keep unchanged)

```
page → service → repository → database
Server Action → Zod → service → repository → revalidatePath
```

- **Domain types** stay camelCase in `features/*/types`.
- **DB rows** stay snake_case; keep mappers in `features/*/mappers`.
- **Farm scope**: all farm-owned queries filter by `farm_id = 'farm-capracare-001'` (or session `farmId`).
- **Do not** import Supabase client in React components or pages.

## Steps

### 1. Add Supabase client (server-only)

Create `lib/supabase/server-client.ts` using `@supabase/ssr` and service role or anon + RLS (prefer RLS).

### 2. SQL schema (snake_case)

Map each seed file to tables (users, goats, alerts, iot_metrics, farm_settings, farms, devices, handbook_articles, …).

### 3. Implement `Supabase*Repository` classes

Implement each `*Repository` interface; map with existing mappers; switch in `create-*.repository.ts` via `DATA_SOURCE=supabase`.

### 4. RLS policies

Farm owners: row `farm_id` matches JWT claim. Admins: separate role policies.

### 5. Server actions

Keep Zod + service + `revalidatePath` unchanged.

### 6. Stateful seed → DB

Alert resolve → `UPDATE alerts SET resolved_at`. Settings → `UPDATE farm_settings`. AI → Edge Function or LLM API.

### 7. Fixed hydration dates

Backfill charts with **2025-07-15 → 2025-07-21** and `SEED_REFERENCE_ISO` (`2025-07-21T08:00:00.000Z`).

### 8. Checklist

- Migrations in `supabase/migrations/`
- Generated TypeScript types aligned with `*Row` types
- Factory switch per repository
- No client-side Supabase for farm data
- Strict TypeScript, no `any`
