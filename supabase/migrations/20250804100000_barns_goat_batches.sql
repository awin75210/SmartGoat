-- Barns + goat batches (CapraCare herd management by batch)

create table if not exists barns (
  id text primary key,
  farm_id text not null references farms (id) on delete cascade,
  name text not null,
  capacity int,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists barns_farm_id_idx on barns (farm_id);

create table if not exists goat_batches (
  id uuid primary key default gen_random_uuid(),
  farm_id text not null references farms (id) on delete cascade,
  name text not null,
  batch_code text not null,
  barn_id text not null references barns (id) on delete restrict,
  breed text not null,
  gender text not null check (gender in ('mixed', 'male', 'female')),
  birth_date date not null,
  quantity int not null check (quantity >= 1),
  source text not null check (source in ('born_on_farm', 'purchased', 'transferred', 'other')),
  status text not null check (status in ('active', 'sold', 'moved_out', 'closed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (farm_id, batch_code)
);

create index if not exists goat_batches_farm_id_idx on goat_batches (farm_id);
create index if not exists goat_batches_barn_id_idx on goat_batches (barn_id);

alter table barns enable row level security;
alter table goat_batches enable row level security;

-- Admin: read all
create policy barns_admin_select on barns for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy goat_batches_admin_select on goat_batches for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Farm owner: full access own farm (incl. demo fallback)
create policy barns_owner_all on barns for all
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role = 'farm_owner'
        and (
          p.farm_id = barns.farm_id
          or (p.farm_id is null and barns.farm_id = 'farm-capracare-001')
        )
    )
  )
  with check (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role = 'farm_owner'
        and (
          p.farm_id = barns.farm_id
          or (p.farm_id is null and barns.farm_id = 'farm-capracare-001')
        )
    )
  );

create policy goat_batches_owner_all on goat_batches for all
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role = 'farm_owner'
        and (
          p.farm_id = goat_batches.farm_id
          or (p.farm_id is null and goat_batches.farm_id = 'farm-capracare-001')
        )
    )
  )
  with check (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role = 'farm_owner'
        and (
          p.farm_id = goat_batches.farm_id
          or (p.farm_id is null and goat_batches.farm_id = 'farm-capracare-001')
        )
    )
  );

-- Demo barns (infrastructure only, no fake batches)
insert into barns (id, farm_id, name, capacity, status) values
  ('barn-a', 'farm-capracare-001', 'Chuồng A', 24, 'active'),
  ('barn-b', 'farm-capracare-001', 'Chuồng B', 24, 'active'),
  ('barn2-a', 'farm-capracare-002', 'Chuồng A', 20, 'active'),
  ('barn2-b', 'farm-capracare-002', 'Chuồng B', 20, 'active')
on conflict (id) do nothing;
