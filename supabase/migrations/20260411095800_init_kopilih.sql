create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.cafe_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  city text not null,
  neighborhood text,
  address text not null,
  description text not null,
  price_range text not null check (price_range in ('$', '$$', '$$$')),
  vibes text[] not null default '{}',
  amenities text[] not null default '{}',
  image_url text,
  maps_url text,
  instagram_url text,
  submitter_name text,
  submitter_email text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note text,
  approved_cafe_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.cafes (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references public.cafe_submissions(id) on delete set null,
  name text not null,
  slug text not null unique,
  city text not null,
  neighborhood text,
  address text not null,
  description text not null,
  long_description text,
  price_range text not null check (price_range in ('$', '$$', '$$$')),
  rating numeric(2,1) not null default 4.5 check (rating >= 0 and rating <= 5),
  review_count integer not null default 0 check (review_count >= 0),
  vibes text[] not null default '{}',
  amenities text[] not null default '{}',
  image_url text,
  maps_url text,
  instagram_url text,
  featured boolean not null default false,
  wifi_friendly boolean not null default false,
  source text not null default 'community' check (source in ('editorial', 'community', 'imported')),
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.cafe_submissions
  add constraint cafe_submissions_approved_cafe_id_fkey
  foreign key (approved_cafe_id)
  references public.cafes(id)
  on delete set null;

create table if not exists public.cafe_hours (
  id uuid primary key default gen_random_uuid(),
  cafe_id uuid not null references public.cafes(id) on delete cascade,
  day_label text not null,
  open_text text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_cafes_status on public.cafes(status);
create index if not exists idx_cafes_city on public.cafes(city);
create index if not exists idx_cafe_submissions_status on public.cafe_submissions(status);
create index if not exists idx_cafe_hours_cafe_id on public.cafe_hours(cafe_id);

create trigger set_cafe_submissions_updated_at
before update on public.cafe_submissions
for each row
execute function public.set_updated_at();

create trigger set_cafes_updated_at
before update on public.cafes
for each row
execute function public.set_updated_at();

alter table public.cafe_submissions enable row level security;
alter table public.cafes enable row level security;
alter table public.cafe_hours enable row level security;

create policy "public can read published cafes"
on public.cafes
for select
using (status = 'published');

create policy "public can read cafe hours for published cafes"
on public.cafe_hours
for select
using (
  exists (
    select 1 from public.cafes
    where cafes.id = cafe_hours.cafe_id
      and cafes.status = 'published'
  )
);

create policy "anyone can insert submissions"
on public.cafe_submissions
for insert
with check (status = 'pending');

create policy "anon cannot read submissions"
on public.cafe_submissions
for select
using (false);

comment on table public.cafe_submissions is 'Queue for user-submitted cafe recommendations awaiting admin review.';
comment on table public.cafes is 'Published and draft cafes visible in the Kopilih app.';
comment on table public.cafe_hours is 'Opening hours for each cafe.';
