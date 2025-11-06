-- Create user_settings table
create table if not exists public.user_settings (
  id uuid primary key references auth.users(id) on delete cascade,
  pomodoro_duration int default 25,
  short_break_duration int default 5,
  long_break_duration int default 15,
  auto_start_breaks boolean default false,
  auto_start_pomodoros boolean default false,
  daily_goal int default 8, -- daily pomodoro goal
  notifications_enabled boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.user_settings enable row level security;

-- RLS Policies for user_settings
create policy "user_settings_select_own"
  on public.user_settings for select
  using (auth.uid() = id);

create policy "user_settings_insert_own"
  on public.user_settings for insert
  with check (auth.uid() = id);

create policy "user_settings_update_own"
  on public.user_settings for update
  using (auth.uid() = id);

create policy "user_settings_delete_own"
  on public.user_settings for delete
  using (auth.uid() = id);

-- Create trigger to auto-create settings on profile creation
create or replace function public.handle_new_user_settings()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_settings (id)
  values (new.id)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_profile_created on public.profiles;

create trigger on_profile_created
  after insert on public.profiles
  for each row
  execute function public.handle_new_user_settings();
