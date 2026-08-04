-- IoT telemetry, actuator states, device commands (ESP32 integration)

create table if not exists iot_sensor_readings (
  id uuid primary key default gen_random_uuid(),
  farm_id text not null references farms (id) on delete cascade,
  device_id text not null references devices (id) on delete cascade,
  metric_key text not null check (
    metric_key in (
      'temperature', 'humidity', 'toxic_gas', 'feed_level', 'rain', 'light', 'ammonia'
    )
  ),
  value numeric not null,
  unit text not null default '',
  recorded_at timestamptz not null default now()
);

create index if not exists iot_sensor_readings_farm_metric_idx
  on iot_sensor_readings (farm_id, metric_key, recorded_at desc);

create table if not exists iot_actuator_states (
  farm_id text not null references farms (id) on delete cascade,
  actuator_key text not null,
  name text not null,
  gpio int,
  device_type text not null check (device_type in ('relay', 'servo')),
  is_on boolean not null default false,
  position_pct int check (position_pct is null or (position_pct >= 0 and position_pct <= 100)),
  status text not null default 'offline' check (status in ('online', 'offline', 'maintenance')),
  updated_at timestamptz not null default now(),
  primary key (farm_id, actuator_key)
);

create table if not exists iot_device_commands (
  id uuid primary key default gen_random_uuid(),
  farm_id text not null references farms (id) on delete cascade,
  device_id text not null references devices (id) on delete cascade,
  actuator_key text not null,
  command text not null check (command in ('on', 'off', 'open', 'close', 'set_position')),
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'sent', 'acked', 'failed')),
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  acked_at timestamptz
);

create index if not exists iot_device_commands_pending_idx
  on iot_device_commands (device_id, status, created_at)
  where status = 'pending';

alter table iot_sensor_readings enable row level security;
alter table iot_actuator_states enable row level security;
alter table iot_device_commands enable row level security;

-- Admin full access
create policy iot_readings_admin_all on iot_sensor_readings for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy iot_actuators_admin_all on iot_actuator_states for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy iot_commands_admin_all on iot_device_commands for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Farm owner read + update actuators/commands for own farm
create policy iot_readings_owner_select on iot_sensor_readings for select
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'farm_owner' and p.farm_id = iot_sensor_readings.farm_id
    )
    or (
      farm_id = 'farm-capracare-001'
      and exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'farm_owner' and p.farm_id is null)
    )
  );

create policy iot_actuators_owner_all on iot_actuator_states for all
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'farm_owner' and p.farm_id = iot_actuator_states.farm_id
    )
    or (
      farm_id = 'farm-capracare-001'
      and exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'farm_owner' and p.farm_id is null)
    )
  )
  with check (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'farm_owner' and p.farm_id = iot_actuator_states.farm_id
    )
    or (
      farm_id = 'farm-capracare-001'
      and exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'farm_owner' and p.farm_id is null)
    )
  );

create policy iot_commands_owner_all on iot_device_commands for all
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'farm_owner' and p.farm_id = iot_device_commands.farm_id
    )
    or (
      farm_id = 'farm-capracare-001'
      and exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'farm_owner' and p.farm_id is null)
    )
  )
  with check (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'farm_owner' and p.farm_id = iot_device_commands.farm_id
    )
    or (
      farm_id = 'farm-capracare-001'
      and exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'farm_owner' and p.farm_id is null)
    )
  );

-- Default actuator rows for demo farm gateway
insert into iot_actuator_states (farm_id, actuator_key, name, gpio, device_type, is_on, position_pct, status)
values
  ('farm-capracare-001', 'relay_in1', 'Đèn sưởi IR', 25, 'relay', false, null, 'offline'),
  ('farm-capracare-001', 'relay_in2', 'Quạt làm mát / hút', 26, 'relay', false, null, 'offline'),
  ('farm-capracare-001', 'relay_in3', 'Bơm mini phun sương', 27, 'relay', false, null, 'offline'),
  ('farm-capracare-001', 'relay_in4', 'Dự phòng (quạt phụ / đèn UV)', 14, 'relay', false, null, 'offline'),
  ('farm-capracare-001', 'servo_roof', 'Mái che thông minh', null, 'servo', false, 0, 'offline')
on conflict (farm_id, actuator_key) do nothing;
