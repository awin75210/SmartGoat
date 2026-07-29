-- AI Chatbot: knowledge base + conversations (CapraCare)
-- handbook_articles remains separate; do not duplicate.

create type knowledge_status as enum ('draft', 'published', 'hidden');
create type chat_message_role as enum ('user', 'assistant', 'system');

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null check (role in ('admin', 'farm_owner')),
  farm_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists knowledge_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category text not null,
  keywords text not null default '',
  status knowledge_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists knowledge_faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  keywords text not null default '',
  priority int not null default 0,
  status knowledge_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists chat_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  farm_id text not null,
  title text not null default 'Cuộc trò chuyện mới',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chat_conversations_user_id_idx on chat_conversations (user_id);
create index if not exists chat_conversations_farm_id_idx on chat_conversations (farm_id);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references chat_conversations (id) on delete cascade,
  role chat_message_role not null,
  content text not null,
  sources jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_conversation_id_idx on chat_messages (conversation_id);

alter table profiles enable row level security;
alter table knowledge_articles enable row level security;
alter table knowledge_faqs enable row level security;
alter table chat_conversations enable row level security;
alter table chat_messages enable row level security;

-- Profiles: own row
create policy profiles_select_own on profiles for select using (auth.uid() = id);
create policy profiles_update_own on profiles for update using (auth.uid() = id);

-- Knowledge: published readable by authenticated; admin full access
create policy knowledge_articles_select_published on knowledge_articles for select
  using (
    status = 'published'
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy knowledge_articles_admin_all on knowledge_articles for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy knowledge_faqs_select_published on knowledge_faqs for select
  using (
    status = 'published'
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy knowledge_faqs_admin_all on knowledge_faqs for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Conversations: owner only
create policy chat_conversations_owner on chat_conversations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy chat_messages_owner on chat_messages for all
  using (
    exists (
      select 1 from chat_conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from chat_conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );
