create table if not exists public.training_courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  slug text not null unique,
  description text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.training_sections (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.training_courses(id) on delete cascade,
  title text not null,
  body text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.training_assets (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.training_sections(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  file_name text,
  asset_type text not null default 'file' check (asset_type in ('image', 'video', 'pdf', 'file')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists training_courses_user_id_idx on public.training_courses(user_id);
create index if not exists training_courses_slug_status_idx on public.training_courses(slug, status);
create index if not exists training_sections_course_id_sort_order_idx on public.training_sections(course_id, sort_order);
create index if not exists training_assets_section_id_sort_order_idx on public.training_assets(section_id, sort_order);

alter table public.training_courses enable row level security;
alter table public.training_sections enable row level security;
alter table public.training_assets enable row level security;

drop policy if exists "Users can manage own training courses" on public.training_courses;
create policy "Users can manage own training courses"
on public.training_courses for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Anyone can read published training courses" on public.training_courses;
create policy "Anyone can read published training courses"
on public.training_courses for select
using (status = 'published');

drop policy if exists "Users can manage sections for own training courses" on public.training_sections;
create policy "Users can manage sections for own training courses"
on public.training_sections for all
using (
  exists (
    select 1 from public.training_courses
    where training_courses.id = training_sections.course_id
      and training_courses.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.training_courses
    where training_courses.id = training_sections.course_id
      and training_courses.user_id = auth.uid()
  )
);

drop policy if exists "Anyone can read sections for published training courses" on public.training_sections;
create policy "Anyone can read sections for published training courses"
on public.training_sections for select
using (
  exists (
    select 1 from public.training_courses
    where training_courses.id = training_sections.course_id
      and training_courses.status = 'published'
  )
);

drop policy if exists "Users can manage assets for own training courses" on public.training_assets;
create policy "Users can manage assets for own training courses"
on public.training_assets for all
using (
  exists (
    select 1
    from public.training_sections
    join public.training_courses on training_courses.id = training_sections.course_id
    where training_sections.id = training_assets.section_id
      and training_courses.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.training_sections
    join public.training_courses on training_courses.id = training_sections.course_id
    where training_sections.id = training_assets.section_id
      and training_courses.user_id = auth.uid()
  )
);

drop policy if exists "Anyone can read assets for published training courses" on public.training_assets;
create policy "Anyone can read assets for published training courses"
on public.training_assets for select
using (
  exists (
    select 1
    from public.training_sections
    join public.training_courses on training_courses.id = training_sections.course_id
    where training_sections.id = training_assets.section_id
      and training_courses.status = 'published'
  )
);

insert into storage.buckets (id, name, public)
values ('training-assets', 'training-assets', true)
on conflict (id) do update set public = true;

drop policy if exists "Users can upload own training assets" on storage.objects;
create policy "Users can upload own training assets"
on storage.objects for insert
with check (
  bucket_id = 'training-assets'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can update own training assets" on storage.objects;
create policy "Users can update own training assets"
on storage.objects for update
using (
  bucket_id = 'training-assets'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'training-assets'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can delete own training assets" on storage.objects;
create policy "Users can delete own training assets"
on storage.objects for delete
using (
  bucket_id = 'training-assets'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Anyone can read training assets" on storage.objects;
create policy "Anyone can read training assets"
on storage.objects for select
using (bucket_id = 'training-assets');
