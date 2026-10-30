-- supabase/migrations/0001_core.sql
-- AinA (Ai∩A MAXX) — Core PostgreSQL Schema with Row-Level Security (RLS)

create extension if not exists pgcrypto;

-- Domain Enums
do $$ begin
  create type public.goal_status as enum ('active','paused','completed','archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.roadmap_status as enum ('draft','active','completed','archived','failed_generation');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.task_status as enum ('pending','completed','skipped','rest_day');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.consent_state as enum ('granted','withdrawn','denied','expired');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.ai_interaction_status as enum ('started','succeeded','rejected_schema','rejected_safety','provider_error','timed_out','fallback_used');
exception when duplicate_object then null;
end $$;

-- 1. Profiles
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(display_name) between 1 and 60),
  locale text not null default 'en' check (locale in ('en','bn')),
  timezone text not null default 'Asia/Dhaka',
  birth_date date,
  adult_access_enabled boolean not null default false,
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Consent Records (PDPA 2026 Compliant)
create table if not exists public.consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  purpose text not null check (purpose in ('essential_account','photo_processing','health_related_personalization','marketing','community_publication','model_training')),
  state public.consent_state not null,
  policy_version text not null,
  method text not null,
  evidence jsonb not null default '{}'::jsonb,
  granted_at timestamptz,
  withdrawn_at timestamptz,
  created_at timestamptz not null default now(),
  check ((state <> 'granted') or granted_at is not null)
);
create index if not exists consent_user_purpose_idx on public.consent_records(user_id, purpose, created_at desc);

-- 3. User Preferences
create table if not exists public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  currency_code char(3) not null default 'BDT',
  budget_tier text not null default 'budget' check (budget_tier in ('budget','mid','premium')),
  available_minutes smallint not null default 15 check (available_minutes between 5 and 180),
  goals jsonb not null default '[]'::jsonb,
  style_preferences jsonb not null default '{}'::jsonb,
  reminder_preferences jsonb not null default '{"enabled":false,"quietHours":true}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 4. User Goals
create table if not exists public.user_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null check (category in ('skin','hair','fitness','food','fashion','grooming','habit')),
  goal_key text not null,
  title text not null check (char_length(title) <= 120),
  status public.goal_status not null default 'active',
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists user_goals_user_status_idx on public.user_goals(user_id, status);

-- 5. Roadmaps
create table if not exists public.roadmaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  summary text not null default '',
  duration_days smallint not null default 30 check (duration_days between 7 and 90),
  status public.roadmap_status not null default 'draft',
  generation_source text not null default 'ai' check (generation_source in ('ai','curated','manual')),
  model_id text,
  prompt_version text,
  output_schema_version text not null default 'roadmap.v1',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists roadmaps_user_created_idx on public.roadmaps(user_id, created_at desc);

-- 6. Roadmap Tasks
create table if not exists public.roadmap_tasks (
  id uuid primary key default gen_random_uuid(),
  roadmap_id uuid not null references public.roadmaps(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  day_index smallint not null check (day_index between 1 and 90),
  category text not null check (category in ('skin','hair','fitness','food','fashion','grooming','habit')),
  title text not null check (char_length(title) between 3 and 120),
  instructions text not null check (char_length(instructions) <= 2000),
  estimated_minutes smallint not null default 10 check (estimated_minutes between 1 and 180),
  is_rest_day boolean not null default false,
  needs_professional boolean not null default false,
  safety_note text,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  unique(roadmap_id, day_index, sort_order)
);
create index if not exists roadmap_tasks_user_day_idx on public.roadmap_tasks(user_id, day_index);

-- 7. Task Completions
create table if not exists public.task_completions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.roadmap_tasks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.task_status not null,
  completed_at timestamptz,
  local_day date not null,
  note text check (char_length(note) <= 500),
  created_at timestamptz not null default now(),
  unique(task_id, user_id, local_day)
);
create index if not exists task_completions_user_day_idx on public.task_completions(user_id, local_day desc);

-- 8. Weekly Check-Ins
create table if not exists public.weekly_check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  roadmap_id uuid references public.roadmaps(id) on delete set null,
  week_start date not null,
  energy_rating smallint check (energy_rating between 1 and 5),
  helpfulness_rating smallint check (helpfulness_rating between 1 and 5),
  free_text text check (char_length(free_text) <= 1000),
  adjustments jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(user_id, week_start)
);

