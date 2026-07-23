-- Run in your Supabase SQL Editor

create table if not exists discord_links (
  discord_id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  username text not null,
  created_at timestamptz default now()
);

alter table discord_links enable row level security;

create policy "Public can read discord links"
  on discord_links for select using (true);

create policy "Anyone can insert discord links"
  on discord_links for insert with check (true);

create policy "Anyone can update discord links"
  on discord_links for update using (true);

create policy "Anyone can delete discord links"
  on discord_links for delete using (true);
