-- liebstch career community: core identity, roles and shared helpers
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create type public.user_role as enum ('user', 'moderator', 'admin');
create type public.user_status as enum ('active', 'suspended', 'deleted');
create type public.application_stage as enum ('wishlist', 'applied', 'assessment', 'interview', 'offer', 'rejected', 'withdrawn');
create type public.interview_kind as enum ('interview', 'assessment', 'written_test', 'career_talk', 'deadline');
create type public.reminder_status as enum ('scheduled', 'sending', 'sent', 'failed', 'dead', 'cancelled');
create type public.email_status as enum ('queued', 'sent', 'failed');
create type public.moderation_status as enum ('pending', 'published', 'hidden', 'removed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique,
  display_name text not null default '新用户',
  avatar_url text,
  bio text not null default '',
  timezone text not null default 'Asia/Shanghai',
  role public.user_role not null default 'user',
  status public.user_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_handle_format check (handle is null or handle ~ '^[a-zA-Z0-9_]{3,32}$')
);

create index profiles_role_idx on public.profiles(role);
create index profiles_status_idx on public.profiles(status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (id, handle, display_name, avatar_url, timezone)
  values (
    new.id,
    'user_' || substr(replace(new.id::text, '-', ''), 1, 10),
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(coalesce(new.email, 'user'), '@', 1)),
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'timezone', ''), 'Asia/Shanghai')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'active'
  );
$$;

create or replace function public.is_moderator()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('moderator', 'admin') and status = 'active'
  );
$$;

create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'active'
  );
$$;

create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() = old.id and not public.is_admin() then
    if new.role <> old.role or new.status <> old.status then
      raise exception '普通用户不能修改角色或账号状态';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_fields
before update on public.profiles
for each row execute function public.protect_profile_fields();

alter table public.profiles enable row level security;

create policy "profiles are publicly readable"
on public.profiles for select
using (status <> 'deleted');

create policy "users can insert their own profile"
on public.profiles for insert
with check (auth.uid() = id);

create policy "users can update their own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "admins can update profiles"
on public.profiles for update
using (public.is_admin())
with check (public.is_admin());
