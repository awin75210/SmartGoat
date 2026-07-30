-- Farms registry + IoT devices per farm (CapraCare admin)

create table if not exists farms (
  id text primary key,
  name text not null,
  owner_email text not null,
  location text not null default '',
  goat_count int not null default 0,
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists devices (
  id text primary key,
  farm_id text not null references farms (id) on delete cascade,
  name text not null,
  device_type text not null,
  status text not null default 'online' check (status in ('online', 'offline', 'maintenance')),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists devices_farm_id_idx on devices (farm_id);

alter table farms enable row level security;
alter table devices enable row level security;

-- Admin: full access to farms and devices
create policy farms_admin_all on farms for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy devices_admin_all on devices for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Farm owner: read own farm and its devices
create policy farms_owner_select on farms for select
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role = 'farm_owner'
        and p.farm_id = farms.id
    )
  );

create policy devices_owner_select on devices for select
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role = 'farm_owner'
        and p.farm_id = devices.farm_id
    )
  );

-- Demo farms
insert into farms (id, name, owner_email, location, goat_count, status) values
  ('farm-capracare-001', 'Trang trại CapraCare', 'owner@capracare.vn', 'Lâm Đồng', 13, 'active'),
  ('farm-capracare-002', 'Trại Bình An', 'binhan@capracare.demo', 'Ninh Thuận', 40, 'active')
on conflict (id) do nothing;

insert into devices (id, farm_id, name, device_type, status, last_seen_at) values
  ('dev-temp-a', 'farm-capracare-001', 'Cảm biến nhiệt độ A', 'temperature', 'online', '2025-07-21T08:00:00.000Z'),
  ('dev-hum-b', 'farm-capracare-001', 'Cảm biến độ ẩm B', 'humidity', 'online', '2025-07-21T08:00:00.000Z'),
  ('dev-nh3-b', 'farm-capracare-001', 'Cảm biến NH₃ B', 'ammonia', 'online', '2025-07-21T07:55:00.000Z'),
  ('dev-light-b', 'farm-capracare-001', 'Cảm biến ánh sáng B', 'light', 'offline', '2025-07-18T11:00:00.000Z'),
  ('dev-gateway', 'farm-capracare-001', 'Gateway IoT', 'gateway', 'online', '2025-07-21T08:00:00.000Z'),
  ('dev-fan-b', 'farm-capracare-001', 'Quạt thông gió B', 'actuator', 'maintenance', '2025-07-19T08:00:00.000Z'),
  ('dev2-temp-a', 'farm-capracare-002', 'Cảm biến nhiệt độ A', 'temperature', 'online', '2025-07-21T08:00:00.000Z'),
  ('dev2-hum-a', 'farm-capracare-002', 'Cảm biến độ ẩm A', 'humidity', 'online', '2025-07-21T08:00:00.000Z'),
  ('dev2-nh3-a', 'farm-capracare-002', 'Cảm biến NH₃ A', 'ammonia', 'online', '2025-07-21T07:50:00.000Z'),
  ('dev2-light-a', 'farm-capracare-002', 'Cảm biến ánh sáng A', 'light', 'online', '2025-07-21T08:00:00.000Z'),
  ('dev2-gateway', 'farm-capracare-002', 'Gateway IoT Bình An', 'gateway', 'online', '2025-07-21T08:00:00.000Z'),
  ('dev2-fan-a', 'farm-capracare-002', 'Quạt thông gió A', 'actuator', 'online', '2025-07-21T08:00:00.000Z')
on conflict (id) do nothing;

insert into farm_settings (farm_id, farm_name, timezone, alert_email, notify_push, notify_email, temperature_high_c, ammonia_max_ppm)
values ('farm-capracare-002', 'Trại Bình An', 'Asia/Ho_Chi_Minh', 'binhan@capracare.demo', true, true, 30, 12)
on conflict (farm_id) do nothing;
