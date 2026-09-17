-- Private career tracker, interview events, reminders and email delivery audit
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  role_title text not null default '',
  city text not null default '',
  source_url text,
  priority smallint not null default 2 check (priority between 0 and 2),
  stage public.application_stage not null default 'wishlist',
  status_note text not null default '',
  applied_at timestamptz,
  deadline_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index applications_user_stage_idx on public.applications(user_id, stage);
create index applications_user_deadline_idx on public.applications(user_id, deadline_at) where deadline_at is not null;
create trigger applications_set_updated_at before update on public.applications for each row execute function public.set_updated_at();

create table public.interview_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind public.interview_kind not null default 'interview',
  title text not null,
  local_at timestamp without time zone not null,
  timezone text not null default 'Asia/Shanghai',
  starts_at timestamptz not null,
  duration_minutes integer not null default 60 check (duration_minutes between 15 and 1440),
  location text not null default '',
  meeting_url text,
  contact_name text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index interview_events_user_starts_idx on public.interview_events(user_id, starts_at);
create index interview_events_application_idx on public.interview_events(application_id);
create trigger interview_events_set_updated_at before update on public.interview_events for each row execute function public.set_updated_at();

create or replace function public.validate_timezone()
returns trigger
language plpgsql
as $$
begin
  if not exists (select 1 from pg_timezone_names where name = new.timezone) then
    raise exception '无效的 IANA 时区：%', new.timezone;
  end if;
  return new;
end;
$$;

create trigger interview_events_validate_timezone before insert or update of timezone on public.interview_events for each row execute function public.validate_timezone();

create or replace function public.set_interview_starts_at()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    new.starts_at = new.local_at at time zone new.timezone;
  elsif new.local_at is distinct from old.local_at or new.timezone is distinct from old.timezone then
    new.starts_at = new.local_at at time zone new.timezone;
  end if;
  return new;
end;
$$;

create trigger interview_events_set_starts_at before insert or update on public.interview_events for each row execute function public.set_interview_starts_at();

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  interview_event_id uuid not null references public.interview_events(id) on delete cascade,
  offset_minutes integer not null check (offset_minutes between 5 and 43200),
  scheduled_at timestamptz not null,
  status public.reminder_status not null default 'scheduled',
  attempt_count integer not null default 0,
  max_attempts integer not null default 5 check (max_attempts between 1 and 20),
  next_attempt_at timestamptz,
  locked_at timestamptz,
  last_error text,
  provider_message_id text,
  idempotency_key text not null unique,
  sent_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (interview_event_id, offset_minutes)
);

create index reminders_due_idx on public.reminders(status, scheduled_at, next_attempt_at) where status in ('scheduled', 'failed');
create trigger reminders_set_updated_at before update on public.reminders for each row execute function public.set_updated_at();

create or replace function public.set_reminder_schedule()
returns trigger
language plpgsql
as $$
declare
  v_event public.interview_events%rowtype;
begin
  select * into v_event from public.interview_events where id = new.interview_event_id;
  if not found then raise exception '面试事件不存在'; end if;
  if new.user_id <> v_event.user_id then raise exception '提醒用户与面试事件用户不一致'; end if;
  new.scheduled_at = v_event.starts_at - make_interval(mins => new.offset_minutes);
  new.idempotency_key = new.interview_event_id::text || ':' || new.offset_minutes::text;
  return new;
end;
$$;

create trigger reminders_set_schedule before insert or update on public.reminders for each row execute function public.set_reminder_schedule();

create table public.email_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  reminder_id uuid references public.reminders(id) on delete set null,
  provider text not null default 'resend',
  provider_message_id text,
  to_email text not null,
  subject text not null,
  status public.email_status not null default 'queued',
  error text,
  metadata jsonb not null default '{}'::jsonb,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index email_logs_user_created_idx on public.email_logs(user_id, created_at desc);
create index email_logs_reminder_idx on public.email_logs(reminder_id);

alter table public.applications enable row level security;
alter table public.interview_events enable row level security;
alter table public.reminders enable row level security;
alter table public.email_logs enable row level security;

create policy "users manage their own applications"
on public.applications for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id and public.is_active_user());

create policy "users manage their own interview events"
on public.interview_events for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id and public.is_active_user());

create policy "users read their own reminders"
on public.reminders for select
using (auth.uid() = user_id);

create policy "users read their own email logs"
on public.email_logs for select
using (auth.uid() = user_id);

create policy "admins read email logs"
on public.email_logs for select
using (public.is_admin());

