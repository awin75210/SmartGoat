-- Fix farm_settings RLS when profiles.farm_id is null (demo farm owners)
-- Requires farm_settings — run 20250730100000_farm_settings.sql first,
-- or use supabase/setup-farm-settings.sql (all-in-one)

create table if not exists farm_settings (
  farm_id text primary key,
  farm_name text not null,
  timezone text not null default 'Asia/Ho_Chi_Minh',
  alert_email text not null,
  notify_push boolean not null default true,
  notify_email boolean not null default true,
  temperature_high_c numeric(5, 2) not null default 28,
  ammonia_max_ppm numeric(5, 2) not null default 10,
  updated_at timestamptz not null default now()
);

alter table farm_settings enable row level security;

drop policy if exists farm_settings_owner_select on farm_settings;
drop policy if exists farm_settings_owner_insert on farm_settings;
drop policy if exists farm_settings_owner_update on farm_settings;

create policy farm_settings_owner_select on farm_settings for select
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role = 'farm_owner'
        and (
          p.farm_id = farm_settings.farm_id
          or (p.farm_id is null and farm_settings.farm_id = 'farm-capracare-001')
        )
    )
  );

create policy farm_settings_owner_insert on farm_settings for insert
  with check (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role = 'farm_owner'
        and (
          p.farm_id = farm_settings.farm_id
          or (p.farm_id is null and farm_settings.farm_id = 'farm-capracare-001')
        )
    )
  );

create policy farm_settings_owner_update on farm_settings for update
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role = 'farm_owner'
        and (
          p.farm_id = farm_settings.farm_id
          or (p.farm_id is null and farm_settings.farm_id = 'farm-capracare-001')
        )
    )
  )
  with check (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role = 'farm_owner'
        and (
          p.farm_id = farm_settings.farm_id
          or (p.farm_id is null and farm_settings.farm_id = 'farm-capracare-001')
        )
    )
  );
