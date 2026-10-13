-- Revive-inspired delivery controls, implemented natively for MemeReach.
-- No Revive source code is copied or installed; these are off-chain product tables.
alter table campaigns add column if not exists delivery_rules jsonb not null default '{"frequencyCapPerHour":3,"dailyImpressionCap":100000,"allowedHoursUtc":[]}'::jsonb;
create table if not exists campaign_delivery_counters (
  campaign_id uuid references campaigns(id) on delete restrict,
  bucket_type text not null check (bucket_type in ('viewer_hour','campaign_day')),
  bucket_key text not null,
  impression_count bigint not null default 0 check (impression_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (campaign_id, bucket_type, bucket_key)
);
create index if not exists idx_delivery_counters_campaign_updated on campaign_delivery_counters(campaign_id, updated_at desc);
