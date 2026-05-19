-- ============================================================
-- AdGenius AI — Supabase Schema
-- Ejecutar en: https://supabase.com/dashboard/project/aflgbaedasmivsectzvh/sql
-- ============================================================

-- PROFILES (extiende auth.users)
create table if not exists public.profiles (
  id            uuid references auth.users on delete cascade primary key,
  full_name     text,
  avatar_url    text,
  email         text,
  plan          text not null default 'free' check (plan in ('free', 'starter', 'pro', 'agency')),
  credits       integer not null default 20,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- BUSINESSES
create table if not exists public.businesses (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.profiles(id) on delete cascade not null,
  name            text not null,
  description     text not null,
  industry        text,
  target_audience text,
  tone            text,
  value_prop      text,
  pain_points     text[],
  benefits        text[],
  differentiators text[],
  competitors     text[],
  website         text,
  created_at      timestamptz not null default now()
);

-- CAMPAIGNS
create table if not exists public.campaigns (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references public.profiles(id) on delete cascade not null,
  business_id    uuid references public.businesses(id) on delete set null,
  name           text,
  objective      text,
  platforms      text[],
  status         text not null default 'draft',
  brief          jsonb,
  analysis       jsonb,
  ideas          jsonb,
  selected_idea  jsonb,
  created_at     timestamptz not null default now()
);

-- CONTENT PIECES
create table if not exists public.content_pieces (
  id             uuid primary key default gen_random_uuid(),
  campaign_id    uuid references public.campaigns(id) on delete set null,
  user_id        uuid references public.profiles(id) on delete cascade not null,
  type           text not null,
  platform       text,
  format         text,
  headline       text,
  body           text,
  cta            text,
  caption        text,
  hashtags       text[],
  image_prompt   text,
  image_url      text,
  video_script   jsonb,
  video_url      text,
  storyboard     jsonb,
  quality_score  integer check (quality_score >= 0 and quality_score <= 100),
  feedback       text,
  created_at     timestamptz not null default now()
);

-- CREDIT TRANSACTIONS
create table if not exists public.credit_transactions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.profiles(id) on delete cascade not null,
  type            text not null check (type in ('consume', 'purchase', 'bonus')),
  amount          integer not null,
  action          text,
  content_id      uuid,
  balance_after   integer not null,
  mp_payment_id   text,
  created_at      timestamptz not null default now()
);

-- SUBSCRIPTIONS
create table if not exists public.subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid references public.profiles(id) on delete cascade not null,
  plan                   text not null,
  status                 text not null default 'active',
  credits_monthly        integer,
  mp_subscription_id     text,
  current_period_start   timestamptz,
  current_period_end     timestamptz,
  created_at             timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.campaigns enable row level security;
alter table public.content_pieces enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.subscriptions enable row level security;

-- Policies: cada usuario solo accede a sus propios datos
create policy "profiles_own" on public.profiles for all using (auth.uid() = id);
create policy "businesses_own" on public.businesses for all using (auth.uid() = user_id);
create policy "campaigns_own" on public.campaigns for all using (auth.uid() = user_id);
create policy "content_own" on public.content_pieces for all using (auth.uid() = user_id);
create policy "transactions_own" on public.credit_transactions for all using (auth.uid() = user_id);
create policy "subscriptions_own" on public.subscriptions for all using (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: crear perfil automáticamente al registrarse
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, credits)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    20
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- ÍNDICES
-- ============================================================
create index if not exists idx_businesses_user on public.businesses(user_id);
create index if not exists idx_campaigns_user on public.campaigns(user_id);
create index if not exists idx_content_user on public.content_pieces(user_id);
create index if not exists idx_content_campaign on public.content_pieces(campaign_id);
create index if not exists idx_transactions_user on public.credit_transactions(user_id);
create index if not exists idx_content_created on public.content_pieces(created_at desc);
