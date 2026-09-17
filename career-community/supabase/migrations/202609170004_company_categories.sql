-- Company category taxonomy for the public community
create type public.company_category as enum (
  'central_soe',
  'big_tech',
  'manufacturing',
  'fmcg',
  'foreign',
  'finance',
  'ai_startup',
  'other'
);

alter table public.posts
add column company_category public.company_category not null default 'other';

create index posts_company_category_feed_idx
on public.posts(company_category, published_at desc)
where moderation_status = 'published' and deleted_at is null;
