export const SQL=`-- Run this once in Supabase: SQL Editor > New query
create table if not exists items(
  id uuid primary key default gen_random_uuid(),
  name text not null, sku text, category text,
  quantity int not null default 0, min_stock int not null default 0,
  unit text default 'pcs', location text,
  created_at timestamptz default now());
create table if not exists restocks(
  id uuid primary key default gen_random_uuid(),
  item_id uuid references items(id) on delete cascade,
  item_name text, quantity int not null, supplier text, note text,
  created_at timestamptz default now());
create table if not exists requests(
  id uuid primary key default gen_random_uuid(),
  item_id uuid references items(id) on delete set null,
  item_name text, quantity int not null,
  requester text not null, department text, purpose text,
  status text not null default 'pending', reviewer_note text,
  created_at timestamptz default now(), updated_at timestamptz default now());
alter table items enable row level security;
alter table restocks enable row level security;
alter table requests enable row level security;
drop policy if exists "anon all" on items;
drop policy if exists "anon all" on restocks;
drop policy if exists "anon all" on requests;
create policy "anon all" on items for all to anon using (true) with check (true);
create policy "anon all" on restocks for all to anon using (true) with check (true);
create policy "anon all" on requests for all to anon using (true) with check (true);`;
