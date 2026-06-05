-- GardZen seed data — Summer 2026 garden from data/garden-inventory.json
-- Run AFTER 001_initial_schema.sql. Uses a demo user for local dev;
-- in production the app creates these rows after first sign-in.

-- Seed a demo garden (no auth.users dependency — for local Supabase Studio browsing)
do $$
declare
  v_garden_id uuid := uuid_generate_v4();
  v_bed_main   uuid := uuid_generate_v4();
  v_bed_pots   uuid := uuid_generate_v4();
  v_bed_brick  uuid := uuid_generate_v4();
begin

  -- Garden
  insert into gardens (id, gardener_id, name, season, dedication)
  values (
    v_garden_id,
    null,  -- no gardener linked; replaced when a user signs in
    'Chris & Bill''s Summer Garden',
    'Summer 2026',
    'In memory of Beatrice McCarthy — the family green thumb.'
  );

  -- Beds
  insert into beds (id, garden_id, name, type, notes) values
    (v_bed_main,  v_garden_id, 'Main Raised Bed',  'raised',    'Primary grow space'),
    (v_bed_pots,  v_garden_id, 'Planter Pots',     'pot',       '3 × 36" × 6-8" pots'),
    (v_bed_brick, v_garden_id, 'Brick Planter',    'raised',    'Above-ground brick enclosure');

  -- Plants — real Summer 2026 inventory
  insert into plants (garden_id, bed_id, name, type, qty, sun, notes, status) values
    (v_garden_id, v_bed_main, 'Sweet Banana Pepper',       'pepper',      3, 'full',    '',                                          'planted'),
    (v_garden_id, v_bed_main, 'Cantaloupe',                'melon',       4, 'full',    'needs space to vine',                       'planted'),
    (v_garden_id, v_bed_main, 'Sweet Basil (large)',       'herb',        1, 'full',    '',                                          'planted'),
    (v_garden_id, v_bed_main, 'Thai Basil',                'herb',        1, 'full',    '',                                          'planted'),
    (v_garden_id, v_bed_main, 'Purple Basil',              'herb',        1, 'full',    '',                                          'planted'),
    (v_garden_id, v_bed_main, 'Common Chive',              'herb',        1, 'partial', '',                                          'planted'),
    (v_garden_id, v_bed_main, 'Summer Squash',             'squash',      1, 'full',    '',                                          'planted'),
    (v_garden_id, v_bed_main, 'Common Squash',             'squash',      1, 'full',    '',                                          'planted'),
    (v_garden_id, v_bed_main, 'Charred Yellow Chard',      'leafy-green', 4, 'partial', '',                                          'planted'),
    (v_garden_id, v_bed_main, 'Cilantro',                  'herb',        2, 'partial', 'bolts in heat',                             'planted'),
    (v_garden_id, v_bed_main, 'Rosemary',                  'herb',        2, 'full',    'perennial',                                 'planted'),
    (v_garden_id, v_bed_main, 'Ping Tongue Long Eggplant', 'eggplant',    1, 'full',    'Japanese varietal',                         'planted'),
    (v_garden_id, v_bed_main, 'Sun Gold Tomato',           'tomato',      1, 'full',    'cherry, indeterminate — needs support',     'planted'),
    (v_garden_id, v_bed_main, 'Cherokee Purple Tomato',    'tomato',      1, 'full',    'heirloom, indeterminate — needs support',  'planted'),
    (v_garden_id, v_bed_main, 'Hungarian Black Pepper',    'pepper',      2, 'full',    '',                                          'planted');

  -- Wishlist
  insert into plants (garden_id, name, type, qty, status) values
    (v_garden_id, 'Beefsteak Tomato',          'tomato', 1, 'wishlist'),
    (v_garden_id, 'Roma Tomato',               'tomato', 1, 'wishlist'),
    (v_garden_id, 'Heirloom Tomato (assorted)','tomato', 1, 'wishlist');

  -- Supplies
  insert into supplies (garden_id, item, qty, spec) values
    (v_garden_id, 'Planter pots',                             3,  '36" x 6-8"'),
    (v_garden_id, 'Bricks (for above-ground planter)',        12, ''),
    (v_garden_id, 'Miracle-Gro raised bed soil (organic)',    2,  'bags'),
    (v_garden_id, 'Miracle-Gro standard organic soil',        1,  'bags'),
    (v_garden_id, 'Miracle-Gro standard non-organic soil',    2,  'bags'),
    (v_garden_id, 'Miracle-Gro plant food spray adapter',     1,  'food attached');

end $$;
