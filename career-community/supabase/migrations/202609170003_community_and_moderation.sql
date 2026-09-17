-- Public community: posts, comments, reactions, reporting and moderation audit
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 4 and 160),
  content text not null check (char_length(content) between 20 and 30000),
  company text not null default '',
  role_title text not null default '',
  city text not null default '',
  interview_result text not null default '',
  moderation_status public.moderation_status not null default 'published',
  is_pinned boolean not null default false,
  like_count integer not null default 0,
  comment_count integer not null default 0,
  published_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_public_feed_idx on public.posts(moderation_status, published_at desc) where deleted_at is null;
create index posts_user_created_idx on public.posts(user_id, created_at desc);
create index posts_company_idx on public.posts(company);
create index posts_title_trgm_idx on public.posts using gin (title gin_trgm_ops);
create index posts_content_trgm_idx on public.posts using gin (content gin_trgm_ops);
create trigger posts_set_updated_at before update on public.posts for each row execute function public.set_updated_at();

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  content text not null check (char_length(content) between 2 and 8000),
  moderation_status public.moderation_status not null default 'published',
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index comments_post_created_idx on public.comments(post_id, created_at);
create index comments_user_idx on public.comments(user_id);
create trigger comments_set_updated_at before update on public.comments for each row execute function public.set_updated_at();

create table public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.tags (
  id bigint generated always as identity primary key,
  name text not null unique check (char_length(name) between 1 and 32),
  created_at timestamptz not null default now()
);

create table public.post_tags (
  post_id uuid not null references public.posts(id) on delete cascade,
  tag_id bigint not null references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  reason text not null check (char_length(reason) between 2 and 1000),
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  resolution_note text not null default '',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint reports_target_check check ((post_id is not null)::integer + (comment_id is not null)::integer = 1)
);

create index reports_status_created_idx on public.reports(status, created_at);

create table public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  target_type text not null check (target_type in ('post', 'comment', 'user', 'report')),
  target_id uuid not null,
  action text not null,
  reason text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index moderation_actions_created_idx on public.moderation_actions(created_at desc);

create or replace function public.set_post_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.moderation_status = 'published' and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;

create trigger posts_set_published_at before insert or update on public.posts for each row execute function public.set_post_published_at();

create or replace function public.protect_post_owner()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if new.user_id <> old.user_id then raise exception '不能转移帖子作者'; end if;
  if new.moderation_status <> old.moderation_status and not public.is_moderator() then
    raise exception '普通用户不能修改审核状态';
  end if;
  if new.is_pinned <> old.is_pinned and not public.is_moderator() then
    raise exception '普通用户不能置顶帖子';
  end if;
  return new;
end;
$$;

create trigger posts_protect_owner before update on public.posts for each row execute function public.protect_post_owner();

create or replace function public.protect_comment_owner()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if new.user_id <> old.user_id or new.post_id <> old.post_id then raise exception '不能转移评论作者或所属帖子'; end if;
  if new.moderation_status <> old.moderation_status and not public.is_moderator() then
    raise exception '普通用户不能修改审核状态';
  end if;
  return new;
end;
$$;

create trigger comments_protect_owner before update on public.comments for each row execute function public.protect_comment_owner();

create or replace function public.update_post_comment_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_post_id uuid;
begin
  v_post_id := coalesce(new.post_id, old.post_id);
  update public.posts
  set comment_count = (
    select count(*) from public.comments
    where post_id = v_post_id and moderation_status = 'published' and deleted_at is null
  )
  where id = v_post_id;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

create trigger comments_update_count
after insert or update or delete on public.comments
for each row execute function public.update_post_comment_count();

create or replace function public.update_post_like_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_post_id uuid;
begin
  v_post_id := coalesce(new.post_id, old.post_id);
  update public.posts
  set like_count = (select count(*) from public.post_likes where post_id = v_post_id)
  where id = v_post_id;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

create trigger post_likes_update_count
after insert or delete on public.post_likes
for each row execute function public.update_post_like_count();

