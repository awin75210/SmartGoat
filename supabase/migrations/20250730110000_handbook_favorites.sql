-- Handbook favorites: per-user saved articles for re-reading

create table if not exists handbook_favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  article_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, article_id)
);

create index if not exists handbook_favorites_user_id_idx on handbook_favorites (user_id);
create index if not exists handbook_favorites_created_at_idx on handbook_favorites (created_at desc);

alter table handbook_favorites enable row level security;

create policy handbook_favorites_select_own on handbook_favorites for select
  using (auth.uid() = user_id);

create policy handbook_favorites_insert_own on handbook_favorites for insert
  with check (auth.uid() = user_id);

create policy handbook_favorites_delete_own on handbook_favorites for delete
  using (auth.uid() = user_id);