-- 9. Photo Assets (Private storage only, short-lived signed URLs)
create table if not exists public.photo_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null unique,
  purpose text not null check (purpose in ('skin_guidance','hair_guidance','private_progress')),
  consent_record_id uuid references public.consent_records(id) on delete restrict,
  state text not null default 'uploaded' check (state in ('uploaded','processing','ready','deletion_pending','deleted','failed')),
  mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp')),
  byte_size bigint not null check (byte_size > 0 and byte_size <= 10485760),
  captured_at timestamptz,
  expires_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists photo_assets_user_created_idx on public.photo_assets(user_id, created_at desc);

-- 10. AI Interactions (Telemetry & Credit Audit)
create table if not exists public.ai_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  feature text not null check (feature in ('roadmap','coach','skin_guidance','hair_guidance','moderation','catalog_copy','cutout')),
  provider text not null default 'meta_model_api',
  model_id text not null,
  prompt_version text not null,
  schema_version text,
  status public.ai_interaction_status not null default 'started',
  latency_ms integer,
  input_tokens integer,
  output_tokens integer,
  estimated_cost numeric(12,6),
  safety_flags text[] not null default '{}',
  request_id text,
  created_at timestamptz not null default now()
);
create index if not exists ai_interactions_user_created_idx on public.ai_interactions(user_id, created_at desc);

-- 11. XP Events (Append-only Ledger with Idempotency)
create table if not exists public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_key text not null,
  source_type text not null,
  source_id uuid,
  xp_delta integer not null check (xp_delta between 0 and 100),
  local_day date not null,
  idempotency_key text not null unique,
  created_at timestamptz not null default now()
);
create index if not exists xp_events_user_day_idx on public.xp_events(user_id, local_day desc);

-- 12. User Streaks
create table if not exists public.user_streaks (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  current_streak integer not null default 0 check (current_streak >= 0),
  longest_streak integer not null default 0 check (longest_streak >= 0),
  last_qualified_local_day date,
  freeze_tokens smallint not null default 0 check (freeze_tokens between 0 and 10),
  updated_at timestamptz not null default now()
);

-- 13. Products (Curated with BDT Pricing)
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  brand text,
  category text not null check (category in ('skincare','haircare','grooming','fashion','fitness','food','accessory','other')),
  description text not null default '',
  ingredients jsonb,
  currency_code char(3) not null default 'BDT',
  current_price numeric(12,2) check (current_price >= 0),
  stock_status text not null default 'unknown' check (stock_status in ('available','limited','out_of_stock','unknown')),
  seller_name text,
  product_url text,
  image_path text,
  is_affiliate boolean not null default false,
  is_sponsored boolean not null default false,
  is_published boolean not null default false,
  price_checked_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_category_published_idx on public.products(category, is_published);

-- 14. Routine Templates
create table if not exists public.routine_templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null check (category in ('skin','hair','fitness','food','fashion','grooming','habit')),
  locale text not null default 'en' check (locale in ('en','bn')),
  budget_tier text not null default 'budget' check (budget_tier in ('budget','mid','premium')),
  content text not null,
  safety_notes text,
  reviewed_by text,
  reviewed_at timestamptz,
  version integer not null default 1,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 15. Routine Steps
create table if not exists public.routine_steps (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routine_templates(id) on delete cascade,
  step_order smallint not null,
  title text not null,
  instructions text not null,
  time_of_day text check (time_of_day in ('morning','day','evening','anytime')),
  estimated_minutes smallint not null default 5 check (estimated_minutes between 1 and 180),
  created_at timestamptz not null default now(),
  unique(routine_id, step_order)
);

-- 16. Routine Products (Join Table)
create table if not exists public.routine_products (
  routine_id uuid not null references public.routine_templates(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  purpose text not null default 'recommended',
  sort_order smallint not null default 0,
  primary key (routine_id, product_id)
);

-- 17. Community Posts
create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 3000),
  visibility text not null default 'public' check (visibility in ('private','followers','group','public')),
  status text not null default 'pending' check (status in ('pending','published','hidden','removed')),
  moderation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists community_posts_feed_idx on public.community_posts(status, created_at desc);
create index if not exists community_posts_user_idx on public.community_posts(user_id, created_at desc);

-- 18. Community Comments
create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1200),
  status text not null default 'published' check (status in ('pending','published','hidden','removed')),
  created_at timestamptz not null default now()
);
create index if not exists comments_post_created_idx on public.community_comments(post_id, created_at);