create or replace function public.record_post_moderation_action()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if new.moderation_status <> old.moderation_status then
    insert into public.moderation_actions (actor_id, target_type, target_id, action, reason)
    values (auth.uid(), 'post', new.id, new.moderation_status::text, '状态更新');
  end if;
  return new;
end;
$$;

create trigger posts_record_moderation
after update of moderation_status on public.posts
for each row execute function public.record_post_moderation_action();

alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.post_likes enable row level security;
alter table public.tags enable row level security;
alter table public.post_tags enable row level security;
alter table public.reports enable row level security;
alter table public.moderation_actions enable row level security;

create policy "public reads published posts"
on public.posts for select
using ((moderation_status = 'published' and deleted_at is null) or user_id = auth.uid() or public.is_moderator());

create policy "users create their own posts"
on public.posts for insert
with check (user_id = auth.uid() and public.is_active_user());

create policy "owners and moderators update posts"
on public.posts for update
using (user_id = auth.uid() or public.is_moderator())
with check (user_id = auth.uid() or public.is_moderator());

create policy "public reads published comments"
on public.comments for select
using ((moderation_status = 'published' and deleted_at is null) or user_id = auth.uid() or public.is_moderator());

create policy "users create their own comments"
on public.comments for insert
with check (user_id = auth.uid() and public.is_active_user());

create policy "owners and moderators update comments"
on public.comments for update
using (user_id = auth.uid() or public.is_moderator())
with check (user_id = auth.uid() or public.is_moderator());

create policy "public reads likes on published posts"
on public.post_likes for select
using (exists (select 1 from public.posts p where p.id = post_id and p.moderation_status = 'published' and p.deleted_at is null));

create policy "active users create their own likes"
on public.post_likes for insert
with check (user_id = auth.uid() and public.is_active_user() and exists (select 1 from public.posts p where p.id = post_id and p.moderation_status = 'published' and p.deleted_at is null));

create policy "users remove their own likes"
on public.post_likes for delete
using (user_id = auth.uid());

create policy "tags are publicly readable"
on public.tags for select using (true);

create policy "moderators manage tags"
on public.tags for all
using (public.is_moderator())
with check (public.is_moderator());

create policy "post tags are publicly readable"
on public.post_tags for select using (true);

create policy "post owners attach tags"
on public.post_tags for insert
with check (exists (select 1 from public.posts p where p.id = post_id and p.user_id = auth.uid()));

create policy "post owners remove tags"
on public.post_tags for delete
using (exists (select 1 from public.posts p where p.id = post_id and p.user_id = auth.uid()) or public.is_moderator());

create policy "active users submit reports"
on public.reports for insert
with check (reporter_id = auth.uid() and public.is_active_user() and status = 'open');

create policy "reporters and moderators read reports"
on public.reports for select
using (reporter_id = auth.uid() or public.is_moderator());

create policy "moderators update reports"
on public.reports for update
using (public.is_moderator())
with check (public.is_moderator());

create policy "moderators read moderation actions"
on public.moderation_actions for select
using (public.is_moderator());

create policy "moderators write moderation actions"
on public.moderation_actions for insert
with check (public.is_moderator());


create or replace function public.attach_post_tags(p_post_id uuid, p_tags text[])
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_tag text;
  v_tag_id bigint;
begin
  if auth.uid() is null or not public.is_active_user() then raise exception '账号不可用'; end if;
  if not exists (select 1 from public.posts where id = p_post_id and user_id = auth.uid()) then
    raise exception '帖子不存在或无权操作';
  end if;
  foreach v_tag in array coalesce(p_tags, array[]::text[]) loop
    v_tag := btrim(v_tag);
    if char_length(v_tag) between 1 and 32 then
      insert into public.tags(name) values (v_tag) on conflict (name) do nothing;
      select id into v_tag_id from public.tags where name = v_tag;
      insert into public.post_tags(post_id, tag_id) values (p_post_id, v_tag_id) on conflict do nothing;
    end if;
  end loop;
end;
$$;

revoke all on function public.attach_post_tags(uuid, text[]) from public, anon;
grant execute on function public.attach_post_tags(uuid, text[]) to authenticated;
