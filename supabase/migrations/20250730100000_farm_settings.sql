-- Farm settings: alert thresholds and notification preferences (CapraCare)

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

-- Farm owners: read/write settings for their farm
create policy farm_settings_owner_select on farm_settings for select
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role = 'farm_owner'
        and p.farm_id = farm_settings.farm_id
    )
  );

create policy farm_settings_owner_insert on farm_settings for insert
  with check (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role = 'farm_owner'
        and p.farm_id = farm_settings.farm_id
    )
  );

create policy farm_settings_owner_update on farm_settings for update
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role = 'farm_owner'
        and p.farm_id = farm_settings.farm_id
    )
  )
  with check (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role = 'farm_owner'
        and p.farm_id = farm_settings.farm_id
    )
  );

-- Default demo farm settings
insert into farm_settings (
  farm_id,
  farm_name,
  timezone,
  alert_email,
  notify_push,
  notify_email,
  temperature_high_c,
  ammonia_max_ppm
) values (
  'farm-capracare-001',
  'Trang trại CapraCare',
  'Asia/Ho_Chi_Minh',
  'owner@capracare.demo',
  true,
  true,
  28,
  10
) on conflict (farm_id) do nothing;
