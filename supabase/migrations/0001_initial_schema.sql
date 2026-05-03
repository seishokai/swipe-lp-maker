create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.landing_pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  slug text not null unique,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  cta_url text,
  fixed_cta_enabled boolean not null default false,
  fixed_cta_label text not null default '詳しく見る',
  fixed_cta_style text not null default 'solid' check (fixed_cta_style in ('solid', 'glass', 'minimal')),
  meta_pixel_id text,
  google_analytics_id text,
  custom_head_tags text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lp_images (
  id uuid primary key default gen_random_uuid(),
  lp_id uuid not null references public.landing_pages(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  alt_text text,
  width integer,
  height integer,
  media_type text not null default 'image' check (media_type in ('image', 'video')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cta_areas (
  id uuid primary key default gen_random_uuid(),
  lp_image_id uuid not null references public.lp_images(id) on delete cascade,
  label text,
  url text,
  x numeric not null check (x >= 0 and x <= 1),
  y numeric not null check (y >= 0 and y <= 1),
  width numeric not null check (width > 0 and width <= 1),
  height numeric not null check (height > 0 and height <= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (x + width <= 1),
  check (y + height <= 1)
);

create index landing_pages_user_id_idx on public.landing_pages(user_id);
create index landing_pages_slug_status_idx on public.landing_pages(slug, status);
create index lp_images_lp_id_sort_order_idx on public.lp_images(lp_id, sort_order);
create index cta_areas_lp_image_id_idx on public.cta_areas(lp_image_id);

alter table public.profiles enable row level security;
alter table public.landing_pages enable row level security;
alter table public.lp_images enable row level security;
alter table public.cta_areas enable row level security;

create policy "Users can read own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can manage own landing pages"
on public.landing_pages for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Anyone can read published landing pages"
on public.landing_pages for select
using (status = 'published');

create policy "Users can manage images for own landing pages"
on public.lp_images for all
using (
  exists (
    select 1 from public.landing_pages
    where landing_pages.id = lp_images.lp_id
      and landing_pages.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.landing_pages
    where landing_pages.id = lp_images.lp_id
      and landing_pages.user_id = auth.uid()
  )
);

create policy "Anyone can read images for published landing pages"
on public.lp_images for select
using (
  exists (
    select 1 from public.landing_pages
    where landing_pages.id = lp_images.lp_id
      and landing_pages.status = 'published'
  )
);

create policy "Users can manage CTA areas for own landing pages"
on public.cta_areas for all
using (
  exists (
    select 1
    from public.lp_images
    join public.landing_pages on landing_pages.id = lp_images.lp_id
    where lp_images.id = cta_areas.lp_image_id
      and landing_pages.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.lp_images
    join public.landing_pages on landing_pages.id = lp_images.lp_id
    where lp_images.id = cta_areas.lp_image_id
      and landing_pages.user_id = auth.uid()
  )
);

create policy "Anyone can read CTA areas for published landing pages"
on public.cta_areas for select
using (
  exists (
    select 1
    from public.lp_images
    join public.landing_pages on landing_pages.id = lp_images.lp_id
    where lp_images.id = cta_areas.lp_image_id
      and landing_pages.status = 'published'
  )
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