-- 19. Post Reactions
create table if not exists public.post_reactions (
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction text not null default 'like' check (reaction in ('like','helpful','support')),
  created_at timestamptz not null default now(),
  primary key(post_id, user_id, reaction)
);

-- 20. User Blocks
create table if not exists public.user_blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(blocker_id, blocked_id),
  check(blocker_id <> blocked_id)
);

-- 21. Content Reports
create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('post','comment','profile','product','advisor')),
  target_id uuid not null,
  reason text not null,
  details text check (char_length(details) <= 1500),
  status text not null default 'open' check (status in ('open','triaged','actioned','dismissed','appealed','closed')),
  assigned_to uuid references public.profiles(id) on delete set null,
  resolution text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index if not exists reports_status_created_idx on public.content_reports(status, created_at);

-- 22. Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  notification_type text not null,
  title text not null,
  body text not null,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);

-- 23. Audit Events
create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  request_id text,
  safe_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_events_created_idx on public.audit_events(created_at desc);

-- 24. Digital Wardrobe Items (AinA Drip & SAM 3.1 Cutouts)
create table if not exists public.wardrobe_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null check (category in ('top','bottom','footwear','outerwear','accessory','traditional')),
  color text,
  brand text,
  image_path text not null,
  cutout_path text,
  season text default 'all',
  usage_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists wardrobe_items_user_idx on public.wardrobe_items(user_id, created_at desc);

-- 25. Outfits (3D Lookbook)
create table if not exists public.outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  occasion text not null default 'everyday',
  season text default 'all',
  notes text,
  is_curated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 26. Outfit Items
create table if not exists public.outfit_items (
  outfit_id uuid not null references public.outfits(id) on delete cascade,
  wardrobe_item_id uuid not null references public.wardrobe_items(id) on delete cascade,
  layer_order smallint not null default 0,
  primary key (outfit_id, wardrobe_item_id)
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

alter table public.profiles enable row level security;
alter table public.consent_records enable row level security;
alter table public.user_preferences enable row level security;
alter table public.user_goals enable row level security;
alter table public.roadmaps enable row level security;
alter table public.roadmap_tasks enable row level security;
alter table public.task_completions enable row level security;
alter table public.weekly_check_ins enable row level security;
alter table public.photo_assets enable row level security;
alter table public.ai_interactions enable row level security;
alter table public.xp_events enable row level security;
alter table public.user_streaks enable row level security;
alter table public.products enable row level security;
alter table public.routine_templates enable row level security;
alter table public.routine_steps enable row level security;
alter table public.routine_products enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;
alter table public.post_reactions enable row level security;
alter table public.user_blocks enable row level security;
alter table public.content_reports enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_events enable row level security;
alter table public.wardrobe_items enable row level security;
alter table public.outfits enable row level security;
alter table public.outfit_items enable row level security;

-- Owner isolation policies for authenticated users
create policy "profile_owner_select" on public.profiles
  for select to authenticated using (id = auth.uid());

create policy "consent_owner_select" on public.consent_records
  for select to authenticated using (user_id = auth.uid());

create policy "preferences_owner_all" on public.user_preferences
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "goals_owner_all" on public.user_goals
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "roadmaps_owner_all" on public.roadmaps
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "tasks_owner_all" on public.roadmap_tasks
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "completions_owner_all" on public.task_completions
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "check_ins_owner_all" on public.weekly_check_ins
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "photo_owner_all" on public.photo_assets
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "xp_owner_select" on public.xp_events
  for select to authenticated using (user_id = auth.uid());

create policy "streaks_owner_select" on public.user_streaks
  for select to authenticated using (user_id = auth.uid());

create policy "wardrobe_owner_all" on public.wardrobe_items
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "outfits_owner_all" on public.outfits
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Publicly accessible curated catalogs and routines
create policy "products_public_select" on public.products
  for select to anon, authenticated using (is_published = true);

create policy "routines_public_select" on public.routine_templates
  for select to anon, authenticated using (is_published = true);

create policy "routine_steps_public_select" on public.routine_steps
  for select to anon, authenticated using (true);

create policy "routine_products_public_select" on public.routine_products
  for select to anon, authenticated using (true);

-- Community feeds
create policy "community_posts_published_select" on public.community_posts
  for select to anon, authenticated using (status = 'published');

create policy "community_posts_owner_write" on public.community_posts
  for insert to authenticated with check (user_id = auth.uid());
