-- Create pomodoro_sessions table
create table if not exists public.pomodoro_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  duration int not null default 25, -- duration in minutes
  completed boolean default false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.pomodoro_sessions enable row level security;

-- RLS Policies for pomodoro_sessions
create policy "pomodoro_sessions_select_own"
  on public.pomodoro_sessions for select
  using (auth.uid() = user_id);

create policy "pomodoro_sessions_insert_own"
  on public.pomodoro_sessions for insert
  with check (auth.uid() = user_id);

create policy "pomodoro_sessions_update_own"
  on public.pomodoro_sessions for update
  using (auth.uid() = user_id);

create policy "pomodoro_sessions_delete_own"
  on public.pomodoro_sessions for delete
  using (auth.uid() = user_id);

-- Create index for better query performance
create index if not exists pomodoro_sessions_user_id_idx on public.pomodoro_sessions(user_id);
create index if not exists pomodoro_sessions_task_id_idx on public.pomodoro_sessions(task_id);
create index if not exists pomodoro_sessions_completed_at_idx on public.pomodoro_sessions(completed_at);
