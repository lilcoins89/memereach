-- Nested campaign workflow: Campaign -> Ad Set -> Ad.
create table if not exists ad_sets (
  id uuid primary key,
  campaign_id uuid not null references campaigns(id) on delete restrict,
  name text not null,
  audience_json jsonb not null default '{}',
  budget_cents bigint not null check (budget_cents > 0),
  bid_cents bigint not null check (bid_cents > 0),
  pricing_model text not null check (pricing_model in ('CPC','CPM')),
  start_at timestamptz not null,
  end_at timestamptz,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);
create table if not exists ad_set_placements (ad_set_id uuid references ad_sets(id) on delete restrict, placement_id uuid references ad_placements(id) on delete restrict, primary key (ad_set_id, placement_id));
create table if not exists ads (
  id uuid primary key,
  ad_set_id uuid not null references ad_sets(id) on delete restrict,
  name text not null,
  creative_type text not null check (creative_type in ('token_image','token_video','token_text','website_link')),
  headline text not null,
  body text not null,
  asset_url text,
  destination_url text,
  token_mint text not null,
  token_symbol text not null,
  disclosure boolean not null default true,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);
create index if not exists idx_ad_sets_campaign on ad_sets(campaign_id, status);
create index if not exists idx_ads_ad_set on ads(ad_set_id, status);
