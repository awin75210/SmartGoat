-- CapraCare: thiết lập farm_settings + RLS + email notify log
-- Chạy TOÀN BỘ file này trong Supabase → SQL Editor (một lần)
-- Yêu cầu: đã chạy migration profiles (20250728100000_ai_chatbot.sql)

-- 1) Bảng cài đặt trại
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

-- 2) RLS — chủ trại (kể cả farm_id null → trại demo)
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

-- 3) Dữ liệu mặc định
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
  'farm-capracare-002',
  'Trại Bình An',
  'Asia/Ho_Chi_Minh',
  'binhan@capracare.demo',
  true,
  true,
  30,
  12
) on conflict (farm_id) do nothing;

-- 4) Log gửi email cảnh báo (giới hạn tần suất)
create table if not exists farm_email_notify_log (
  farm_id text not null references farm_settings (farm_id) on delete cascade,
  notify_key text not null check (
    notify_key in ('settings_saved', 'test', 'temperature_high', 'ammonia_high')
  ),
  last_sent_at timestamptz not null default now(),
  primary key (farm_id, notify_key)
);

alter table farm_email_notify_log enable row level security;

drop policy if exists farm_email_notify_owner_all on farm_email_notify_log;

create policy farm_email_notify_owner_all on farm_email_notify_log for all
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role = 'farm_owner'
        and (
          p.farm_id = farm_email_notify_log.farm_id
          or (p.farm_id is null and farm_email_notify_log.farm_id = 'farm-capracare-001')
        )
    )
  )
  with check (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role = 'farm_owner'
        and (
          p.farm_id = farm_email_notify_log.farm_id
          or (p.farm_id is null and farm_email_notify_log.farm_id = 'farm-capracare-001')
        )
    )
  );
