-- Tự tạo profiles khi user đăng ký qua Supabase Auth (tuỳ chọn chạy sau migration chatbot).
-- Chỉnh farm_id / role mặc định cho phù hợp trại của bạn.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, farm_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'farm_owner'),
    coalesce(new.raw_user_meta_data->>'farm_id', 'farm-capracare-001')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
