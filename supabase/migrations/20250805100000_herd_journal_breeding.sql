-- Herd journal, breeding does, care reminders, growth tracking

-- 4.1: development stage on batches
alter table goat_batches
  add column if not exists development_stage text not null default 'newborn'
    check (development_stage in ('newborn', 'weaning', 'grower', 'finisher', 'breeder')),
  add column if not exists stage_override boolean not null default false,
  add column if not exists supplier_info text;

-- Target market weight for 4.4 projections
alter table farm_settings
  add column if not exists target_market_weight_kg numeric default 35;

-- Breeding does (individual reproductive females)
create table if not exists breeding_does (
  id uuid primary key default gen_random_uuid(),
  farm_id text not null references farms (id) on delete cascade,
  tag_code text not null,
  barcode text not null,
  name text not null,
  breed text not null,
  birth_date date not null,
  batch_id uuid references goat_batches (id) on delete set null,
  barn_id text references barns (id) on delete set null,
  status text not null default 'active'
    check (status in ('active', 'pregnant', 'lactating', 'retired', 'sold')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (farm_id, tag_code),
  unique (farm_id, barcode)
);

create index if not exists breeding_does_farm_id_idx on breeding_does (farm_id);

-- Electronic journal (4.5 foundation)
create table if not exists herd_journal_entries (
  id uuid primary key default gen_random_uuid(),
  farm_id text not null references farms (id) on delete cascade,
  entry_type text not null check (
    entry_type in (
      'note', 'vaccination', 'deworming', 'feeding', 'weight',
      'movement', 'reproduction', 'health'
    )
  ),
  batch_id uuid references goat_batches (id) on delete set null,
  doe_id uuid references breeding_does (id) on delete set null,
  title text not null,
  body text,
  metadata jsonb not null default '{}'::jsonb,
  recorded_at timestamptz not null default now(),
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists herd_journal_farm_recorded_idx
  on herd_journal_entries (farm_id, recorded_at desc);

-- Reproductive cycles (4.2)
create table if not exists reproductive_cycles (
  id uuid primary key default gen_random_uuid(),
  farm_id text not null references farms (id) on delete cascade,
  doe_id uuid not null references breeding_does (id) on delete cascade,
  cycle_number int not null default 1,
  mating_date date,
  expected_kidding_date date,
  actual_kidding_date date,
  kids_count int,
  status text not null default 'planned'
    check (status in ('planned', 'pregnant', 'kidded', 'failed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reproductive_cycles_doe_idx on reproductive_cycles (doe_id, cycle_number);

-- Care schedule templates (4.3)
create table if not exists care_schedule_templates (
  id uuid primary key default gen_random_uuid(),
  farm_id text references farms (id) on delete cascade,
  care_type text not null check (care_type in ('vaccination', 'deworming', 'feeding', 'general_care')),
  development_stage text check (
    development_stage is null or development_stage in ('newborn', 'weaning', 'grower', 'finisher', 'breeder')
  ),
  title text not null,
  description text,
  offset_days int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Care reminders (4.3)
create table if not exists care_reminders (
  id uuid primary key default gen_random_uuid(),
  farm_id text not null references farms (id) on delete cascade,
  template_id uuid references care_schedule_templates (id) on delete set null,
  batch_id uuid references goat_batches (id) on delete cascade,
  doe_id uuid references breeding_does (id) on delete cascade,
  title text not null,
  care_type text not null,
  due_date date not null,
  status text not null default 'pending'
    check (status in ('pending', 'done', 'skipped', 'overdue')),
  completed_journal_id uuid references herd_journal_entries (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (batch_id is not null or doe_id is not null)
);

create index if not exists care_reminders_farm_due_idx
  on care_reminders (farm_id, due_date, status);

-- Growth records (4.4)
create table if not exists growth_records (
  id uuid primary key default gen_random_uuid(),
  farm_id text not null references farms (id) on delete cascade,
  batch_id uuid not null references goat_batches (id) on delete cascade,
  recorded_at date not null,
  avg_weight_kg numeric not null check (avg_weight_kg > 0),
  sample_size int not null default 1 check (sample_size >= 1),
  feed_kg_per_day numeric,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists growth_records_batch_idx on growth_records (batch_id, recorded_at desc);

-- Batch feed logs (4.4)
create table if not exists batch_feed_logs (
  id uuid primary key default gen_random_uuid(),
  farm_id text not null references farms (id) on delete cascade,
  batch_id uuid not null references goat_batches (id) on delete cascade,
  recorded_at date not null,
  feed_kg numeric not null check (feed_kg >= 0),
  feed_type text,
  notes text,
  created_at timestamptz not null default now()
);

-- RLS enable
alter table breeding_does enable row level security;
alter table herd_journal_entries enable row level security;
alter table reproductive_cycles enable row level security;
alter table care_schedule_templates enable row level security;
alter table care_reminders enable row level security;
alter table growth_records enable row level security;
alter table batch_feed_logs enable row level security;

-- Admin policies
create policy breeding_does_admin_all on breeding_does for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy herd_journal_admin_all on herd_journal_entries for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy reproductive_cycles_admin_all on reproductive_cycles for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy care_templates_admin_all on care_schedule_templates for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy care_reminders_admin_all on care_reminders for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy growth_records_admin_all on growth_records for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy batch_feed_logs_admin_all on batch_feed_logs for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Farm owner policies (with demo fallback)
create policy breeding_does_owner_all on breeding_does for all
  using (
    exists (
      select 1 from profiles p where p.id = auth.uid() and p.role = 'farm_owner'
        and (p.farm_id = breeding_does.farm_id or (p.farm_id is null and breeding_does.farm_id = 'farm-capracare-001'))
    )
  )
  with check (
    exists (
      select 1 from profiles p where p.id = auth.uid() and p.role = 'farm_owner'
        and (p.farm_id = breeding_does.farm_id or (p.farm_id is null and breeding_does.farm_id = 'farm-capracare-001'))
    )
  );

create policy herd_journal_owner_all on herd_journal_entries for all
  using (
    exists (
      select 1 from profiles p where p.id = auth.uid() and p.role = 'farm_owner'
        and (p.farm_id = herd_journal_entries.farm_id or (p.farm_id is null and herd_journal_entries.farm_id = 'farm-capracare-001'))
    )
  )
  with check (
    exists (
      select 1 from profiles p where p.id = auth.uid() and p.role = 'farm_owner'
        and (p.farm_id = herd_journal_entries.farm_id or (p.farm_id is null and herd_journal_entries.farm_id = 'farm-capracare-001'))
    )
  );

create policy reproductive_cycles_owner_all on reproductive_cycles for all
  using (
    exists (
      select 1 from profiles p where p.id = auth.uid() and p.role = 'farm_owner'
        and (p.farm_id = reproductive_cycles.farm_id or (p.farm_id is null and reproductive_cycles.farm_id = 'farm-capracare-001'))
    )
  )
  with check (
    exists (
      select 1 from profiles p where p.id = auth.uid() and p.role = 'farm_owner'
        and (p.farm_id = reproductive_cycles.farm_id or (p.farm_id is null and reproductive_cycles.farm_id = 'farm-capracare-001'))
    )
  );

create policy care_templates_owner_select on care_schedule_templates for select
  using (farm_id is null or exists (
    select 1 from profiles p where p.id = auth.uid() and p.role = 'farm_owner'
      and (p.farm_id = care_schedule_templates.farm_id or (p.farm_id is null and care_schedule_templates.farm_id = 'farm-capracare-001'))
  ));

create policy care_reminders_owner_all on care_reminders for all
  using (
    exists (
      select 1 from profiles p where p.id = auth.uid() and p.role = 'farm_owner'
        and (p.farm_id = care_reminders.farm_id or (p.farm_id is null and care_reminders.farm_id = 'farm-capracare-001'))
    )
  )
  with check (
    exists (
      select 1 from profiles p where p.id = auth.uid() and p.role = 'farm_owner'
        and (p.farm_id = care_reminders.farm_id or (p.farm_id is null and care_reminders.farm_id = 'farm-capracare-001'))
    )
  );

create policy growth_records_owner_all on growth_records for all
  using (
    exists (
      select 1 from profiles p where p.id = auth.uid() and p.role = 'farm_owner'
        and (p.farm_id = growth_records.farm_id or (p.farm_id is null and growth_records.farm_id = 'farm-capracare-001'))
    )
  )
  with check (
    exists (
      select 1 from profiles p where p.id = auth.uid() and p.role = 'farm_owner'
        and (p.farm_id = growth_records.farm_id or (p.farm_id is null and growth_records.farm_id = 'farm-capracare-001'))
    )
  );

create policy batch_feed_logs_owner_all on batch_feed_logs for all
  using (
    exists (
      select 1 from profiles p where p.id = auth.uid() and p.role = 'farm_owner'
        and (p.farm_id = batch_feed_logs.farm_id or (p.farm_id is null and batch_feed_logs.farm_id = 'farm-capracare-001'))
    )
  )
  with check (
    exists (
      select 1 from profiles p where p.id = auth.uid() and p.role = 'farm_owner'
        and (p.farm_id = batch_feed_logs.farm_id or (p.farm_id is null and batch_feed_logs.farm_id = 'farm-capracare-001'))
    )
  );

-- Default care templates (global)
insert into care_schedule_templates (farm_id, care_type, development_stage, title, description, offset_days) values
  (null, 'deworming', 'newborn', 'Tẩy giun lần 1', 'Tẩy giun sơ bộ cho dê con 0–30 ngày', 30),
  (null, 'deworming', 'weaning', 'Tẩy giun lần 2', 'Tẩy giun sau giai đoạn cai sữa', 90),
  (null, 'vaccination', 'weaning', 'Tiêm phòng cơ bản', 'Tiêm phòng bệnh đường ruột / Clostridial', 60),
  (null, 'vaccination', 'grower', 'Tiêm nhắc lại', 'Tiêm nhắc lại vaccine theo lịch', 120),
  (null, 'feeding', 'newborn', 'Khẩu phần sơ sinh', 'Kiểm tra khẩu phần sữa/cỏ non', 7),
  (null, 'feeding', 'grower', 'Điều chỉnh khẩu phần tăng trưởng', 'Tăng khẩu phần tinh theo ADG', 100),
  (null, 'general_care', 'weaning', 'Chuyển chuồng cai sữa', 'Theo dõi stress sau cai sữa', 45);
