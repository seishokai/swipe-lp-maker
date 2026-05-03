alter table public.landing_pages
  add column if not exists fixed_cta_enabled boolean not null default false,
  add column if not exists fixed_cta_label text not null default '詳しく見る',
  add column if not exists fixed_cta_style text not null default 'solid'
    check (fixed_cta_style in ('solid', 'glass', 'minimal'));

alter table public.lp_images
  add column if not exists media_type text not null default 'image'
    check (media_type in ('image', 'video'));
