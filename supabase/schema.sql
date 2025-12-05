-- Supabase schema for shared data
-- Run this in the Supabase SQL editor. Adjust roles/policies as needed.

-- Enable pgcrypto for UUID generation (already enabled on most projects)
create extension if not exists "uuid-ossp";

-- Users table (app-level, not Supabase Auth). If you prefer Supabase Auth, skip this and use auth.users.
create table if not exists public.users_app (
  id uuid primary key default uuid_generate_v4(),
  username text unique not null,
  password_hash text not null,
  full_name text not null,
  role text not null check (role in ('admin','in_charge','staff','attendant','sweeper')),
  assigned_wards text[] default '{}',
  created_at timestamptz default now()
);

-- Wards
create table if not exists public.wards (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  created_at timestamptz default now()
);

-- Staff (persons assignable to shifts; ward_id optional if floating pool)
create table if not exists public.staff (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  role text not null check (role in ('in_charge','staff','attendant','sweeper')),
  ward_id uuid references public.wards(id) on delete set null,
  created_at timestamptz default now()
);

-- Assignments (roster entries)
create table if not exists public.assignments (
  id uuid primary key default uuid_generate_v4(),
  ward_id uuid not null references public.wards(id) on delete cascade,
  staff_id uuid not null references public.staff(id) on delete cascade,
  date_key text not null,
  shift_id text not null,
  created_at timestamptz default now()
);

-- Change requests
create table if not exists public.change_requests (
  id uuid primary key default uuid_generate_v4(),
  ward_id uuid not null references public.wards(id) on delete cascade,
  staff_id uuid references public.staff(id) on delete set null,
  requested_by uuid references public.users_app(id) on delete set null,
  type text not null,
  payload jsonb default '{}',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  date_key text,
  shift_label text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Seed a default admin (password: admin123) - change immediately in production
insert into public.users_app (username, password_hash, full_name, role)
values ('admin', '$2b$10$SJi0ZBwbNG0Ax7AnCM1j/e6whhtjfiPgkBC5T9jp9ENrssZCvGSyW', 'System Administrator', 'admin')
on conflict (username) do nothing;
-- Hash is bcrypt for "admin123"; replace with your own secure hash.

-- Basic Row Level Security setup (tighten as needed)
alter table public.wards enable row level security;
alter table public.staff enable row level security;
alter table public.assignments enable row level security;
alter table public.change_requests enable row level security;
alter table public.users_app enable row level security;

-- Simple policies for testing (open read, admin can write). Replace with stricter rules for production.
drop policy if exists "Allow read all" on public.wards;
drop policy if exists "Allow read all" on public.staff;
drop policy if exists "Allow read all" on public.assignments;
drop policy if exists "Allow read all" on public.change_requests;
drop policy if exists "Allow read all" on public.users_app;

create policy "Allow read all" on public.wards for select using (true);
create policy "Allow read all" on public.staff for select using (true);
create policy "Allow read all" on public.assignments for select using (true);
create policy "Allow read all" on public.change_requests for select using (true);
create policy "Allow read all" on public.users_app for select using (true);

-- Allow inserts/updates/deletes only for service_role key (backend) or later for role-based checks.
drop policy if exists "Service role full access" on public.wards;
drop policy if exists "Service role full access" on public.staff;
drop policy if exists "Service role full access" on public.assignments;
drop policy if exists "Service role full access" on public.change_requests;
drop policy if exists "Service role full access" on public.users_app;

create policy "Service role full access" on public.wards for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "Service role full access" on public.staff for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "Service role full access" on public.assignments for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "Service role full access" on public.change_requests for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "Service role full access" on public.users_app for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- Authenticated users can read/write (relaxed for MVP; tighten later with role-based checks)
drop policy if exists "Authenticated can insert wards" on public.wards;
drop policy if exists "Authenticated can update wards" on public.wards;
drop policy if exists "Authenticated can delete wards" on public.wards;
drop policy if exists "Authenticated can insert staff" on public.staff;
drop policy if exists "Authenticated can update staff" on public.staff;
drop policy if exists "Authenticated can delete staff" on public.staff;
drop policy if exists "Authenticated can insert assignments" on public.assignments;
drop policy if exists "Authenticated can update assignments" on public.assignments;
drop policy if exists "Authenticated can delete assignments" on public.assignments;
drop policy if exists "Authenticated can insert change_requests" on public.change_requests;
drop policy if exists "Authenticated can update change_requests" on public.change_requests;
drop policy if exists "Authenticated can delete change_requests" on public.change_requests;

create policy "Authenticated can insert wards" on public.wards for insert with check (auth.role() = 'authenticated');
create policy "Authenticated can update wards" on public.wards for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated can delete wards" on public.wards for delete using (auth.role() = 'authenticated');

create policy "Authenticated can insert staff" on public.staff for insert with check (auth.role() = 'authenticated');
create policy "Authenticated can update staff" on public.staff for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated can delete staff" on public.staff for delete using (auth.role() = 'authenticated');

create policy "Authenticated can insert assignments" on public.assignments for insert with check (auth.role() = 'authenticated');
create policy "Authenticated can update assignments" on public.assignments for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated can delete assignments" on public.assignments for delete using (auth.role() = 'authenticated');

create policy "Authenticated can insert change_requests" on public.change_requests for insert with check (auth.role() = 'authenticated');
create policy "Authenticated can update change_requests" on public.change_requests for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated can delete change_requests" on public.change_requests for delete using (auth.role() = 'authenticated');

-- Auto-set default metadata for new users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  update auth.users 
  set raw_user_meta_data = coalesce(
    raw_user_meta_data, 
    '{"fullName": "New User", "role": "staff", "assignedWards": []}'::jsonb
  )
  where id = new.id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Note: For production, tighten RLS policies to enforce role-based access (e.g., admins only can delete wards).
-- Currently relaxed for MVP; authenticated users can do most operations.

-- Password verification function (uses pgcrypto for bcrypt)
create or replace function public.verify_password(
  username_input text,
  password_input text
)
returns boolean
language plpgsql
security definer
as $$
declare
  stored_hash text;
begin
  -- Get the password hash for the user
  select password_hash into stored_hash
  from public.users_app
  where username = username_input;

  if stored_hash is null then
    return false;
  end if;

  -- Use pgcrypto's crypt function to compare passwords
  -- Note: This requires pgcrypto extension and the hash must be bcrypt format
  return crypt(password_input, stored_hash) = stored_hash;
end;
$$;
