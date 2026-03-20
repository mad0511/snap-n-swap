-- Items table
create table if not exists items (
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
  status text default 'active' check (status in ('active', 'sold', 'swapped', 'removed')),
  open_to_swaps boolean default true,
  views integer default 0,
  user_name text not null,
  user_image text,
  clerk_user_id text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Swaps table
create table if not exists swaps (
  id uuid default gen_random_uuid() primary key,
  initiator_item_id uuid references items(id) not null,
  target_item_id uuid references items(id) not null,
  initiator_user_id text not null,
  target_user_id text not null,
  message text,
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected', 'completed')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Orders table
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  item_id uuid references items(id) not null,
  buyer_user_id text not null,
  seller_user_id text not null,
  amount numeric(10,2) not null,
  stripe_session_id text,
  stripe_payment_intent_id text,
  paid boolean default false,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table items enable row level security;
alter table swaps enable row level security;
alter table orders enable row level security;

-- Items policies: anyone can read active items, authenticated can insert
create policy "Anyone can view active items" on items for select using (status = 'active');
create policy "Anyone can insert items" on items for insert with check (true);
create policy "Anyone can update items" on items for update using (true);

-- Swaps policies
create policy "Anyone can view swaps" on swaps for select using (true);
create policy "Anyone can insert swaps" on swaps for insert with check (true);
create policy "Anyone can update swaps" on swaps for update using (true);

-- Orders policies
create policy "Anyone can view orders" on orders for select using (true);
create policy "Anyone can insert orders" on orders for insert with check (true);

-- Create storage bucket for item images
insert into storage.buckets (id, name, public) values ('items', 'items', true)
on conflict (id) do nothing;

-- Allow public access to item images
create policy "Anyone can view item images" on storage.objects for select using (bucket_id = 'items');
create policy "Anyone can upload item images" on storage.objects for insert with check (bucket_id = 'items');
