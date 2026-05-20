-- Add brand_identity column to businesses
alter table public.businesses
  add column if not exists avatar_url text,
  add column if not exists brand_identity jsonb;

-- Supabase Storage bucket for brand assets
-- Run this in the Supabase dashboard → Storage → New bucket
-- Name: brand-assets, Public: true
-- OR run via SQL:
insert into storage.buckets (id, name, public)
values ('brand-assets', 'brand-assets', true)
on conflict (id) do nothing;

-- Storage policy: users can upload their own assets
create policy "brand_assets_upload" on storage.objects
  for insert with check (bucket_id = 'brand-assets' AND auth.uid()::text = (storage.foldername(name))[2]);

create policy "brand_assets_read" on storage.objects
  for select using (bucket_id = 'brand-assets');

create policy "brand_assets_update" on storage.objects
  for update using (bucket_id = 'brand-assets' AND auth.uid()::text = (storage.foldername(name))[2]);
