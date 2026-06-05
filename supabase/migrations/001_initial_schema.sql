-- GardZen initial schema
-- Modeled from data/garden-inventory.json

create extension if not exists "uuid-ossp";

-- Gardeners (linked to Supabase Auth users)
create table if not exists gardeners (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

-- Gardens (a gardener can have multiple gardens)
create table if not exists gardens (
  id uuid primary key default uuid_generate_v4(),
  gardener_id uuid references gardeners(id) on delete cascade,
  name text not null,
  season text,
  dedication text,
  created_at timestamptz default now()
);

-- Beds / zones within a garden
create table if not exists beds (
  id uuid primary key default uuid_generate_v4(),
  garden_id uuid references gardens(id) on delete cascade,
  name text not null,
  type text check (type in ('raised','container','in-ground','pot')) default 'raised',
  notes text,
  created_at timestamptz default now()
);

-- Plant inventory
create table if not exists plants (
  id uuid primary key default uuid_generate_v4(),
  garden_id uuid references gardens(id) on delete cascade,
  bed_id uuid references beds(id) on delete set null,
  name text not null,
  type text not null,             -- herb, tomato, pepper, squash, melon, leafy-green, eggplant, etc.
  qty integer not null default 1,
  sun text check (sun in ('full','partial','shade')) default 'full',
  notes text,
  status text check (status in ('wishlist','planned','planted','growing','harvesting','done')) default 'planted',
  planted_at date,
  created_at timestamptz default now()
);

-- Garden supplies
create table if not exists supplies (
  id uuid primary key default uuid_generate_v4(),
  garden_id uuid references gardens(id) on delete cascade,
  item text not null,
  qty numeric,
  spec text,
  created_at timestamptz default now()
);

-- Journal entries (text notes + optional photo per plant/bed)
create table if not exists journal_entries (
  id uuid primary key default uuid_generate_v4(),
  garden_id uuid references gardens(id) on delete cascade,
  plant_id uuid references plants(id) on delete set null,
  bed_id uuid references beds(id) on delete set null,
  note text,
  photo_url text,
  created_at timestamptz default now()
);

-- AI vision diagnoses
create table if not exists diagnoses (
  id uuid primary key default uuid_generate_v4(),
  garden_id uuid references gardens(id) on delete cascade,
  plant_id uuid references plants(id) on delete set null,
  photo_url text not null,
  model text not null,            -- 'claude-haiku-vision' | 'qwen2.5-vl'
  label text,
  confidence numeric,
  advice text,
  raw_response jsonb,
  created_at timestamptz default now()
);

-- Tasks (watering, feeding, staking, etc.)
create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  garden_id uuid references gardens(id) on delete cascade,
  plant_id uuid references plants(id) on delete set null,
  bed_id uuid references beds(id) on delete set null,
  type text not null,             -- 'water','feed','stake','harvest','sow','transplant','other'
  title text not null,
  due_at timestamptz,
  status text check (status in ('pending','done','skipped')) default 'pending',
  created_at timestamptz default now()
);

-- Mindfulness check-ins
create table if not exists checkins (
  id uuid primary key default uuid_generate_v4(),
  gardener_id uuid references gardeners(id) on delete cascade,
  prompt text not null,
  tradition text,                 -- 'stoic' | 'buddhist' | 'spiritual'
  response text,
  streak_day integer default 1,
  created_at timestamptz default now()
);

-- RLS: users can only access their own data
alter table gardeners enable row level security;
alter table gardens enable row level security;
alter table beds enable row level security;
alter table plants enable row level security;
alter table supplies enable row level security;
alter table journal_entries enable row level security;
alter table diagnoses enable row level security;
alter table tasks enable row level security;
alter table checkins enable row level security;

-- RLS policies (simple: user owns their gardener row, cascades via joins)
create policy "gardeners: own row" on gardeners
  for all using (user_id = auth.uid());

create policy "gardens: via gardener" on gardens
  for all using (
    gardener_id in (select id from gardeners where user_id = auth.uid())
  );

create policy "beds: via garden" on beds
  for all using (
    garden_id in (
      select g.id from gardens g
      join gardeners gr on gr.id = g.gardener_id
      where gr.user_id = auth.uid()
    )
  );

create policy "plants: via garden" on plants
  for all using (
    garden_id in (
      select g.id from gardens g
      join gardeners gr on gr.id = g.gardener_id
      where gr.user_id = auth.uid()
    )
  );

create policy "supplies: via garden" on supplies
  for all using (
    garden_id in (
      select g.id from gardens g
      join gardeners gr on gr.id = g.gardener_id
      where gr.user_id = auth.uid()
    )
  );

create policy "journal_entries: via garden" on journal_entries
  for all using (
    garden_id in (
      select g.id from gardens g
      join gardeners gr on gr.id = g.gardener_id
      where gr.user_id = auth.uid()
    )
  );

create policy "diagnoses: via garden" on diagnoses
  for all using (
    garden_id in (
      select g.id from gardens g
      join gardeners gr on gr.id = g.gardener_id
      where gr.user_id = auth.uid()
    )
  );

create policy "tasks: via garden" on tasks
  for all using (
    garden_id in (
      select g.id from gardens g
      join gardeners gr on gr.id = g.gardener_id
      where gr.user_id = auth.uid()
    )
  );

create policy "checkins: own rows" on checkins
  for all using (
    gardener_id in (select id from gardeners where user_id = auth.uid())
  );