create or replace function public.create_interview_event_with_reminders(
  p_application_id uuid,
  p_title text,
  p_local_at timestamp without time zone,
  p_timezone text default 'Asia/Shanghai',
  p_offset_minutes integer[] default array[1440, 120],
  p_kind public.interview_kind default 'interview',
  p_duration_minutes integer default 60,
  p_location text default '',
  p_meeting_url text default '',
  p_contact_name text default '',
  p_notes text default ''
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_application public.applications%rowtype;
  v_event_id uuid;
  v_offset integer;
begin
  if v_user_id is null then raise exception '请先登录'; end if;
  if not public.is_active_user() then raise exception '账号不可用'; end if;

  select * into v_application
  from public.applications
  where id = p_application_id and user_id = v_user_id;

  if not found then raise exception '求职记录不存在或无权访问'; end if;
  if not exists (select 1 from pg_timezone_names where name = p_timezone) then raise exception '无效的时区'; end if;

  insert into public.interview_events (
    application_id, user_id, kind, title, local_at, timezone, starts_at,
    duration_minutes, location, meeting_url, contact_name, notes
  ) values (
    p_application_id, v_user_id, p_kind, p_title, p_local_at, p_timezone,
    p_local_at at time zone p_timezone, p_duration_minutes, p_location,
    nullif(p_meeting_url, ''), p_contact_name, p_notes
  ) returning id into v_event_id;

  foreach v_offset in array coalesce(p_offset_minutes, array[1440, 120]) loop
    if v_offset between 5 and 43200 then
      insert into public.reminders (user_id, interview_event_id, offset_minutes, scheduled_at)
      values (v_user_id, v_event_id, v_offset, p_local_at at time zone p_timezone - make_interval(mins => v_offset))
      on conflict (interview_event_id, offset_minutes) do nothing;
    end if;
  end loop;

  return v_event_id;
end;
$$;

create or replace function public.claim_due_reminders(batch_size integer default 20)
returns table (
  reminder_id uuid,
  user_id uuid,
  recipient_email text,
  interview_title text,
  company text,
  starts_at timestamptz,
  timezone text,
  duration_minutes integer,
  location text,
  meeting_url text,
  contact_name text,
  notes text,
  offset_minutes integer,
  attempt_count integer,
  max_attempts integer,
  idempotency_key text
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  return query
  with candidates as (
    select r.id
    from public.reminders r
    where r.status in ('scheduled', 'failed')
      and r.scheduled_at <= now()
      and (r.next_attempt_at is null or r.next_attempt_at <= now())
      and r.attempt_count < r.max_attempts
    order by r.scheduled_at
    for update skip locked
    limit greatest(1, least(coalesce(batch_size, 20), 100))
  ),
  claimed as (
    update public.reminders r
    set status = 'sending',
        attempt_count = r.attempt_count + 1,
        locked_at = now(),
        updated_at = now()
    from candidates c
    where r.id = c.id
    returning r.*
  )
  select
    c.id,
    c.user_id,
    u.email::text,
    e.title,
    a.company,
    e.starts_at,
    e.timezone,
    e.duration_minutes,
    e.location,
    e.meeting_url,
    e.contact_name,
    e.notes,
    c.offset_minutes,
    c.attempt_count,
    c.max_attempts,
    c.idempotency_key
  from claimed c
  join public.interview_events e on e.id = c.interview_event_id
  join public.applications a on a.id = e.application_id
  join auth.users u on u.id = c.user_id
  order by c.scheduled_at;
end;
$$;

create or replace function public.finish_reminder(
  p_reminder_id uuid,
  p_success boolean,
  p_error text default null,
  p_provider_message_id text default null
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_reminder public.reminders%rowtype;
begin
  select * into v_reminder from public.reminders where id = p_reminder_id for update;
  if not found then raise exception '提醒不存在'; end if;

  if p_success then
    update public.reminders
    set status = 'sent', sent_at = now(), locked_at = null, next_attempt_at = null,
        last_error = null, provider_message_id = p_provider_message_id, updated_at = now()
    where id = p_reminder_id;
  else
    update public.reminders
    set status = case when attempt_count >= max_attempts then 'dead'::public.reminder_status else 'failed'::public.reminder_status end,
        next_attempt_at = case when attempt_count >= max_attempts then null else now() + make_interval(mins => least(120, (2 ^ attempt_count)::integer)) end,
        locked_at = null,
        last_error = left(coalesce(p_error, '未知错误'), 2000),
        updated_at = now()
    where id = p_reminder_id;
  end if;
end;
$$;

revoke all on function public.claim_due_reminders(integer) from public, anon, authenticated;
revoke all on function public.finish_reminder(uuid, boolean, text, text) from public, anon, authenticated;
grant execute on function public.claim_due_reminders(integer) to service_role;
grant execute on function public.finish_reminder(uuid, boolean, text, text) to service_role;
grant execute on function public.create_interview_event_with_reminders(uuid, text, timestamp without time zone, text, integer[], public.interview_kind, integer, text, text, text, text) to authenticated;

