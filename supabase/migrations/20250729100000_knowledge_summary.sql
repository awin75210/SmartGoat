-- Shared handbook + AI chat: short summary for sổ tay list views
alter table knowledge_articles
  add column if not exists summary text not null default '';
