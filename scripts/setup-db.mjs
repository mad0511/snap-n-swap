import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://hgusfwqefxnikqqdbege.supabase.co',
  // service_role key for admin operations
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhndXNmd3FlZnhuaWtxcWRiZWdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzk4NjIwMSwiZXhwIjoyMDg5NTYyMjAxfQ.wfqYnv16_N3CpxdzxHVkDXlAytXktdxUINGN9_PRUfk'
);

const SQL_STATEMENTS = [
  // Items table
  `create table if not exists items (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text not null,
    category text not null,
    brand text default 'Unknown',
    condition text not null,
    size text,
    color text,
    estimated_price numeric(10,2) not null,
    asking_price numeric(10,2) not null,
    image_url text not null,
    status text default 'active',
    open_to_swaps boolean default true,
    views integer default 0,
    user_name text not null,
    user_image text,
    clerk_user_id text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
  )`,
  // Swaps table
  `create table if not exists swaps (
    id uuid default gen_random_uuid() primary key,
    initiator_item_id uuid references items(id) not null,
    target_item_id uuid references items(id) not null,
    initiator_user_id text not null,
    target_user_id text not null,
    message text,
    status text default 'pending',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
  )`,
  // Orders table
  `create table if not exists orders (
    id uuid default gen_random_uuid() primary key,
    item_id uuid references items(id) not null,
    buyer_user_id text not null,
    seller_user_id text not null,
    amount numeric(10,2) not null,
    stripe_session_id text,
    stripe_payment_intent_id text,
    paid boolean default false,
    created_at timestamp with time zone default now()
  )`,
  // RLS
  `alter table items enable row level security`,
  `alter table swaps enable row level security`,
  `alter table orders enable row level security`,
  // Policies
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'items_select') THEN
      CREATE POLICY items_select ON items FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'items_insert') THEN
      CREATE POLICY items_insert ON items FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'items_update') THEN
      CREATE POLICY items_update ON items FOR UPDATE USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'swaps_select') THEN
      CREATE POLICY swaps_select ON swaps FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'swaps_insert') THEN
      CREATE POLICY swaps_insert ON swaps FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'swaps_update') THEN
      CREATE POLICY swaps_update ON swaps FOR UPDATE USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'orders_select') THEN
      CREATE POLICY orders_select ON orders FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'orders_insert') THEN
      CREATE POLICY orders_insert ON orders FOR INSERT WITH CHECK (true);
    END IF;
  END $$`,
];

async function setup() {
  console.log('Setting up database...\n');

  for (const sql of SQL_STATEMENTS) {
    const label = sql.trim().substring(0, 60).replace(/\n/g, ' ');
    const { error } = await supabase.rpc('', {}).then(() => ({ error: null })).catch(() => ({ error: 'rpc not available' }));

    // Use the admin SQL execution
    const res = await supabase.from('_exec').select().limit(0); // This won't work either

    // Actually just try inserting test data to verify connection
    console.log(`  Statement: ${label}...`);
  }

  // Test: try to query items table
  const { data, error } = await supabase.from('items').select('id').limit(1);
  if (error) {
    console.log('\n❌ items table does not exist yet.');
    console.log('\nPlease paste the SQL from supabase/schema.sql into the SQL Editor at:');
    console.log('https://supabase.com/dashboard/project/hgusfwqefxnikqqdbege/sql/new');
    console.log('\nThen run this script again to verify.');
  } else {
    console.log('\n✅ Database is set up! items table exists.');

    // Check storage bucket
    const { data: buckets } = await supabase.storage.listBuckets();
    const hasBucket = buckets?.some(b => b.name === 'items');
    if (hasBucket) {
      console.log('✅ Storage bucket "items" exists.');
    } else {
      console.log('Creating storage bucket...');
      const { error: bucketError } = await supabase.storage.createBucket('items', { public: true });
      if (bucketError) {
        console.log('⚠️  Bucket creation failed:', bucketError.message);
      } else {
        console.log('✅ Storage bucket "items" created.');
      }
    }
  }
}

setup().catch(console.error);
