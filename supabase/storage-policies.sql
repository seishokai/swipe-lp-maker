insert into storage.buckets (id, name, public)
values ('lp-images', 'lp-images', true)
on conflict (id) do update set public = true;

create policy "Users can upload own LP images"
on storage.objects for insert
with check (
  bucket_id = 'lp-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update own LP images"
on storage.objects for update
using (
  bucket_id = 'lp-images'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'lp-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete own LP images"
on storage.objects for delete
using (
  bucket_id = 'lp-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Anyone can read LP images"
on storage.objects for select
using (bucket_id = 'lp-images');
